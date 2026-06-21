"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import {
  GenreButton,
  StoryGroup,
  PremiumBanner,
  StoriesCarousel,
} from "@/components/reusables";
import GenreSection from "@/views/app/home/GenreSection";
import { Button } from "@/components/ui/button";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { useHomeFeed, useHomeFeedInit } from "@/src/hooks/useHomeFeed";
import { DESKTOP_ROUTES } from "@/config/desktopRoutes";
import { getStoryRoutes } from "@/lib/storyRoutes";

const routes = getStoryRoutes("desktop");

const DESKTOP_GRID = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

function storyHref(id: string) {
  return routes.story(id);
}

export function DesktopHomeView() {
  useHomeFeedInit();
  const isOnline = useOnlineStatus();
  const { user: profileUser } = useUserProfile();
  const feed = useHomeFeed();

  const name = profileUser?.penName || profileUser?.firstName || "Storyteller";

  const recentSection = useMemo(() => {
    if (!feed.recentStories.length) return null;
    return (
      <StoryGroup
        title="Recently Added Stories"
        stories={feed.recentStories}
        categorySlug="recently-added"
        layout="grid"
        gridClassName={DESKTOP_GRID}
        getStoryHref={storyHref}
        onLoadMore={feed.loadMoreRecent}
        hasMore={feed.hasMoreRecent}
        isLoadingMore={feed.isLoadingMoreRecent}
      />
    );
  }, [
    feed.recentStories,
    feed.hasMoreRecent,
    feed.isLoadingMoreRecent,
    feed.loadMoreRecent,
  ]);

  const trendingSection = useMemo(() => {
    if (!feed.trendingStories.length) return null;
    return (
      <StoryGroup
        title="Trending Now"
        stories={feed.trendingStories}
        categorySlug="trending"
        layout="grid"
        gridClassName={DESKTOP_GRID}
        getStoryHref={storyHref}
        onLoadMore={feed.loadMoreTrending}
        hasMore={feed.hasMoreTrending}
        isLoadingMore={feed.isLoadingMoreTrending}
      />
    );
  }, [
    feed.trendingStories,
    feed.hasMoreTrending,
    feed.isLoadingMoreTrending,
    feed.loadMoreTrending,
  ]);

  const popularSection = useMemo(() => {
    if (!feed.popularStories.length) return null;
    return (
      <StoryGroup
        title="Popular This Week"
        stories={feed.popularStories}
        categorySlug="popular"
        layout="grid"
        gridClassName={DESKTOP_GRID}
        getStoryHref={storyHref}
        onLoadMore={feed.loadMorePopular}
        hasMore={feed.hasMorePopular}
        isLoadingMore={feed.isLoadingMorePopular}
      />
    );
  }, [
    feed.popularStories,
    feed.hasMorePopular,
    feed.isLoadingMorePopular,
    feed.loadMorePopular,
  ]);

  if (!isOnline) {
    return (
      <div className="mx-auto max-w-3xl">
        <OfflineIndicator />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Hero */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            className={cn(
              "text-2xl text-[#361B17] md:text-3xl",
              Magnetik_Bold.className,
            )}
          >
            Hi {name} 👋
          </h2>
          <p
            className={cn(
              "mt-1 text-sm text-[#361B17]/60",
              Magnetik_Regular.className,
            )}
          >
            Discover stories curated for you
          </p>
        </div>
        <Link
          href={DESKTOP_ROUTES.search}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#361B17]/70 transition-colors hover:border-black/20 hover:text-[#361B17]",
            Magnetik_Medium.className,
          )}
        >
          <Search className="h-4 w-4" />
          Search stories
        </Link>
      </section>

      <PremiumBanner link={DESKTOP_ROUTES.premium} className="mb-0" />

      {/* Exclusive carousel */}
      {feed.exclusiveStories.length > 0 && !feed.selectedGenres.length && (
        <section className="rounded-2xl border border-black/10 bg-white p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3
              className={cn(
                "text-base text-[#361B17]",
                Magnetik_Medium.className,
              )}
            >
              Only on Storytime
            </h3>
            <Link
              href="/category/only-on-storytime"
              className="text-sm text-[#361B17]/60 hover:text-primary-colour"
            >
              See all
            </Link>
          </div>
          {feed.exclusiveLoading ? (
            <div className="h-64 animate-pulse rounded-xl bg-black/[0.06]" />
          ) : (
            <StoriesCarousel
              stories={feed.exclusiveStories.slice(0, 5)}
              autoPlay
              autoPlayInterval={5000}
              showControls
              showDots
              slideClassName="h-52 md:h-64 lg:h-72"
              getStoryHref={storyHref}
            />
          )}
        </section>
      )}

      {/* Genre filters */}
      <section className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3
            className={cn(
              "text-base text-[#361B17]",
              Magnetik_Medium.className,
            )}
          >
            Genre pick
          </h3>
          <Link
            href="/all-genres"
            className="text-sm text-[#361B17]/60 hover:text-primary-colour"
          >
            See all genres
          </Link>
        </div>
        {feed.genresLoading ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-9 w-24 animate-pulse rounded-lg bg-black/[0.06]"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {feed.sortedGenres.map((genre) => (
              <GenreButton
                key={genre}
                genre={genre}
                isSelected={feed.selectedGenres.includes(genre)}
                onClick={() => feed.toggleGenre(genre)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Story sections */}
      <section className="space-y-10 pb-4">
        {feed.storiesLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[3/4] animate-pulse rounded-xl bg-black/[0.06]" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-black/[0.06]" />
              </div>
            ))}
          </div>
        ) : feed.selectedGenres.length > 0 ? (
          <>
            {feed.selectedGenres.map((genre) => (
              <div
                key={genre}
                className="rounded-2xl border border-black/10 bg-white p-4 md:p-5"
              >
                <GenreSection genre={genre} />
              </div>
            ))}
            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => feed.clearGenres()}>
                Clear filters
              </Button>
            </div>
          </>
        ) : (
          <>
            {recentSection && (
              <div className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
                {recentSection}
              </div>
            )}
            {trendingSection && (
              <div className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
                {trendingSection}
              </div>
            )}
            {popularSection && (
              <div className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
                {popularSection}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
