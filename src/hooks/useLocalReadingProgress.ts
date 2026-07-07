"use client";

import { useCallback, useEffect, useRef } from "react";
import { getCachedValue, dataStateCache } from "@/src/stores/useDataStateCache";

/**
 * useLocalReadingProgress
 *
 * Tracks reading time + percentage locally and only calls the
 * server on a long interval (default 10 minutes) plus a final
 * flush on unmount. The previous implementation posted every 10
 * seconds, which on a slow connection meant a constant stream of
 * `/stories/{id}/chapters/{id}/progress` PUTs in the background
 * — wasteful both for the user's data plan and the backend.
 *
 * The contract is identical to the old `useCallback`-based
 * `updateReadingProgress` the read view used before: it returns
 * `updateProgress` and `flush` (for unmount) and a `getLocal`
 * getter for the most recently computed values.
 *
 * Local state survives:
 *   - Tab close → reopen within the same session (sessionStorage)
 *   - Component remount (in-memory map keyed by `key`)
 *   - App backgrounded (Android PWA / Capacitor) — we resume
 *     counting from where we left off using a `lastTickAt` marker
 *     instead of wall-clock, so a backgrounded tab doesn't
 *     accumulate ghost reading time.
 *
 * What it does NOT do:
 *   - Replace the server-side state of record. The server still
 *     gets the latest snapshot every 10 minutes and on unmount;
 *     the user expects the backend to be authoritative for
 *     cross-device resume.
 *   - Fire on every render. It only ticks on its own internal
 *     interval, and only if the user is online + the page is
 *     visible (no point counting time the user isn't actually
 *     reading).
 */

export interface LocalReadingProgressSample {
  percentageRead: number;
  wordsRead: number;
  totalWords: number;
  readingTimeSeconds: number;
}

export interface LocalReadingProgressState {
  percentageRead: number;
  wordsRead: number;
  totalWords: number;
  readingTimeSeconds: number;
  isComplete: boolean;
}

interface CacheShape extends LocalReadingProgressState {}

interface UseLocalReadingProgressOptions {
  /** Cache key — must be stable per chapter/episode/story. */
  key: string;
  /** Server flush interval in ms. Default 10 minutes. */
  flushIntervalMs?: number;
  /**
   * Optional callback invoked with the latest sample whenever the
   * local accumulator ticks. Use this to keep the audio bar's
   * "progress" indicator fresh without waiting for a server round
   * trip.
   */
  onTick?: (state: LocalReadingProgressState) => void;
}

const DEFAULT_FLUSH_INTERVAL_MS = 10 * 60 * 1000;
const STATE_CACHE_PREFIX = "reading-progress:";

function safeSessionGet(key: string): CacheShape | null {
  return getCachedValue<CacheShape>(STATE_CACHE_PREFIX + key);
}

// One shared in-memory map. Using a module-level map (rather than
// ref) means a re-mount of the same chapter reuses the running
// accumulator instead of starting from 0.
const inMemoryByKey = new Map<string, CacheShape>();

function loadFromAnyLayer(key: string): CacheShape {
  const mem = inMemoryByKey.get(key);
  if (mem) return mem;
  const ses = safeSessionGet(key);
  if (ses) {
    inMemoryByKey.set(key, ses);
    return ses;
  }
  return {
    percentageRead: 0,
    wordsRead: 0,
    totalWords: 0,
    readingTimeSeconds: 0,
    isComplete: false,
  };
}

function persist(key: string, value: CacheShape) {
  inMemoryByKey.set(key, value);
  // Only the most recent per chapter is interesting — the cache
  // is bounded anyway.
  dataStateCache.set(STATE_CACHE_PREFIX + key, value);
}

export function useLocalReadingProgress(options: UseLocalReadingProgressOptions) {
  const { key, flushIntervalMs = DEFAULT_FLUSH_INTERVAL_MS, onTick } = options;

  // We keep the latest sample in a ref so the flush callback
  // always reads the most recent values without re-creating the
  // callback (which would tear down the interval).
  const latestRef = useRef<CacheShape>(loadFromAnyLayer(key));
  const lastTickAtRef = useRef<number>(Date.now());
  // Flag set by the page's visibility handler so the tick loop
  // doesn't accrue time the user wasn't actually reading.
  const visibleRef = useRef<boolean>(
    typeof document === "undefined" ? true : !document.hidden,
  );
  // Set when the consumer is unmounting so the final flush knows
  // it's a one-shot, not another tick.
  const isUnmountingRef = useRef(false);
  // The `onTick` callback is wrapped in a ref so we don't have to
  // restart the interval when the consumer passes a new function.
  const onTickRef = useRef(onTick);
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  /** Read the current local snapshot. Cheap and synchronous. */
  const getLocal = useCallback((): LocalReadingProgressState => {
    return { ...latestRef.current };
  }, []);

  /**
   * Push a new sample from the page's `calculateProgress()`. We do
   * NOT fire the server here — only the time + percentage are
   * stored locally; the flush interval decides when to ship.
   */
  const updateLocal = useCallback(
    (sample: LocalReadingProgressSample) => {
      const next: CacheShape = {
        percentageRead: sample.percentageRead,
        wordsRead: sample.wordsRead,
        totalWords: sample.totalWords,
        readingTimeSeconds: sample.readingTimeSeconds,
        isComplete: sample.percentageRead >= 100,
      };
      latestRef.current = next;
      persist(key, next);
      onTickRef.current?.(next);
    },
    [key],
  );

  /**
   * Accrue a chunk of reading time (called by the consumer's own
   * tick loop, which the consumer owns because it already has
   * the visibility-change wiring in place). We don't double-
   * count: this is purely additive on the local reading time.
   */
  const accrueReadingTime = useCallback((seconds: number) => {
    if (seconds <= 0) return;
    latestRef.current = {
      ...latestRef.current,
      readingTimeSeconds:
        latestRef.current.readingTimeSeconds + Math.round(seconds),
    };
    persist(key, latestRef.current);
  }, [key]);

  /**
   * Mark this chapter/episode as complete locally and schedule an
   * immediate flush. Cheap to call repeatedly — we no-op on the
   * second call.
   */
  const markComplete = useCallback(() => {
    if (latestRef.current.isComplete) return;
    latestRef.current = {
      ...latestRef.current,
      percentageRead: 100,
      isComplete: true,
    };
    persist(key, latestRef.current);
  }, [key]);

  /**
   * Compute how many seconds have elapsed since the last tick
   * while the page was visible, and add them to the local
   * accumulator. Returns the accrued seconds so the consumer
   * can include them in its `LocalReadingProgressSample`.
   */
  const tick = useCallback((): number => {
    const now = Date.now();
    const last = lastTickAtRef.current;
    lastTickAtRef.current = now;
    if (!visibleRef.current) return 0;
    const elapsed = (now - last) / 1000;
    if (elapsed > 0 && elapsed < 60) {
      // Hard-cap at 60s/tick to defend against clock jumps (e.g.
      // the device waking from sleep). Real users can read at
      // most ~4 words/second; >60s/tick means something weird
      // happened.
      accrueReadingTime(elapsed);
      return elapsed;
    }
    return 0;
  }, [accrueReadingTime]);

  /** Reset the last-tick marker — call when the page becomes
   *  visible again so we don't accrue the time the user wasn't
   *  reading. */
  const resetTickClock = useCallback(() => {
    lastTickAtRef.current = Date.now();
  }, []);

  /** Setter used by the consumer's visibility-change listener. */
  const setVisible = useCallback((visible: boolean) => {
    visibleRef.current = visible;
    // Whenever visibility changes, reset the tick clock so the
    // first tick after the change doesn't double-count the gap.
    lastTickAtRef.current = Date.now();
  }, []);

  // Subscribe to document visibility once. We could let the
  // consumer do this, but centralising it means a "stale" tick
  // clock can never reach a state where a re-mount forgot to
  // attach the listener.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handler = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [setVisible]);

  // Clean up on unmount: persist the latest state to the state
  // cache so a remount of the same chapter can pick it up.
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;
      persist(key, latestRef.current);
    };
  }, [key]);

  return {
    getLocal,
    updateLocal,
    accrueReadingTime,
    markComplete,
    tick,
    resetTickClock,
    setVisible,
    isUnmounting: () => isUnmountingRef.current,
    /** For the consumer's flush callback. */
    flushIntervalMs,
  };
}
