"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { GenreButton, StoryGroup, PremiumBanner, StoriesCarousel } from "@/components/reusables";
import { Magnetik_Medium, Magnetik_Bold, Magnetik_Regular } from "@/lib/font";
import { Search } from "lucide-react";
import { useStories } from "@/src/hooks/useStories";
import { useGenres } from "@/src/hooks/useGenres";
import { useStoriesFilterStore } from "@/src/stores/useStoriesFilterStore";
import { useUserStore } from "@/src/stores/useUserStore";
import { Avatar } from "@heroui/avatar";

const HomeView = () => {
  const { user } = useUserStore();
  const { selectedGenres, toggleGenre } = useStoriesFilterStore();
  const { genres: apiGenres, isLoading: genresLoading } = useGenres();
  
  // Fetch stories with selected genre filter
  const { stories, isLoading: storiesLoading } = useStories({
    limit: 50,
    genre: selectedGenres.length > 0 ? selectedGenres[0] : undefined,
  });

  // Use API genres or fallback to empty array
  const genres = apiGenres || [];

  // Sort genres: selected ones first, then alphabetical
  const sortedGenres = [...genres].sort((a, b) => {
    const aSelected = selectedGenres.includes(a);
    const bSelected = selectedGenres.includes(b);

    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return a.localeCompare(b);
  });

  // Group stories by category (you can customize this logic based on your API)
  const recentStories = stories.slice(0, 10);
  const featuredStories = stories.slice(0, 5); // For carousel

  return (
    <div className="min-h-screen px-4 pt-4 space-y-4 bg-accent-shade-1">
      <div className="sticky top-0 z-50 flex items-center justify-between py-2 bg-accent-shade-1">
        <div className="flex items-center gap-3">
          <Link href="/profile" aria-label="Go to profile">
            <Avatar
              src={user?.profilePicture}
              name={user?.penName || "User"}
              size="md"
              className="cursor-pointer"
              classNames={{
                base: "bg-complimentary-shade-1",
                name: `${Magnetik_Bold.className} text-white`,
              }}
              showFallback
            />
          </Link>
          <div className="flex items-center gap-1">
            <span
              className={`text-lg font-medium ${Magnetik_Medium.className}`}
            >
              Hi{" "}
              <span
                className={`text-secondary font-bold ${Magnetik_Bold.className}`}
              >
                {user?.penName || "Reader"}
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
      <div className="">
        <div className="flex items-center justify-between mb-2 h-fit">
          <h2 className={`body-text-small-medium-auto primary-colour`}>
            Only on Storytime
          </h2>
          <Link href={`/all-genres`}>
            <Button
              variant="ghost"
              className={`text-grey-2 body-text-smallest-medium-auto`}
            >
              See more
            </Button>
          </Link>
        </div>

        {storiesLoading ? (
          <div className="relative h-52 rounded-xl bg-accent-colour animate-pulse" />
        ) : (
          <StoriesCarousel
            stories={featuredStories}
            autoPlay={true}
            autoPlayInterval={5000}
            showControls={true}
            showDots={true}
          />
        )}
      </div>

      {/* Genre Pick */}
      <div className="mb-6 ">
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
                  className="h-10 w-24 rounded-lg bg-accent-colour animate-pulse"
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
                <div className="h-6 w-48 bg-accent-colour animate-pulse rounded" />
                <div className="flex gap-3 overflow-x-auto">
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={j}
                      className="h-48 w-32 bg-accent-colour animate-pulse rounded-lg flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : selectedGenres.length > 0 ? (
          <>
            {/* Show filtered results */}
            {stories.length > 0 ? (
              <StoryGroup
                title={`${selectedGenres.join(", ")} Stories (${stories.length})`}
                stories={stories}
                categorySlug="filtered"
              />
            ) : (
              <div className="py-12 text-center">
                <div className="mb-4 text-6xl">📚</div>
                <h3
                  className={`text-lg font-bold text-grey-3 mb-2 ${Magnetik_Bold.className}`}
                >
                  No stories found
                </h3>
                <p
                  className={`text-sm text-grey-2 mb-4 ${Magnetik_Regular.className}`}
                >
                  No stories match the selected genres:{" "}
                  <span className="font-semibold">
                    {selectedGenres.join(", ")}
                  </span>
                </p>
                <Button
                  variant="secondary"
                  onClick={() => useStoriesFilterStore.getState().clearGenres()}
                  className={`${Magnetik_Medium.className}`}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Show all stories when no filters */}
            <StoryGroup
              title="Recently Added Stories"
              stories={recentStories}
              categorySlug="recently-added"
            />
            <StoryGroup
              title="Trending Now"
              stories={stories.slice(10, 20)}
              categorySlug="trending"
            />
            <StoryGroup
              title="Popular This Week"
              stories={stories.slice(20, 30)}
              categorySlug="popular"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default HomeView;
