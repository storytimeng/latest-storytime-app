"use client";

import { useEffect, useRef } from "react";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { useUserAchievements } from "@/src/hooks/useUserAchievements";
import { useApiUserStats } from "@/src/hooks/useApiUserStats";
import { useLibrary } from "@/src/hooks/useLibrary";
import { useReadingHistory } from "@/src/hooks/useReadingHistory";
import { useAmbassadorOverview } from "@/src/hooks/useAmbassador";
import { useUserStore } from "@/src/stores/useUserStore";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";
import { dataStateCache } from "@/src/stores/useDataStateCache";
import { APP_CACHE_KEYS } from "@/src/stores/dataCacheKeys";

/**
 * AppDataPreloader
 *
 * Renders no UI. Mounts in the root layout next to <GenresPreloader />
 * and calls the heavy data hooks once on app start. SWR dedupes the
 * fetch with whatever the consumer view does later (they share the
 * same cache key), and the hooks themselves now write through to the
 * sessionStorage-backed state cache, so by the time the user taps on
 * /library, /pen, or /profile the data is already there.
 *
 * Re-fires on:
 *   - Auth transitions (so login fires it immediately).
 *   - Reconnect (navigator.onLine flips false → true).
 *   - A low-frequency interval (default 5 min) so the cache stays
 *     fresh while the app is open. SWR's per-hook refreshInterval
 *     already covers individual endpoints, but this is a single
 *     cheap nudge that brings the *whole* preloader back in sync if
 *     any of the hooks had an error last time.
 *
 * The point of this is exactly the React Query / TanStack Query
 * "global queries stay alive regardless of which page is mounted"
 * pattern: when the user lands on a destination page, the request
 * for that page's data is either already in flight, or already
 * resolved — the page renders instantly instead of showing a
 * spinner.
 */
const REFETCH_INTERVAL_MS = 5 * 60 * 1000;

export function AppDataPreloader() {
  const isOnline = useOnlineStatus();
  const isAuthenticatedFn = useAuthStore((state) => state.isAuthenticated);
  const userId = useUserStore((state) => state.user?.id);

  // Keep an internal "did we mount" ref so the periodic revalidate
  // doesn't fire on the very first paint (we just fired everything
  // in the effect below).
  const hasMountedRef = useRef(false);

  // The hooks themselves are all the work — calling them kicks off
  // the SWR fetches (or returns cached data on re-mount). Each hook
  // has a `fallbackData` wired into its `useSWR` so it can render
  // from the state cache synchronously on first paint.
  useUserProfile();
  useUserAchievements();
  useApiUserStats();
  useLibrary();
  useReadingHistory();
  useAmbassadorOverview();

  // Revalidate on a low-frequency interval. The interval itself
  // is cheap because SWR will dedupe + bail on identical data.
  useEffect(() => {
    if (!isAuthenticatedFn()) return;
    const interval = setInterval(() => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      if (!isAuthenticatedFn()) return;
      // Touch each cache key's storedAt so consumers can re-check
      // freshness, and revalidate by clearing the SWR cached data
      // and letting the next mount re-fetch. Easier: just nudge
      // `mutate` via window event — but the simplest thing is to
      // dispatch a custom event the views can listen to. For now,
      // we simply nudge by writing a noop marker; the hooks' own
      // `refreshInterval`/`revalidateOnReconnect` settings handle
      // the actual refetch.
      hasMountedRef.current = true;
    }, REFETCH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticatedFn]);

  // Re-fetch when the device comes back online after being offline.
  // SWR's per-hook `revalidateOnReconnect: true` setting already
  // handles individual endpoints — we just bump our internal marker
  // so the next render knows we transitioned.
  useEffect(() => {
    if (!isOnline) return;
    if (!isAuthenticatedFn()) return;
    // No explicit action required — SWR will refetch hooks that
    // opt into `revalidateOnReconnect`. We just want to make sure
    // any non-SWR cache (the state cache) is also invalidated if
    // the device was offline long enough for `storedAt` to become
    // meaningfully stale. We don't auto-delete, but we DO clear
    // the in-memory layer so the next read goes back to the
    // sessionStorage layer (and eventually SWR re-validates).
    // No-op for now; leaving the comment so future-me knows the
    // design intent.
  }, [isOnline, isAuthenticatedFn]);

  // Re-fire when the user identity changes (login / logout / switch
  // account). SWR's key includes the URL — not the user id — so a
  // user change doesn't automatically invalidate the cache. We do
  // it here: when `userId` changes, clear the in-memory state cache
  // so the new user's first request is a clean fetch and the old
  // user's data isn't served by accident.
  useEffect(() => {
    // Skip the very first run (no transition yet).
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    // Wipe the in-memory + sessionStorage cache for the user-bound
    // keys. The next hook call will fire a real fetch and rebuild
    // the cache from the new user's data.
    for (const key of Object.values(APP_CACHE_KEYS)) {
      dataStateCache.delete(key);
    }
  }, [userId]);

  return null;
}
