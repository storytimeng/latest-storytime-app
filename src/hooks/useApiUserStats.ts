import useSWR from "swr";
import { usersControllerGetStats } from "@/src/client/sdk.gen";

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
  const { data, error, isLoading, mutate } = useSWR(
    "/users/stats",
    async () => {
      const response = await usersControllerGetStats();
      // Extract from nested structure: response.data.data.stats
      const result = (response?.data as any)?.data?.stats || (response?.data as any)?.stats || response?.data;
      
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
    }
  );

  return {
    stats: data || {} as UserStats,
    isLoading,
    error,
    mutate,
  };
}
