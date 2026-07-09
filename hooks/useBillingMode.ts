"use client";

import useSWR from "swr";
import { getAppConfig, type AppConfigDto } from "@/src/appConfigClient";
import {
  safeResolveBillingMode,
  type ResolvedBilling,
} from "@/lib/billingMode";

/**
 * Fetches the backend's app-config and resolves it against the build-time
 * reveal date. Returns:
 *
 *   - `mode`     — the active mode (defaults to "reader" on any failure)
 *   - `ready`    — false on the first paint, true once SWR has settled
 *                  (success OR error). Use this to show a skeleton.
 *   - `remote`   — the raw backend payload, for debugging
 *   - `mutate()` — re-fetch (useful for an admin "refresh" button or to
 *                  call after a deep-link forces a recheck).
 *
 * The hook is deliberately "fail safe to reader": if the network is down,
 * the backend returns 500, the payload is malformed, or the SWR cache is
 * stale, the app stays in Reader App mode. That's the posture required to
 * remain compliant with the Google Play Reader App policy.
 */
export function useBillingMode(): ResolvedBilling & {
  ready: boolean;
  mutate: () => void;
} {
  // SWR key: a single string. `null` would skip the fetch; we always want
  // to try, even on web (it returns a benign payload that's ignored).
  const { data, isLoading, mutate } = useSWR<AppConfigDto>(
    "app-config",
    async () => {
      // Wrap in try so a transport-layer exception becomes a SWR error
      // rather than an unhandled promise rejection in the React tree.
      return await getAppConfig();
    },
    {
      refreshInterval: 5 * 60_000, // 5 min — pick up remote flips quickly
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30_000,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      keepPreviousData: true,
    },
  );

  // First paint: `isLoading` is true, data is undefined. We still want
  // a non-"loading" mode so the UI can render. Use the build-time clock
  // to get an instant decision, then SWR replaces it.
  const resolved = safeResolveBillingMode(data ?? null);

  return {
    ...resolved,
    ready: !isLoading || data !== undefined,
    mutate: () => {
      void mutate();
    },
  };
}
