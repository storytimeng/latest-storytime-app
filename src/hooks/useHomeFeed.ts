"use client";

import { useEffect, useMemo } from "react";
import { useGenres } from "@/src/hooks/useGenres";
import { useStories } from "@/src/hooks/useStories";
import {
  useOnlyOnStorytimeStories,
  useRecentlyAddedStories,
  useTrendingStories,
  usePopularStories,
} from "@/src/hooks/useStoryCategories";
import { useStoriesFilterStore } from "@/src/stores/useStoriesFilterStore";

export function useHomeFeed() {
  const { selectedGenres, toggleGenre, clearGenres } = useStoriesFilterStore();
  const { genres: apiGenres, isLoading: genresLoading } = useGenres();
  const genres = apiGenres || [];

  const sortedGenres = useMemo(() => {
    return [...genres].sort((a, b) => {
      const aSelected = selectedGenres.includes(a);
      const bSelected = selectedGenres.includes(b);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.localeCompare(b);
    });
  }, [genres, selectedGenres]);

  const { stories: filteredStories, isLoading: filteredLoading } = useStories({
    limit: 50,
    genre: selectedGenres.length > 0 ? selectedGenres[0] : undefined,
  });

  const {
    stories: exclusiveStories,
    isLoading: exclusiveLoading,
    loadMore: loadMoreExclusive,
    hasMore: hasMoreExclusive,
    isLoadingMore: isLoadingMoreExclusive,
  } = useOnlyOnStorytimeStories({ limit: 10 });

  const {
    stories: recentStories,
    isLoading: recentLoading,
    loadMore: loadMoreRecent,
    hasMore: hasMoreRecent,
    isLoadingMore: isLoadingMoreRecent,
  } = useRecentlyAddedStories({ limit: 10 });

  const {
    stories: trendingStories,
    isLoading: trendingLoading,
    loadMore: loadMoreTrending,
    hasMore: hasMoreTrending,
    isLoadingMore: isLoadingMoreTrending,
  } = useTrendingStories({ limit: 10 });

  const {
    stories: popularStoriesData,
    isLoading: popularLoading,
    loadMore: loadMorePopular,
    hasMore: hasMorePopular,
    isLoadingMore: isLoadingMorePopular,
  } = usePopularStories({ limit: 10 });

  const popularStories = useMemo(() => {
    if (!popularStoriesData) return [];
    return [...popularStoriesData].sort(
      (a, b) => (b.popularityScore || 0) - (a.popularityScore || 0),
    );
  }, [popularStoriesData]);

  const storiesLoading =
    selectedGenres.length > 0
      ? filteredLoading
      : exclusiveLoading || recentLoading || trendingLoading || popularLoading;

  return {
    genres,
    sortedGenres,
    genresLoading,
    selectedGenres,
    toggleGenre,
    clearGenres,
    filteredStories,
    exclusiveStories,
    exclusiveLoading,
    loadMoreExclusive,
    hasMoreExclusive,
    isLoadingMoreExclusive,
    recentStories,
    recentLoading,
    loadMoreRecent,
    hasMoreRecent,
    isLoadingMoreRecent,
    trendingStories,
    trendingLoading,
    loadMoreTrending,
    hasMoreTrending,
    isLoadingMoreTrending,
    popularStories,
    popularLoading,
    loadMorePopular,
    hasMorePopular,
    isLoadingMorePopular,
    storiesLoading,
  };
}

export function useHomeFeedInit() {
  useEffect(() => {
    useStoriesFilterStore.getState().clearGenres();
  }, []);
}
