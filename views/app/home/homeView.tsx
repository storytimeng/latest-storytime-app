"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/AppLink";
import { useMemo, useEffect } from "react";
import {
  GenreButton,
  StoryGroup,
  PremiumBanner,
  StoriesCarousel,
} from "@/components/reusables";
import GenreSection from "./GenreSection";
import { Magnetik_Medium, Magnetik_Bold } from "@/lib/font";
import { Search } from "lucide-react";
import { useGenres } from "@/src/hooks/useGenres";
import { useStoriesFilterStore } from "@/src/stores/useStoriesFilterStore";
import { useUserStore } from "@/src/stores/useUserStore";
import { Avatar } from "@heroui/avatar";
import {
  usePopularStories,
  useRecentlyAddedStories,
  useTrendingStories,
  useOnlyOnStorytimeStories,
} from "@/src/hooks/useStoryCategories";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";
import { OfflineIndicator } from "@/components/OfflineIndicator";

/** Skeleton row shown while a section is still loading */
function SectionSkeleton() {
  return (
    <div className="space-y-2">
      <div className="w-48 h-6 rounded bg-accent-colour animate-pulse" />
      <div className="flex gap-3 overflow-x-auto">
        {[...Array(3)].map((_, j) => (
          <div key={j} className="flex-shrink-0 w-32 h-48 rounded-lg bg-accent-colour animate-pulse" />
        ))}
      </div>
    </div>
  );
}

/** Skeleton for the carousel while exclusive stories load */
function CarouselSkeleton() {
  return <div className="relative h-52 md:h-80 rounded-xl bg-accent-colour animate-pulse" />;
}

const HOME_LIMIT = 10;

const HomeView = () => {
  const { user } = useUserStore();
  const isOnline = useOnlineStatus();
  const { selectedGenres, toggleGenre } = useStoriesFilterStore();
  const { genres: apiGenres, isLoading: genresLoading } = useGenres();
  const genres = apiGenres || [];

  // Clear genre filters on first mount so users always start fresh
  useEffect(() => {
    useStoriesFilterStore.getState().clearGenres();
  }, []);

  // Four independent fetches — each section renders as soon as its own data arrives
  const { stories: exclusiveStories, isLoading: exclusiveLoading } = useOnlyOnStorytimeStories({ limit: HOME_LIMIT });
  const { stories: recentStories, isLoading: recentLoading } = useRecentlyAddedStories({ limit: HOME_LIMIT });
  const { stories: trendingStories, isLoading: trendingLoading } = useTrendingStories({ limit: HOME_LIMIT });
  const { stories: popularStories, isLoading: popularLoading } = usePopularStories({ limit: HOME_LIMIT });

  // Sort genres: selected first, then alphabetical
  const sortedGenres = useMemo(() => {
    return [...genres].sort((a, b) => {
      const aSelected = selectedGenres.includes(a);
      const bSelected = selectedGenres.includes(b);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.localeCompare(b);
    });
  }, [genres, selectedGenres]);

  // Popular sorted client-side by score
  const sortedPopular = useMemo(
    () => [...popularStories].sort((a: any, b: any) => (b.popularityScore || 0) - (a.popularityScore || 0)),
    [popularStories],
  );

  // Exclusive filtered to only truly exclusive stories
  const exclusive = useMemo(
    () => exclusiveStories.filter((s: any) => s.onlyOnStorytime === true),
    [exclusiveStories],
  );

  if (!isOnline) return <OfflineIndicator />;

  return (
    <div className="min-h-screen px-4 md:px-6 lg:px-8 pt-4 space-y-4 bg-accent-shade-1 relative">
      {/* Header */}
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
                <img src="/images/storytime-fallback.png" alt="fallback" className="object-cover w-full h-full" />
              }
            />
          </Link>
          <div className="flex items-center gap-1">
            <span className={`text-lg font-medium ${Magnetik_Medium.className}`}>
              Hi{" "}
              <span className={`text-primary font-bold ${Magnetik_Bold.className}`}>
                {user?.penName || user?.firstName || "Reader"}
              </span>
            </span>
            <span className="text-xl">👋</span>
          </div>
        </div>
        <Link href="/search">
          <Button variant="ghost" className="p-2 rounded-full text-secondary bg-accent-shade-2">
            <Search className="w-8 h-8 text-complimentary-colour" />
          </Button>
        </Link>
      </div>

      <PremiumBanner />

      {/* Only on Storytime carousel — renders as soon as exclusive data arrives */}
      {!selectedGenres.length && (
        <div>
          <div className="flex items-center justify-between mb-2 h-fit">
            <h2 className="body-text-small-medium-auto primary-colour">Only on Storytime</h2>
            <Link href="/category/only-on-storytime">
              <Button variant="ghost" className="text-grey-2 body-text-smallest-medium-auto">See more</Button>
            </Link>
          </div>
          {exclusiveLoading ? (
            <CarouselSkeleton />
          ) : exclusive.length > 0 ? (
            <StoriesCarousel
              stories={exclusive.slice(0, 5)}
              autoPlay={true}
              autoPlayInterval={5000}
              showControls={true}
              showDots={true}
            />
          ) : null}
        </div>
      )}

      {/* Genre picker */}
      <div className="mb-6 sticky top-[72px] z-40 bg-accent-shade-1 py-2">
        <div className="flex items-center justify-between">
          <h2 className="body-text-small-medium-auto primary-colour">Genre Pick</h2>
          <Link href="/all-genres">
            <Button variant="ghost" className="text-grey-2 body-text-smallest-medium-auto">See all</Button>
          </Link>
        </div>
        <div className="relative">
          {genresLoading ? (
            <div className="flex gap-3 pb-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-24 h-10 rounded-lg bg-accent-colour animate-pulse" />
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

      {/* Story sections — each renders independently as its data arrives */}
      <div className="pb-20 md:pb-6 space-y-4">
        {selectedGenres.length > 0 ? (
          <>
            {selectedGenres.map((genre) => (
              <GenreSection key={genre} genre={genre} />
            ))}
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                onClick={() => useStoriesFilterStore.getState().clearGenres()}
                className={Magnetik_Medium.className}
              >
                Clear filters
              </Button>
            </div>
          </>
        ) : (
          <>
            {recentLoading ? (
              <SectionSkeleton />
            ) : recentStories.length > 0 ? (
              <StoryGroup
                title="Recently Added Stories"
                stories={recentStories}
                categorySlug="recently-added"
              />
            ) : null}

            {trendingLoading ? (
              <SectionSkeleton />
            ) : trendingStories.length > 0 ? (
              <StoryGroup
                title="Trending Now"
                stories={trendingStories}
                categorySlug="trending"
              />
            ) : null}

            {popularLoading ? (
              <SectionSkeleton />
            ) : sortedPopular.length > 0 ? (
              <StoryGroup
                title="Popular This Week"
                stories={sortedPopular}
                categorySlug="popular"
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default HomeView;
