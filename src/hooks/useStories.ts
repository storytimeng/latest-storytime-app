import useSWR from "swr";
import { storiesControllerFindAll } from "../client/sdk.gen";

interface UseStoriesOptions {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  status?: string;
}

export function useStories(options: UseStoriesOptions = {}) {
  const { page = 1, limit = 20, search, genre, status } = options;

  // Build query params for genres array
  const genres = genre ? [genre] : undefined;

  // Create cache key from params
  const cacheKey = `stories-${JSON.stringify({ page, limit, search, genres, status })}`;

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    async () => {
      console.log("🔍 useStories: Calling storiesControllerFindAll with:", {
        page,
        limit,
        genres,
      });

      // Call SDK function with proper params structure
      const response = await storiesControllerFindAll({
        query: {
          page,
          limit,
          genres, // API expects genres as an array
        },
      });

      console.log("📦 useStories: Raw response:", response);

      if (response.error) {
        console.error("❌ useStories: Error in response:", response.error);
        throw response.error;
      }

      // Handle nested response structure like useGenres does
      const responseData = (response?.data as any)?.data || response?.data;
      console.log("✅ useStories: Processed data:", responseData);

      return responseData;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      revalidateOnMount: true,
    }
  );

  return {
    stories: data?.stories || [],
    total: data?.total || 0,
    page: data?.page || page,
    limit: data?.limit || limit,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    mutate,
  };
}
