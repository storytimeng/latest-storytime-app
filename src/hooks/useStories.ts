import React from "react";
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
  const { limit = 20, search, genre, status } = options;
  const [currentPage, setCurrentPage] = React.useState(options.page || 1);
  const [allStories, setAllStories] = React.useState<any[]>([]);
  const [hasMore, setHasMore] = React.useState(true);

  // Build query params for genres array
  const genres = genre ? [genre] : undefined;
  
  // Create cache key from params but exclude page to handle it internally
  const cacheKey = `stories-${JSON.stringify({ limit, search, genres, status, page: currentPage })}`;

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    async () => {
      console.log("🔍 useStories: Calling storiesControllerFindAll with:", {
        page: currentPage,
        limit,
        genres,
      });

      const response = await storiesControllerFindAll({
        query: {
          page: currentPage,
          limit,
          genres,
        },
      });

      if (response.error) {
        throw response.error;
      }

      const responseData = (response?.data as any)?.data || response?.data;
      return responseData;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      keepPreviousData: true,
    }
  );

  // Update accumulated stories when new data arrives
  React.useEffect(() => {
    if (data?.stories) {
      setAllStories((prev) => {
        if (currentPage === 1) {
          return data.stories;
        }
        // Avoid duplicates
        const existingIds = new Set(prev.map((s: any) => s.id));
        const newStories = data.stories.filter(
          (s: any) => !existingIds.has(s.id)
        );
        return [...prev, ...newStories];
      });

      const totalPages = data.totalPages || 0;
      setHasMore(currentPage < totalPages);
    }
  }, [data?.stories, currentPage]);

  const loadMore = React.useCallback(() => {
    if (!isLoading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLoading, hasMore]);

  // Track initial loading separately from loading more
  const isInitialLoading = isLoading && allStories.length === 0;

  return {
    stories: allStories,
    total: data?.total || 0,
    page: currentPage,
    limit: data?.limit || limit,
    totalPages: data?.totalPages || 0,
    isLoading: isInitialLoading,
    isLoadingMore: isLoading && currentPage > 1,
    hasMore,
    error,
    mutate,
    loadMore,
  };
}
