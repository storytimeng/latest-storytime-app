"use client";

import { useMemo, useRef } from "react";
import {
  useDataStateCache,
  STATE_CACHE_FRESH_WINDOW_MS,
} from "@/src/stores/useDataStateCache";

/**
 * Wraps a fetcher + cache key with the in-memory + sessionStorage
 * state cache layer so consumers can:
 *
 *   1. Render the previously-fetched data on first mount without
 *      a loading flash.
 *   2. Kick off a fresh network fetch in the background.
 *   3. Write the new value back to the cache for the next mount.
 *
 * Designed for the home / library / pen screens where each nav
 * re-mount tears down the SWR cache but the user expects to land on
 * a populated list, not a skeleton.
 *
 * The hook is intentionally minimal: it doesn't try to be the cache.
 * It just gives you a synchronously-readable `cachedValue`, a
 * `refresh` callback to invoke when you want to revalidate, and a
 * `writeBack` callback to call with the fresh data once it arrives.
 *
 * Usage:
 *   const { stories, isLoading } = usePopularStories({ limit: 10 });
 *   const cache = useStateCachedFetch<typeof stories>("home:popular");
 *   useEffect(() => { if (stories) cache.writeBack(stories); }, [stories]);
 *   const initial = cache.cachedValue ?? [];
 *   const displayStories = stories ?? initial;
 */
export function useStateCachedFetch<T>(key: string) {
  const { value, set, storedAt, hasFresh } = useDataStateCache<T>(key);
  const hasWrittenRef = useRef(false);

  // Compute "is fresh?" against the fresh window. Exposed so callers
  // can decide whether to skip the network on initial mount.
  const isFresh = storedAt > 0 && hasFresh(storedAt);

  return useMemo(
    () => ({
      cachedValue: value,
      storedAt,
      isFresh,
      writeBack: (next: T) => {
        // Guard against accidental identity thrash that would otherwise
        // notify every subscriber on every parent re-render.
        if (hasWrittenRef.current && value === next) return;
        hasWrittenRef.current = true;
        set(next);
      },
    }),
    [value, storedAt, isFresh, set],
  );
}

export { STATE_CACHE_FRESH_WINDOW_MS };
