import { useEffect } from "react";
import useSWR from "swr";
import { fetchAmbassadorOverview } from "@/src/lib/ambassadors";
import { dataStateCache, getCachedValue } from "@/src/stores/useDataStateCache";
import { APP_CACHE_KEYS } from "@/src/stores/dataCacheKeys";

export function useAmbassadorOverview() {
  const { data, error, isLoading, mutate } = useSWR(
    "ambassador-overview",
    fetchAmbassadorOverview,
    {
      revalidateOnFocus: true,
      // Warm-start with the previous session's overview so the
      // profile screen renders instantly on cold mount.
      fallbackData:
        getCachedValue<any>(APP_CACHE_KEYS.ambassadorOverview) ?? undefined,
    },
  );

  // Mirror live result into the state cache.
  useEffect(() => {
    if (data) {
      dataStateCache.set(APP_CACHE_KEYS.ambassadorOverview, data);
    }
  }, [data]);

  return {
    overview: data,
    isLoading,
    error,
    mutate,
  };
}
