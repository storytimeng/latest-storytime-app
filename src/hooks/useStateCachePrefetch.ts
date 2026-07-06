"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { dataStateCache } from "@/src/stores/useDataStateCache";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";

/**
 * Prefetch a list of SWR cache keys on mount, so that when the user
 * navigates to the destination view it can render from the SWR
 * cache (or, more importantly, from the state-cache layer that wraps
 * it) without an extra network round trip.
 *
 * We don't have React Query, so we implement our own equivalent:
 * - `preload()`-style keys that route through a registered fetcher.
 * - A safe no-op when the network is offline or the cache is warm.
 *
 * The `fetches` argument is `{ key, fetcher, payload? }` triples —
 * `key` is the SWR key, `fetcher` is an async function that resolves
 * the data (the same one the destination view's SWR hook uses), and
 * `payload` is whatever you want to ship through the state cache
 * (e.g. the result of an upstream fetch that the destination view
 * can read synchronously).
 */
export interface PrefetchSpec<T> {
  key: string;
  /** Async fetcher; receives nothing and returns the data. */
  fetcher: () => Promise<T>;
  /**
   * If supplied, the result is written into the state cache under
   * this key, so the destination view can read it synchronously
   * during its first render (no flash).
   */
  cacheKey?: string;
}

export function useStateCachePrefetch(specs: PrefetchSpec<any>[]) {
  const isOnline = useOnlineStatus();
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!isOnline) return;
    if (triggeredRef.current) return;
    triggeredRef.current = true;

    for (const spec of specs) {
      // Already have a fresh value cached? Don't bother re-fetching.
      if (spec.cacheKey && dataStateCache.has(spec.cacheKey)) {
        continue;
      }
      // Kick the fetch off but don't block the render. The destination
      // view's SWR hook will dedupe with the same key.
      void spec
        .fetcher()
        .then((result) => {
          if (spec.cacheKey && result != null) {
            dataStateCache.set(spec.cacheKey, result);
          }
        })
        .catch(() => {
          // Best-effort. The destination view will retry on mount.
        });
    }
    // We intentionally don't include `specs` in deps — we want the
    // prefetch to fire exactly once per mount. Callers that need to
    // re-prefetch (e.g. on a search-term change) should mount a new
    // instance with a new key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);
}

/**
 * Same idea, but for Next.js route prefetching via the App Router.
 * Useful when the destination view depends on a dynamic route
 * (e.g. /story/[id]) that Next.js can't statically export for
 * arbitrary ids.
 */
export function useRoutePrefetch(paths: string[]) {
  const router = useRouter();
  useEffect(() => {
    for (const path of paths) {
      try {
        router.prefetch(path);
      } catch {
        // Some Capacitor-internal paths don't have a real route —
        // silently skip them.
      }
    }
  }, [router, paths]);
}
