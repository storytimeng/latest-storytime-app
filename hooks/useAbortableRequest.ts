"use client";

/**
 * useAbortableRequest
 *
 * A tiny helper that wraps a `run` callback with an
 * `AbortController` whose signal is forwarded into the call. The
 * controller is automatically aborted on unmount, so any
 * in-flight HTTP request (typically a generated Hey API client
 * call that accepts an AbortSignal) is cancelled instead of
 * being allowed to outlive the page.
 *
 * Why this exists:
 *   The reading-progress hooks accept an `{ signal }` option that
 *   gets forwarded into the underlying fetch. A naive caller
 *   would have to wire up its own `useEffect` cleanup, an
 *   `AbortController` per call, and a `useRef` to keep the
 *   controller across re-renders. Centralising that here keeps
 *   call sites small and correct.
 *
 * Usage:
 *   const { run, abort } = useAbortableRequest();
 *
 *   // Fire-and-forget; aborts on unmount automatically:
 *   run(async (signal) => {
 *     await updateProgress(payload, { signal });
 *   });
 *
 *   // Manual abort (e.g. user closes the reader manually):
 *   abort();
 */

import { useCallback, useEffect, useRef } from "react";

export interface AbortableRun<T> {
  /** AbortSignal — pass to fetch-style APIs. */
  signal: AbortSignal;
}

export type AbortableTask<T> = (args: AbortableRun<T>) => Promise<T>;

export interface UseAbortableRequestResult {
  /** Run a task with a fresh controller. Aborts any in-flight
   *  task first. */
  run: <T>(task: AbortableTask<T>) => Promise<T | undefined>;
  /** Abort the currently in-flight task (if any). */
  abort: () => void;
}

export function useAbortableRequest(): UseAbortableRequestResult {
  // We hold the controller in a ref so abort() can be called
  // synchronously from a cleanup without re-creating it.
  const controllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    if (controllerRef.current) {
      try {
        controllerRef.current.abort();
      } catch {
        // AbortController.abort() is safe but be defensive in
        // case a polyfill is loaded.
      }
      controllerRef.current = null;
    }
  }, []);

  const run = useCallback(
    async <T,>(task: AbortableTask<T>): Promise<T | undefined> => {
      // Cancel any prior in-flight call before starting a new
      // one. Without this, two ticks of the progress interval
      // could race each other — the second one would overwrite
      // the first's optimistic SWR cache, and the slower one
      // would land last with stale data.
      abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      try {
        return await task({ signal: controller.signal });
      } catch (error) {
        // Aborted requests aren't errors from the consumer's
        // POV. Treat them as a no-op result.
        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          (error as { name?: string }).name === "AbortError"
        ) {
          return undefined;
        }
        throw error;
      } finally {
        // Only clear the ref if it's still ours — the unmount
        // path may have already nulled it.
        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
      }
    },
    [abort],
  );

  // Abort on unmount so an in-flight request is cancelled
  // instead of resolving into a dead component.
  useEffect(() => {
    return () => {
      abort();
    };
  }, [abort]);

  return { run, abort };
}
