import { useEffect } from "react";
import useSWR from "swr";
import { storiesControllerGetGenres } from "../client/sdk.gen";
import { getCachedValue, dataStateCache } from "@/src/stores/useDataStateCache";
import { APP_CACHE_KEYS } from "@/src/stores/dataCacheKeys";

const GENRES_CACHE_KEY = APP_CACHE_KEYS.homeGenres;

export function useGenres() {
  const { data, error, isLoading } = useSWR(
    "genres",
    async () => {
      const response = await storiesControllerGetGenres();
      if (response.error) {
        throw response.error;
      }
      const genres =
        (response.data as any)?.data?.genres || response.data?.genres || [];
      return genres;
    },
    {
      revalidateOnMount: true,
      revalidateOnFocus: true, // Refresh when user returns to the tab
      refreshInterval: 5 * 60 * 1000, // Poll every 5 minutes
      shouldRetryOnError: false,
      // Warm-start with the previous session's list so the home
      // screen renders instantly on cold mount.
      fallbackData: getCachedValue<string[]>(GENRES_CACHE_KEY) ?? undefined,
    },
  );

  // Mirror live result into the state cache so the home view (or
  // any future consumer) can read it synchronously on the next mount.
  useEffect(() => {
    if (data && data.length > 0) {
      dataStateCache.set(GENRES_CACHE_KEY, data);
    }
  }, [data]);

  return {
    genres: data,
    isLoading,
    error,
  };
}
