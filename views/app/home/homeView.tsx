"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMemo } from "react";
import {
  GenreButton,
  StoryGroup,
  PremiumBanner,
  StoriesCarousel,
} from "@/components/reusables";
import GenreSection from "./GenreSection";
import { Magnetik_Medium, Magnetik_Bold, Magnetik_Regular } from "@/lib/font";
import { Search } from "lucide-react";
import { useGenres } from "@/src/hooks/useGenres";
import { useStoriesFilterStore } from "@/src/stores/useStoriesFilterStore";
import { useUserStore } from "@/src/stores/useUserStore";
import { Avatar } from "@heroui/avatar";
import {
  useOnlyOnStorytimeStories,
  useRecentlyAddedStories,
  useTrendingStories,
  usePopularStories,
} from "@/src/hooks/useStoryCategories";
import { useStories } from "@/src/hooks/useStories";

const HomeView = () => {
  const { user } = useUserStore();
  const { selectedGenres, toggleGenre } = useStoriesFilterStore();
  const { genres: apiGenres, isLoading: genresLoading } = useGenres();
  // Use API genres or fallback to empty array
  const genres = apiGenres || [];

  // Sort genres: selected ones first, then alphabetical
  const sortedGenres = useMemo(() => {
    return [...genres].sort((a, b) => {
      const aSelected = selectedGenres.includes(a);
      const bSelected = selectedGenres.includes(b);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.localeCompare(b);
    });
  }, [genres, selectedGenres]);

  // Get filtered stories when genres are selected (using existing useStories hook)
  const { stories: filteredStories, isLoading: filteredLoading } = useStories({
    limit: 50,
    genre: selectedGenres.length > 0 ? selectedGenres[0] : undefined,
  });

  // Fetch stories by category using dedicated endpoints
  const {
    stories: exclusiveStories,
    isLoading: exclusiveLoading,
    loadMore: loadMoreExclusive,
    hasMore: hasMoreExclusive,
    isLoadingMore: isLoadingMoreExclusive,
  } = useOnlyOnStorytimeStories({
    limit: 10,
  });
  const {
    stories: recentStories,
    isLoading: recentLoading,
    loadMore: loadMoreRecent,
    hasMore: hasMoreRecent,
    isLoadingMore: isLoadingMoreRecent,
  } = useRecentlyAddedStories({
    limit: 10,
  });
  const {
    stories: trendingStories,
    isLoading: trendingLoading,
    loadMore: loadMoreTrending,
    hasMore: hasMoreTrending,
    isLoadingMore: isLoadingMoreTrending,
  } = useTrendingStories({
    limit: 10,
  });
  const {
    stories: popularStoriesData,
    isLoading: popularLoading,
    loadMore: loadMorePopular,
    hasMore: hasMorePopular,
    isLoadingMore: isLoadingMorePopular,
  } = usePopularStories({
    limit: 10,
  });

  // Sort popular stories by popularityScore descending
  const popularStories = useMemo(() => {
    if (!popularStoriesData) return [];
    return [...popularStoriesData].sort(
      (a: any, b: any) => (b.popularityScore || 0) - (a.popularityScore || 0)
    );
  }, [popularStoriesData]);

  // Loading state
  const storiesLoading =
    selectedGenres.length > 0
      ? filteredLoading
      : exclusiveLoading || recentLoading || trendingLoading || popularLoading;

  // Memoize story sections to prevent whole view re-render
  const RecentStoriesSection = useMemo(() => {
    if (!recentStories.length) return null;
    return (
      <StoryGroup
        title="Recently Added Stories"
        stories={recentStories}
        categorySlug="recently-added"
        onLoadMore={loadMoreRecent}
        hasMore={hasMoreRecent}
        isLoadingMore={isLoadingMoreRecent}
      />
    );
  }, [recentStories, hasMoreRecent, isLoadingMoreRecent, loadMoreRecent]);

  const TrendingStoriesSection = useMemo(() => {
    if (!trendingStories.length) return null;
    return (
      <StoryGroup
        title="Trending Now"
        stories={trendingStories}
        categorySlug="trending"
        onLoadMore={loadMoreTrending}
        hasMore={hasMoreTrending}
        isLoadingMore={isLoadingMoreTrending}
      />
    );
  }, [
    trendingStories,
    hasMoreTrending,
    isLoadingMoreTrending,
    loadMoreTrending,
  ]);

  const PopularStoriesSection = useMemo(() => {
    if (!popularStories.length) return null;
    return (
      <StoryGroup
        title="Popular This Week"
        stories={popularStories}
        categorySlug="popular"
        onLoadMore={loadMorePopular}
        hasMore={hasMorePopular}
        isLoadingMore={isLoadingMorePopular}
      />
    );
  }, [popularStories, hasMorePopular, isLoadingMorePopular, loadMorePopular]);

  return (
    <div className="min-h-screen px-4 pt-4 space-y-4 bg-accent-shade-1 relative">
      <div className="relative flex items-center justify-between py-2 bg-accent-shade-1">
        <div className="flex items-center gap-3">
          <Link href="/profile" aria-label="Go to profile">
            <Avatar
              src={user?.avatar || user?.profilePicture}
              name={user?.penName || "User"}
              size="md"
              className="cursor-pointer"
              classNames={{
                base: "bg-complimentary-shade-1",
                name: `${Magnetik_Bold.className} text-white`,
              }}
              showFallback
              fallback={
                <img
                  src="/images/storytime-fallback.png"
                  alt="fallback"
                  className="object-cover w-full h-full"
                />
              }
            />
          </Link>
          <div className="flex items-center gap-1">
            <span
              className={`text-lg font-medium ${Magnetik_Medium.className}`}
            >
              Hi{" "}
              <span
                className={`text-primary font-bold ${Magnetik_Bold.className}`}
              >
                {user?.penName || user?.firstName || "Reader"}
              </span>
            </span>
            <span className="text-xl">👋</span>
          </div>
        </div>
        <Link href="/search">
          <Button
            variant="ghost"
            className="p-2 rounded-full text-secondary bg-accent-shade-2"
          >
            <Search className="w-8 h-8 text-complimentary-colour" />
          </Button>
        </Link>
      </div>

      <PremiumBanner />

      {/* Only on Storytime - Carousel */}
      {exclusiveStories.length > 0 && !selectedGenres.length && (
        <div className="">
          <div className="flex items-center justify-between mb-2 h-fit">
            <h2 className={`body-text-small-medium-auto primary-colour`}>
              Only on Storytime
            </h2>
            <Link href={`/category/only-on-storytime`}>
              <Button
                variant="ghost"
                className={`text-grey-2 body-text-smallest-medium-auto`}
              >
                See more
              </Button>
            </Link>
          </div>

          {exclusiveLoading ? (
            <div className="relative h-52 rounded-xl bg-accent-colour animate-pulse" />
          ) : (
            <StoriesCarousel
              stories={exclusiveStories.slice(0, 5)}
              autoPlay={true}
              autoPlayInterval={5000}
              showControls={true}
              showDots={true}
            />
          )}
        </div>
      )}

      {/* Genre Pick */}
      <div className="mb-6 sticky top-[72px] z-40 bg-accent-shade-1 py-2">
        <div className="flex items-center justify-between">
          <h2 className={`body-text-small-medium-auto primary-colour`}>
            Genre Pick
          </h2>

          <Link href={`/all-genres`}>
            <Button
              variant="ghost"
              className={`text-grey-2 body-text-smallest-medium-auto`}
            >
              See all
            </Button>
          </Link>
        </div>

        <div className="relative">
          {genresLoading ? (
            <div className="flex gap-3 pb-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-24 h-10 rounded-lg bg-accent-colour animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 pb-2 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory">
              {sortedGenres.map((genre: string) => (
                <GenreButton
                  key={genre}
                  genre={genre}
                  isSelected={selectedGenres.includes(genre)}
                  onClick={() => toggleGenre(genre)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Story Sections */}
      <div className="pb-20 space-y-4">
        {storiesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="w-48 h-6 rounded bg-accent-colour animate-pulse" />
                <div className="flex gap-3 overflow-x-auto">
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={j}
                      className="flex-shrink-0 w-32 h-48 rounded-lg bg-accent-colour animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : selectedGenres.length > 0 ? (
          <>
            {/* Show filtered results - separate section for each selected genre */}
            {selectedGenres.map((genre) => (
              <GenreSection key={genre} genre={genre} />
            ))}
            
            {/* Show clear filters button if needed */}
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                onClick={() => useStoriesFilterStore.getState().clearGenres()}
                className={`${Magnetik_Medium.className}`}
              >
                Clear filters
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Show all stories when no filters - using memoized sections */}
            {RecentStoriesSection}
            {TrendingStoriesSection}
            {PopularStoriesSection}
          </>
        )}
      </div>
    </div>
  );
};

export default HomeView;
