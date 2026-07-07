import useSWR from "swr";
import { storiesControllerGetMyLibrary } from "@/src/client";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useEffect } from "react";
import { dataStateCache, getCachedValue } from "@/src/stores/useDataStateCache";
import { APP_CACHE_KEYS } from "@/src/stores/dataCacheKeys";

// Cache key shared with the pen view's state-cache layer.
const MY_LIBRARY_CACHE_KEY = APP_CACHE_KEYS.myLibrary;

export function useLibrary() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data, error, isLoading, mutate } = useSWR(
    isAuthenticated() ? "/stories/my-library" : null,
    async () => {
      const response = await storiesControllerGetMyLibrary();
      const result = (response?.data as any)?.data || response?.data;

      console.log("✅ Library fetched successfully:", result);
      return result;
    },
    {
      revalidateOnFocus: false,
      // Render the warm-start value (from a prior session) on first
      // paint, so the pen/library screens don't flash a spinner on
      // every cold mount. SWR will still revalidate in the background.
      fallbackData: getCachedValue<any>(MY_LIBRARY_CACHE_KEY) ?? undefined,
    },
  );

  // Mirror the live result into the state cache so a hard reload /
  // cold start has something to render. The pen view also writes
  // through, but doing it here means consumers that use the hook
  // directly (without the view wrapper) still get the warm-start.
  useEffect(() => {
    if (data?.stories && data.stories.length > 0) {
      dataStateCache.set(MY_LIBRARY_CACHE_KEY, data);
    }
  }, [data]);

  return {
    stories: data?.stories || [],
    isLoading,
    error,
    mutate,
  };
}
