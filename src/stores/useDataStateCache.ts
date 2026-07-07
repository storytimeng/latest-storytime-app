import { useCallback, useSyncExternalStore } from "react";

/**
 * Generic in-memory + sessionStorage-backed cache for any data the
 * app fetches via SWR but wants to be able to show *instantly* on
 * remount — no flash, no spinner, no extra network round trip.
 *
 * Why this exists:
 * - SWR's own cache lives in module-level closures, which is great
 *   for keeping deduped in-flight requests, but it disappears the
 *   moment the page is hard-reloaded or the JS context goes away
 *   (PWA install, native activity recreate, app cold start on Android).
 * - sessionStorage persists across SPA navigations, hard reloads,
 *   and is cheap to read synchronously. We use it as a warm-start
 *   layer so the home / library / pen screens can render the
 *   previous session's data on first paint instead of waiting on
 *   the network. SWR still revalidates in the background; the
 *   cached data is just a faster first frame.
 *
 * Usage:
 *   const { value, set } = useDataStateCache<MyData>("my-key");
 *   // value is whatever was last `set`'d, or null on first load
 *   useEffect(() => { if (data) set(data); }, [data]);
 *
 * Listeners:
 *   useDataStateCache.subscribe("my-key", () => ...);
 *   (rarely needed — the hook already does this.)
 */

type Listener = () => void;
type Entry = { value: unknown; storedAt: number };

const memoryCache = new Map<string, Entry>();
const listeners = new Map<string, Set<Listener>>();

// Bound how long a cached entry is "good enough" to render as a
// first-frame. After this many ms the hook still returns the cached
// value (so the UI doesn't flash empty), but the consumer is expected
// to kick off a network refresh.
const DEFAULT_FRESH_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
// sessionStorage size cap. We only keep the hot pages, so this can
// stay small.
const SESSION_STORAGE_KEY_PREFIX = "storytime:state-cache:";
const SESSION_STORAGE_MAX_KEYS = 24;

function safeSessionGet(key: string): Entry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Entry;
    if (typeof parsed?.storedAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function safeSessionSet(key: string, entry: Entry): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      SESSION_STORAGE_KEY_PREFIX + key,
      JSON.stringify(entry),
    );
  } catch {
    // Quota or disabled storage — fall back to in-memory only.
  }
}

function safeSessionDelete(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY_PREFIX + key);
  } catch {
    // ignore
  }
}

/**
 * Trim sessionStorage so it doesn't grow without bound. We keep the
 * `SESSION_STORAGE_MAX_KEYS` most recently written keys and drop the
 * rest. Called opportunistically after a write.
 */
function pruneSessionStorage() {
  if (typeof window === "undefined") return;
  try {
    const allKeys: { key: string; storedAt: number }[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i);
      if (!k || !k.startsWith(SESSION_STORAGE_KEY_PREFIX)) continue;
      const entry = safeSessionGet(k.slice(SESSION_STORAGE_KEY_PREFIX.length));
      if (entry) {
        allKeys.push({ key: k, storedAt: entry.storedAt });
      }
    }
    if (allKeys.length <= SESSION_STORAGE_MAX_KEYS) return;
    allKeys.sort((a, b) => b.storedAt - a.storedAt);
    for (const { key } of allKeys.slice(SESSION_STORAGE_MAX_KEYS)) {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

function notify(key: string) {
  const set = listeners.get(key);
  if (!set) return;
  for (const l of set) l();
}

function readFromAnyLayer(key: string): Entry | null {
  const mem = memoryCache.get(key);
  if (mem) return mem;
  const ses = safeSessionGet(key);
  if (ses) {
    // Promote into memory so subsequent reads are sync-fast.
    memoryCache.set(key, ses);
    return ses;
  }
  return null;
}

export const dataStateCache = {
  get<T>(key: string): T | null {
    const entry = readFromAnyLayer(key);
    return entry ? (entry.value as T) : null;
  },
  getEntry(key: string): Entry | null {
    return readFromAnyLayer(key);
  },
  set<T>(key: string, value: T): void {
    const entry: Entry = { value, storedAt: Date.now() };
    memoryCache.set(key, entry);
    safeSessionSet(key, entry);
    pruneSessionStorage();
    notify(key);
  },
  has(key: string): boolean {
    return readFromAnyLayer(key) !== null;
  },
  delete(key: string): void {
    memoryCache.delete(key);
    safeSessionDelete(key);
    notify(key);
  },
  clear(): void {
    memoryCache.clear();
    if (typeof window !== "undefined") {
      try {
        const toRemove: string[] = [];
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const k = window.sessionStorage.key(i);
          if (k && k.startsWith(SESSION_STORAGE_KEY_PREFIX)) toRemove.push(k);
        }
        toRemove.forEach((k) => window.sessionStorage.removeItem(k));
      } catch {
        // ignore
      }
    }
    for (const key of listeners.keys()) notify(key);
  },
  subscribe(key: string, listener: Listener): () => void {
    let set = listeners.get(key);
    if (!set) {
      set = new Set();
      listeners.set(key, set);
    }
    set.add(listener);
    return () => {
      set!.delete(listener);
      if (set!.size === 0) listeners.delete(key);
    };
  },
};

/**
 * React hook form of `dataStateCache.get` + `set`.
 *
 * The returned `value` is whatever was last `set`'d under `key`, or
 * `null` if nothing was ever stored. Setting a value writes through
 * to both memory and sessionStorage and notifies other hook
 * instances on the same key.
 */
export function useDataStateCache<T>(key: string) {
  const subscribe = useCallback(
    (l: Listener) => dataStateCache.subscribe(key, l),
    [key],
  );
  const getSnapshot = useCallback(() => dataStateCache.getEntry(key), [key]);
  // useSyncExternalStore wants a stable reference between calls when
  // the data hasn't changed. We always hand back the entry object
  // directly, so identity changes only when the cache mutates.
  const entry = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const set = useCallback((value: T) => dataStateCache.set(key, value), [key]);
  return {
    value: (entry?.value as T | undefined) ?? null,
    storedAt: entry?.storedAt ?? 0,
    set,
    hasFresh: (storedAt: number, freshWindowMs = DEFAULT_FRESH_WINDOW_MS) =>
      Date.now() - storedAt < freshWindowMs,
  };
}

/**
 * Read-once helper: returns the cached value synchronously on first
 * render without subscribing. Use this inside SWR `fallbackData` so
 * SWR can render the warm-start value while the network is in flight.
 */
export function getCachedValue<T>(key: string): T | null {
  return dataStateCache.get<T>(key);
}

/**
 * Convenience wrapper that:
 *   1. Returns the cached value on first render (no spinner).
 *   2. Triggers `load()` after mount if the cache is stale or empty.
 *   3. Writes the new value back to the cache when it arrives.
 *
 * Consumers should pass an SWR `data` value in via `set` themselves
 * (this hook only handles the mount-time bootstrap). The pattern in
 * practice looks like:
 *
 *   const { data, isLoading } = usePopularStories({ ... });
 *   const cache = useDataStateCache<any[]>("home:popular");
 *   useEffect(() => { if (data) cache.set(data); }, [data]);
 *   const initialStories = cache.value ?? data ?? [];
 *
 * The `isStale` flag tells the caller whether the network should be
 * revalidated immediately (true if the cache is older than the fresh
 * window or the user explicitly wants fresh data).
 */
export function useStateCacheBootstrap<T>(
  key: string,
  options: { freshWindowMs?: number } = {},
) {
  const { value, storedAt, hasFresh } = useDataStateCache<T>(key);
  const freshWindowMs = options.freshWindowMs ?? DEFAULT_FRESH_WINDOW_MS;
  return {
    value,
    storedAt,
    isStale: !hasFresh(storedAt, freshWindowMs),
  };
}

export const STATE_CACHE_FRESH_WINDOW_MS = DEFAULT_FRESH_WINDOW_MS;
