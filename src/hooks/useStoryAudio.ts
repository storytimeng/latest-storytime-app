"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchStoryAudio,
  type StoryAudioManifest,
  type StoryAudioSegment,
} from "@/src/lib/storyAudio";
import { useTTSStore, formatDuration } from "@/src/stores/useTTSStore";

interface UseStoryAudioOptions {
  storyId: string;
  chapterId?: string | null;
  episodeId?: string | null;
  enabled?: boolean;
}

export function useStoryAudio({
  storyId,
  chapterId,
  episodeId,
  enabled = true,
}: UseStoryAudioOptions) {
  const store = useTTSStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const segmentsRef = useRef<StoryAudioSegment[]>([]);
  const segmentIndexRef = useRef(0);
  const elapsedOffsetRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [manifest, setManifest] = useState<StoryAudioManifest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const updateElapsed = useCallback(() => {
    const audio = audioRef.current;
    const segments = segmentsRef.current;
    const currentSegment = segments[segmentIndexRef.current];
    const base = elapsedOffsetRef.current;
    const current = audio?.currentTime ?? 0;
    const elapsed = base + current;
    store.setElapsedSeconds(Math.floor(elapsed));

    if (manifest?.totalDurationSeconds) {
      const progress = Math.min(
        100,
        (elapsed / manifest.totalDurationSeconds) * 100,
      );
      void progress;
    }

    if (currentSegment) {
      const sentenceEstimate = Math.floor(
        (elapsed / Math.max(manifest?.totalDurationSeconds || 1, 1)) *
          Math.max(store.totalSentences, 1),
      );
      store.setCurrentSentenceIndex(
        Math.min(
          Math.max(sentenceEstimate, 0),
          Math.max(store.totalSentences - 1, 0),
        ),
      );
    }
  }, [manifest?.totalDurationSeconds, store]);

  const stopPlayback = useCallback(() => {
    clearProgressTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    segmentIndexRef.current = 0;
    elapsedOffsetRef.current = 0;
    store.stop();
    store.setElapsedSeconds(0);
  }, [clearProgressTimer, store]);

  const playSegment = useCallback(
    async (index: number) => {
      const segments = segmentsRef.current;
      const segment = segments[index];
      if (!segment) {
        stopPlayback();
        return;
      }

      segmentIndexRef.current = index;
      const audio = new Audio(segment.url);
      audio.playbackRate = store.playbackRate;
      audio.volume = store.volume;
      audioRef.current = audio;

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Audio playback failed"));
        void audio.play().catch(reject);
      }).catch(() => {
        stopPlayback();
        setError("Playback failed. Please try again.");
      });

      if (!audioRef.current) return;

      elapsedOffsetRef.current += segment.durationSeconds;

      if (index < segments.length - 1) {
        await playSegment(index + 1);
        return;
      }

      stopPlayback();
    },
    [stopPlayback, store.playbackRate, store.volume],
  );

  const loadManifest = useCallback(async () => {
    if (!enabled || !storyId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchStoryAudio({
        storyId,
        chapterId,
        episodeId,
      });

      setManifest(result);

      if (result.status === "pending") {
        clearPollTimer();
        pollTimerRef.current = setTimeout(() => {
          void loadManifest();
        }, 2500);
        return;
      }

      if (result.status === "unavailable") {
        setError(result.message || "Human narration is unavailable.");
        return;
      }

      if (result.status === "failed") {
        setError(result.message || "Unable to prepare narration.");
        return;
      }

      segmentsRef.current = [...result.segments].sort(
        (a, b) => a.order - b.order,
      );
      store.setEstimatedDuration(result.totalDurationSeconds);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load narration audio.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [chapterId, clearPollTimer, enabled, episodeId, storyId, store]);

  const play = useCallback(async () => {
    if (!segmentsRef.current.length) {
      await loadManifest();
    }

    if (!segmentsRef.current.length) {
      setError("Narration is not ready yet.");
      return;
    }

    stopPlayback();
    store.play();
    clearProgressTimer();
    progressTimerRef.current = setInterval(updateElapsed, 250);

    try {
      await playSegment(0);
    } catch {
      stopPlayback();
    }
  }, [
    clearProgressTimer,
    loadManifest,
    playSegment,
    stopPlayback,
    store,
    updateElapsed,
  ]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    store.pause();
    clearProgressTimer();
  }, [clearProgressTimer, store]);

  const resume = useCallback(async () => {
    if (!audioRef.current && segmentsRef.current.length > 0) {
      await playSegment(segmentIndexRef.current);
      return;
    }

    await audioRef.current?.play();
    store.play();
    clearProgressTimer();
    progressTimerRef.current = setInterval(updateElapsed, 250);
  }, [clearProgressTimer, playSegment, store, updateElapsed]);

  const seek = useCallback(
    async (seconds: number) => {
      const segments = segmentsRef.current;
      if (!segments.length || !manifest?.totalDurationSeconds) return;

      const target = Math.max(
        0,
        Math.min(seconds, manifest.totalDurationSeconds),
      );
      let accumulated = 0;

      for (let index = 0; index < segments.length; index += 1) {
        const next = accumulated + segments[index].durationSeconds;
        if (target <= next) {
          stopPlayback();
          segmentIndexRef.current = index;
          elapsedOffsetRef.current = accumulated;
          store.play();
          clearProgressTimer();
          progressTimerRef.current = setInterval(updateElapsed, 250);

          const audio = new Audio(segments[index].url);
          audio.playbackRate = store.playbackRate;
          audio.volume = store.volume;
          audio.currentTime = Math.max(0, target - accumulated);
          audioRef.current = audio;
          audio.onended = () => {
            void playSegment(index + 1);
          };
          await audio.play();
          return;
        }
        accumulated = next;
      }
    },
    [
      clearProgressTimer,
      manifest?.totalDurationSeconds,
      playSegment,
      stopPlayback,
      store,
      updateElapsed,
    ],
  );

  useEffect(() => {
    if (!enabled) {
      stopPlayback();
      clearPollTimer();
      return;
    }

    stopPlayback();
    segmentsRef.current = [];
    setManifest(null);
    void loadManifest();

    return () => {
      stopPlayback();
      clearPollTimer();
    };
  }, [
    chapterId,
    clearPollTimer,
    enabled,
    episodeId,
    loadManifest,
    stopPlayback,
    storyId,
  ]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = store.playbackRate;
      audioRef.current.volume = store.volume;
    }
  }, [store.playbackRate, store.volume]);

  return {
    manifest,
    isLoading,
    error,
    isReady: manifest?.status === "ready" && segmentsRef.current.length > 0,
    play,
    pause,
    resume,
    stop: stopPlayback,
    seek,
    formatDuration,
  };
}
