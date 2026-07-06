"use client";

/**
 * usePageInflight
 *
 * Thin React wrapper around `inflightRequestRegistry`. Provides
 * a stable `pageId` (auto-generated per mount) and an
 * `onCleanup` registration helper, so the consumer can do:
 *
 *   const { track, cleanup } = usePageInflight("read-view");
 *
 *   useEffect(() => {
 *     const controller = new AbortController();
 *     track(controller);
 *     doFetch(controller.signal);
 *     return () => cleanup(controller);
 *   }, [...]);
 *
 * On unmount, all controllers tracked by this page are aborted
 * automatically — even ones the consumer forgot to clean up
 * individually. The `pageId` defaults to the caller's name + a
 * unique per-mount id, so two simultaneous mounts of the same
 * page (e.g. a layout + a child) don't trample each other.
 */

import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import {
  cancelPageInflight,
  registerInflight,
  unregisterInflight,
} from "./inflightRequestRegistry";

export interface UsePageInflightOptions {
  /** Override the page id. Defaults to `name + useId()`. */
  pageId?: string;
  /** Disable auto-cleanup on unmount. Off by default. */
  skipAutoCleanup?: boolean;
}

export interface UsePageInflightResult {
  /** Stable page id for this component's mount. */
  pageId: string;
  /** Register a controller so it'll be aborted on unmount. */
  track: (controller: AbortController) => void;
  /** Unregister a controller (e.g. after the request settled). */
  cleanup: (controller: AbortController) => void;
  /** Cancel every controller tracked on this page. */
  cancelAll: () => void;
}

export function usePageInflight(
  name = "page",
  options: UsePageInflightOptions = {},
): UsePageInflightResult {
  const reactId = useId();
  // We use a ref so the pageId is stable across renders — the
  // consumer's `useEffect` deps need a value they can compare
  // by reference.
  const pageId = useMemo(
    () => options.pageId ?? `${name}:${reactId}`,
    [name, options.pageId, reactId],
  );

  const track = useCallback(
    (controller: AbortController) => registerInflight(pageId, controller),
    [pageId],
  );

  const cleanup = useCallback(
    (controller: AbortController) => unregisterInflight(pageId, controller),
    [pageId],
  );

  const cancelAll = useCallback(() => cancelPageInflight(pageId), [pageId]);

  // Auto-cleanup on unmount. We track whether we've already
  // cancelled to avoid double-aborting if the consumer's own
  // cleanup also runs.
  const cancelledRef = useRef(false);
  useEffect(() => {
    if (options.skipAutoCleanup) return;
    return () => {
      if (cancelledRef.current) return;
      cancelledRef.current = true;
      cancelPageInflight(pageId);
    };
  }, [pageId, options.skipAutoCleanup]);

  return { pageId, track, cleanup, cancelAll };
}
