import { useEffect } from "react";
import useSWR from "swr";
import { usersControllerGetStats } from "@/src/client/sdk.gen";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { dataStateCache, getCachedValue } from "@/src/stores/useDataStateCache";
import { APP_CACHE_KEYS } from "@/src/stores/dataCacheKeys";

interface ReadingProgress {
  totalStoriesInProgress?: number;
  completedStories?: number;
  totalReadingTimeSeconds?: number;
  totalReadingTimeMinutes?: number;
  totalReadingTimeHours?: number;
}

interface UserStats {
  storiesRead?: number;
  storiesWritten?: number;
  badges?: string[];
  badgesCount?: number;
  certificates?: string[];
  certificatesCount?: number;
  readingProgress?: ReadingProgress;
  // Computed properties for easier access
  readingTime?: number; // in minutes
  writingTime?: number; // in minutes
  readingStreak?: number;
  writingStreak?: number;
}

/**
 * Hook to fetch comprehensive user statistics from API
 * Includes reading/writing time, stories count, badges, etc.
 */
export function useApiUserStats() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data, error, isLoading, mutate } = useSWR(
    isAuthenticated() ? "/users/stats" : null,
    async () => {
      const response = await usersControllerGetStats();
      // Extract from nested structure: response.data.data.stats
      const result =
        (response?.data as any)?.data?.stats ||
        (response?.data as any)?.stats ||
        response?.data;

      console.log("✅ User stats fetched:", result);

      // Transform the data to include computed properties
      const stats: UserStats = {
        ...result,
        // Convert reading time from hours to minutes for consistency
        readingTime: result?.readingProgress?.totalReadingTimeMinutes || 0,
        writingTime: 0, // Not provided by API yet
        readingStreak: 0, // Not provided by API yet
        writingStreak: 0, // Not provided by API yet
      };

      return stats;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      // Warm-start with the previous session's stats so the profile
      // screen never flashes a skeleton on cold mount.
      fallbackData: getCachedValue<UserStats>("/users/stats") ?? undefined,
    },
  );

  // Mirror live result into the state cache for the next mount.
  useEffect(() => {
    if (data) {
      dataStateCache.set(APP_CACHE_KEYS.userStats, data);
    }
  }, [data]);

  return {
    stats: data || ({} as UserStats),
    isLoading,
    error,
    mutate,
  };
}
