"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { GenreButton, StoryGroup, PremiumBanner } from "@/components/reusables";
import { Magnetik_Medium, Magnetik_Bold, Magnetik_Regular } from "@/lib/font";
import data from "@/data/data.json";

// Define Story interface for type safety
interface Story {
  id: number;
  newId: number;
  title: string;
  author: string;
  rating: number;
  comments: number;
  status: string;
  triggerWarning?: boolean;
  exclusive?: boolean;
  isAnonymous?: boolean;
  isChaptered: boolean;
  genre: string;
  image: string;
  sample: string;
  analytics: {
    views: number;
    likes: number;
    comments: number;
  };
  chapters?: Array<{
    id: number;
    title: string;
    content: string;
  }>;
}

const HomeView = () => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Extract data from imported JSON
  const { stories, oldStories, anonymousStories, hotStories } = data;

  // Define genres array
  const genres = [
    "Romance",
    "Drama",
    "Adventure",
    "Mystery",
    "Fantasy",
    "Sci-Fi",
    "Thriller",
    "Comedy",
    "Horror",
    "Historical",
    "Contemporary",
    "Young Adult",
  ];

  // Handle genre selection/deselection
  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        // Remove genre if already selected
        return prev.filter((g) => g !== genre);
      } else {
        // Add genre if not selected
        return [...prev, genre];
      }
    });
  };

  // Sort genres: selected ones first, then alphabetical
  const sortedGenres = [...genres].sort((a, b) => {
    const aSelected = selectedGenres.includes(a);
    const bSelected = selectedGenres.includes(b);

    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return a.localeCompare(b);
  });

  // Filter stories based on selected genres
  const filterStoriesByGenre = (storyArray: Story[]) => {
    if (selectedGenres.length === 0) return storyArray;
    return storyArray.filter((story) => selectedGenres.includes(story.genre));
  };

  // Get filtered story arrays
  const filteredStories = filterStoriesByGenre(stories);
  const filteredOldStories = filterStoriesByGenre(oldStories);
  const filteredAnonymousStories = filterStoriesByGenre(anonymousStories);
  const filteredHotStories = filterStoriesByGenre(hotStories);

  return (
    <div className="min-h-screen px-4 pt-4 space-y-4 bg-accent-shade-1">
      <div className="sticky top-0 z-50 flex items-center justify-between py-2 bg-accent-shade-1">
        <div className="flex items-center gap-3">
          <Link href="/app/profile" aria-label="Go to profile">
            <div className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer bg-complimentary-shade-1">
              <h1 className={Magnetik_Bold.className}>T</h1>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <span
              className={`text-lg font-medium ${Magnetik_Medium.className}`}
            >
              Hi{" "}
              <span
                className={`text-secondary font-bold ${Magnetik_Bold.className}`}
              >
                Rubystar
              </span>
            </span>
            <span className="text-xl">👋</span>
          </div>
        </div>
        <Link href="/app/search">
          <Button
            variant="ghost"
            className="p-2 rounded-full text-secondary bg-accent-shade-2"
          >
            <Search className="w-8 h-8 text-complimentary-colour" />
          </Button>
        </Link>
      </div>
      <PremiumBanner />
      {/* Only on Storytime */}
      <div className="">
        <div className="flex items-center justify-between mb-2 h-fit">
          <h2 className={`body-text-small-medium-auto primary-colour`}>
            Only on Storytime
          </h2>
          <Link href={`/app/all-genres`}>
            <Button
              variant="ghost"
              className={`text-grey-2 body-text-smallest-medium-auto`}
            >
              See more
            </Button>
          </Link>
        </div>
        <div className="relative overflow-hidden border-none rounded-xl">
          <div className="relative h-52 rounded-xl">
            <Image
              src="/images/nature.jpg"
              alt="Maria's Best"
              className="w-full h-full object-fit rounded-xl"
              width={100}
              height={500}
            />
            <div className="absolute top-2 right-2">
              <div className="bg-accent-colour body-text-smallest-medium-auto px-3 py-[3px] rounded-[2px] text-primary-colour">
                Romance
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-center bg-gradient-to-t from-black/100 to-transparent">
              <h3
                className={`text-white text-lg font-bold mb-1 ${Magnetik_Bold.className}`}
              >
                Maria&apos;s Best
              </h3>
              <p
                className={`text-white/90 text-[10px] leading-relaxed ${Magnetik_Medium.className}`}
              >
                Maria Kim, a beautiful young lady that every man wanted, but her
                price was too high. The beautiful lady wanted more than what
                they were offering...
                <span
                  className={`text-[10px] font-bold text-complimentary-colour ${Magnetik_Bold.className}`}
                >
                  by Jane Moore
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Genre Pick */}
      <div className="mb-6 ">
        <div className="flex items-center justify-between">
          <h2 className={`body-text-small-medium-auto primary-colour`}>
            Genre Pick
          </h2>

          <Link href={`/app/all-genres`}>
            <Button
              variant="ghost"
              className={`text-grey-2 body-text-smallest-medium-auto`}
            >
              See all
            </Button>
          </Link>
        </div>

        <div className="relative">
          <div className="flex gap-3 pb-2 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory">
            {sortedGenres.map((genre: string) => (
              <GenreButton
                key={genre}
                genre={genre}
                isSelected={selectedGenres.includes(genre)}
                onClick={() => handleGenreToggle(genre)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Story Sections */}
      <div className="pb-20 space-y-4">
        {selectedGenres.length > 0 ? (
          <>
            {/* Show filtered results */}
            {filteredStories.length > 0 && (
              <StoryGroup
                title={`Recently Added Stories (${filteredStories.length})`}
                stories={filteredStories}
                categorySlug="recently-added"
              />
            )}

            {filteredOldStories.length > 0 && (
              <StoryGroup
                title={`Old Stories (${filteredOldStories.length})`}
                stories={filteredOldStories}
                categorySlug="old-stories"
              />
            )}

            {filteredAnonymousStories.length > 0 && (
              <StoryGroup
                title={`Anonymous (${filteredAnonymousStories.length})`}
                stories={filteredAnonymousStories}
                categorySlug="anonymous"
              />
            )}

            {filteredHotStories.length > 0 && (
              <StoryGroup
                title={`As e de hot (${filteredHotStories.length})`}
                stories={filteredHotStories}
                categorySlug="hot-stories"
              />
            )}

            {/* No results message */}
            {filteredStories.length === 0 &&
              filteredOldStories.length === 0 &&
              filteredAnonymousStories.length === 0 &&
              filteredHotStories.length === 0 && (
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
                    onClick={() => setSelectedGenres([])}
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
              stories={stories}
              categorySlug="recently-added"
            />
            <StoryGroup
              title="Old Stories"
              stories={oldStories}
              categorySlug="old-stories"
            />
            <StoryGroup
              title="Anonymous"
              stories={anonymousStories}
              categorySlug="anonymous"
            />
            <StoryGroup
              title="As e de hot"
              stories={hotStories}
              categorySlug="hot-stories"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default HomeView;
