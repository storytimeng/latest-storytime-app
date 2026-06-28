import React from "react";
import useSWR from "swr";
import {
  storiesControllerFindPopular,
  storiesControllerFindRecentlyAdded,
  storiesControllerFindTrendingNow,
  storiesControllerFindOnlyOnStorytime,
  searchStories,
} from "@/src/client";
import { client } from "@/src/client/client.gen";
import { StoriesListResponseDto } from "@/src/client/types.gen";

/** 5-minute stale time for home feed data — avoids refetching on every tab switch */
const HOME_FEED_SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 5 * 60 * 1000,
} as const;

export interface HomeFeedSection {
  stories: any[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface HomeFeedData {
  popular: HomeFeedSection;
  recentlyAdded: HomeFeedSection;
  trending: HomeFeedSection;
  exclusive: HomeFeedSection;
}

/**
 * Single-request home feed. Replaces the 4 separate category hooks.
 * The backend runs all four queries in parallel, cutting round trips from 5 → 2.
 */
export function useHomeFeed(limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR(
    `/stories/home-feed?limit=${limit}`,
    async () => {
      const response = await client.get({ url: `/stories/home-feed`, query: { limit } });
      const body = (response as any)?.data ?? response;
      return body as HomeFeedData;
    },
    HOME_FEED_SWR_CONFIG,
  );

  return {
    popular: data?.popular?.stories ?? [],
    recentlyAdded: data?.recentlyAdded?.stories ?? [],
    trending: data?.trending?.stories ?? [],
    exclusive: (data?.exclusive?.stories ?? []).filter((s: any) => s.onlyOnStorytime === true),
    isLoading,
    error,
    mutate,
  };
}

interface UseStoryCategoryOptions {
  page?: number;
  limit?: number;
  genres?: string[];
}

interface UseSearchStoriesOptions extends UseStoryCategoryOptions {
  query: string;
  genre?: string;
}

// Hook for popular stories with infinite scroll support
export function usePopularStories(options: UseStoryCategoryOptions = {}) {
  const { limit = 20, genres } = options;
  const [currentPage, setCurrentPage] = React.useState(1);
  const [allStories, setAllStories] = React.useState<any[]>([]);
  const [hasMore, setHasMore] = React.useState(true);

  const { data, error, isLoading, mutate } = useSWR(
    `/stories/popular?page=${currentPage}&limit=${limit}&genres=${genres?.join(",") || ""}`,
    async () => {
      const response = await storiesControllerFindPopular({
        query: { page: currentPage, limit, genres },
      });

      const responseData = (response?.data as any)?.data || response?.data;
      console.log("✅ usePopularStories: Processed data:", responseData);

      return responseData;
    },
    {
      keepPreviousData: true, // Prevent flash when loading next page
      revalidateOnFocus: false,
    },
  );

  // Update accumulated stories when new data arrives
  React.useEffect(() => {
    if (data?.stories) {
      setAllStories((prev) => {
        // If page 1, replace all stories; otherwise append
        if (currentPage === 1) {
          return data.stories;
        }
        // Avoid duplicates
        const existingIds = new Set(prev.map((s: any) => s.id));
        const newStories = data.stories.filter(
          (s: any) => !existingIds.has(s.id),
        );
        return [...prev, ...newStories];
      });

      // Check if there are more pages
      const totalPages = data.totalPages || 0;
      setHasMore(currentPage < totalPages);
    }
  }, [data?.stories, currentPage]); // Only depend on data.stories, not entire data object

  const loadMore = React.useCallback(() => {
    if (!isLoading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLoading, hasMore]);

  const reset = React.useCallback(() => {
    setCurrentPage(1);
    setAllStories([]);
    setHasMore(true);
  }, []);

  // Memoize stories array to prevent new reference unless content actually changes
  const memoizedStories = React.useMemo(
    () => allStories,
    [
      allStories.length,
      allStories[0]?.id,
      allStories[allStories.length - 1]?.id,
    ],
  );

  // Track initial loading separately from loading more
  const isInitialLoading = isLoading && allStories.length === 0;

  return {
    stories: memoizedStories,
    total: (data as StoriesListResponseDto)?.total || 0,
    page: currentPage,
    limit: (data as StoriesListResponseDto)?.limit || limit,
    totalPages: (data as StoriesListResponseDto)?.totalPages || 0,
    isLoading: isInitialLoading,
    isLoadingMore: isLoading && currentPage > 1,
    hasMore,
    error,
    mutate,
    loadMore,
    reset,
  };
}

// Hook for recently added stories with infinite scroll support
export function useRecentlyAddedStories(options: UseStoryCategoryOptions = {}) {
  const { limit = 20, genres } = options;
  const [currentPage, setCurrentPage] = React.useState(1);
  const [allStories, setAllStories] = React.useState<any[]>([]);
  const [hasMore, setHasMore] = React.useState(true);

  const { data, error, isLoading, mutate } = useSWR(
    `/stories/recently-added?page=${currentPage}&limit=${limit}&genres=${genres?.join(",") || ""}`,
    async () => {
      const response = await storiesControllerFindRecentlyAdded({
        query: { page: currentPage, limit, genres },
      });

      const responseData = (response?.data as any)?.data || response?.data;
      console.log("✅ useRecentlyAddedStories: Processed data:", responseData);

      return responseData;
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  React.useEffect(() => {
    if (data?.stories) {
      setAllStories((prev) => {
        if (currentPage === 1) {
          return data.stories;
        }
        const existingIds = new Set(prev.map((s: any) => s.id));
        const newStories = data.stories.filter(
          (s: any) => !existingIds.has(s.id),
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

  const reset = React.useCallback(() => {
    setCurrentPage(1);
    setAllStories([]);
    setHasMore(true);
  }, []);

  // Memoize stories array to prevent new reference unless content actually changes
  const memoizedStories = React.useMemo(
    () => allStories,
    [
      allStories.length,
      allStories[0]?.id,
      allStories[allStories.length - 1]?.id,
    ],
  );

  // Track initial loading separately from loading more
  const isInitialLoading = isLoading && allStories.length === 0;

  return {
    stories: memoizedStories,
    total: (data as StoriesListResponseDto)?.total || 0,
    page: currentPage,
    limit: (data as StoriesListResponseDto)?.limit || limit,
    totalPages: (data as StoriesListResponseDto)?.totalPages || 0,
    isLoading: isInitialLoading,
    isLoadingMore: isLoading && currentPage > 1,
    hasMore,
    error,
    mutate,
    loadMore,
    reset,
  };
}

// Hook for trending stories with infinite scroll support
export function useTrendingStories(options: UseStoryCategoryOptions = {}) {
  const { limit = 20, genres } = options;
  const [currentPage, setCurrentPage] = React.useState(1);
  const [allStories, setAllStories] = React.useState<any[]>([]);
  const [hasMore, setHasMore] = React.useState(true);

  const { data, error, isLoading, mutate } = useSWR(
    `/stories/trending-now?page=${currentPage}&limit=${limit}&genres=${genres?.join(",") || ""}`,
    async () => {
      const response = await storiesControllerFindTrendingNow({
        query: { page: currentPage, limit, genres },
      });

      const responseData = (response?.data as any)?.data || response?.data;
      console.log("✅ useTrendingStories: Processed data:", responseData);

      return responseData;
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  React.useEffect(() => {
    if (data?.stories) {
      setAllStories((prev) => {
        if (currentPage === 1) {
          return data.stories;
        }
        const existingIds = new Set(prev.map((s: any) => s.id));
        const newStories = data.stories.filter(
          (s: any) => !existingIds.has(s.id),
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

  const reset = React.useCallback(() => {
    setCurrentPage(1);
    setAllStories([]);
    setHasMore(true);
  }, []);

  // Memoize stories array to prevent new reference unless content actually changes
  const memoizedStories = React.useMemo(
    () => allStories,
    [
      allStories.length,
      allStories[0]?.id,
      allStories[allStories.length - 1]?.id,
    ],
  );

  // Track initial loading separately from loading more
  const isInitialLoading = isLoading && allStories.length === 0;

  return {
    stories: memoizedStories,
    total: (data as StoriesListResponseDto)?.total || 0,
    page: currentPage,
    limit: (data as StoriesListResponseDto)?.limit || limit,
    totalPages: (data as StoriesListResponseDto)?.totalPages || 0,
    isLoading: isInitialLoading,
    isLoadingMore: isLoading && currentPage > 1,
    hasMore,
    error,
    mutate,
    loadMore,
    reset,
  };
}

// Hook for only on storytime stories with infinite scroll support
export function useOnlyOnStorytimeStories(
  options: UseStoryCategoryOptions = {},
) {
  const { limit = 20 } = options;
  const [currentPage, setCurrentPage] = React.useState(1);
  const [allStories, setAllStories] = React.useState<any[]>([]);
  const [hasMore, setHasMore] = React.useState(true);

  const { data, error, isLoading, mutate } = useSWR(
    `/stories/only-on-storytime?page=${currentPage}&limit=${limit}`,
    async () => {
      const response = await storiesControllerFindOnlyOnStorytime({
        query: { page: currentPage, limit },
      });

      const responseData = (response?.data as any)?.data || response?.data;
      return responseData;
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  React.useEffect(() => {
    if (data?.stories) {
      // Enforce exclusivity on the client side: only stories explicitly flagged
      // as onlyOnStorytime === true are allowed in this section, regardless of
      // what the API returns.
      const exclusiveStories = (data.stories as any[]).filter(
        (s) => s.onlyOnStorytime === true,
      );

      setAllStories((prev) => {
        if (currentPage === 1) {
          return exclusiveStories;
        }
        const existingIds = new Set(prev.map((s: any) => s.id));
        const newStories = exclusiveStories.filter(
          (s: any) => !existingIds.has(s.id),
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

  const reset = React.useCallback(() => {
    setCurrentPage(1);
    setAllStories([]);
    setHasMore(true);
  }, []);

  // Memoize stories array to prevent new reference unless content actually changes
  const memoizedStories = React.useMemo(
    () => allStories,
    [
      allStories.length,
      allStories[0]?.id,
      allStories[allStories.length - 1]?.id,
    ],
  );

  // Track initial loading separately from loading more
  const isInitialLoading = isLoading && allStories.length === 0;

  return {
    stories: memoizedStories,
    total: (data as StoriesListResponseDto)?.total || 0,
    page: currentPage,
    limit: (data as StoriesListResponseDto)?.limit || limit,
    totalPages: (data as StoriesListResponseDto)?.totalPages || 0,
    isLoading: isInitialLoading,
    isLoadingMore: isLoading && currentPage > 1,
    hasMore,
    error,
    mutate,
    loadMore,
    reset,
  };
}

// Hook for searching stories
export function useSearchStories(options: UseSearchStoriesOptions) {
  const { query, page: initialPage = 1, limit = 20, genre } = options;
  const trimmedQuery = query.trim();
  const shouldFetch = trimmedQuery.length > 0;
  const genres = genre ? [genre] : undefined;

  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [allStories, setAllStories] = React.useState<any[]>([]);
  const [hasMore, setHasMore] = React.useState(true);

  React.useEffect(() => {
    setCurrentPage(1);
    setAllStories([]);
    setHasMore(true);
  }, [trimmedQuery, genre, limit]);

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch
      ? `/stories/search?query=${encodeURIComponent(trimmedQuery)}&page=${currentPage}&limit=${limit}&genres=${genres?.join(",") ?? ""}`
      : null,
    async () => {
      const response = await searchStories({
        query: { query: trimmedQuery, page: currentPage, limit, genres },
      });

      const responseData = (response?.data as any)?.data || response?.data;
      return responseData;
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  React.useEffect(() => {
    if (!data?.stories) return;

    setAllStories((prev) => {
      if (currentPage === 1) {
        return data.stories;
      }
      const existingIds = new Set(
        prev.map((story: { id: string }) => story.id),
      );
      const newStories = data.stories.filter(
        (story: { id: string }) => !existingIds.has(story.id),
      );
      return [...prev, ...newStories];
    });

    const totalPages = data.totalPages || 0;
    setHasMore(currentPage < totalPages);
  }, [data?.stories, currentPage]);

  const loadMore = React.useCallback(() => {
    if (!isLoading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLoading, hasMore]);

  const memoizedStories = React.useMemo(() => allStories, [allStories]);

  const isInitialLoading = shouldFetch && isLoading && allStories.length === 0;

  return {
    stories: memoizedStories,
    total: (data as StoriesListResponseDto)?.total || 0,
    page: currentPage,
    limit: (data as StoriesListResponseDto)?.limit || limit,
    totalPages: (data as StoriesListResponseDto)?.totalPages || 0,
    isLoading: isInitialLoading,
    isLoadingMore: isLoading && currentPage > 1,
    hasMore,
    error,
    mutate,
    loadMore,
  };
}
