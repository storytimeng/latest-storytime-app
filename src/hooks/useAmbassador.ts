import { useEffect } from "react";
import useSWR from "swr";
import { fetchAmbassadorOverview } from "@/src/lib/ambassadors";
import { dataStateCache, getCachedValue } from "@/src/stores/useDataStateCache";
import { APP_CACHE_KEYS } from "@/src/stores/dataCacheKeys";
import { useAuthStore } from "@/src/stores/useAuthStore";

export function useAmbassadorOverview() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)();
  const { data, error, isLoading, mutate } = useSWR(
    isAuthenticated ? "ambassador-overview" : null,
    fetchAmbassadorOverview,
    {
      revalidateOnFocus: false,
      fallbackData: isAuthenticated
        ? (getCachedValue<any>(APP_CACHE_KEYS.ambassadorOverview) ?? undefined)
        : undefined,
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
