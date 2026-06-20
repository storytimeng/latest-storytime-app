"use client";

import { SearchResult } from "@/components/reusables/customUI";
import { SearchField } from "@/components/reusables/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useState } from "react";
import { useGenres } from "@/src/hooks/useGenres";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useSearchStories } from "@/src/hooks/useStoryCategories";
import { useStories } from "@/src/hooks/useStories";
import { getStoryCoverSrc } from "@/lib/storyCover";

const SearchView = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const debouncedSearch = useDebounce(search, 300);
  const selectedGenre = activeFilter !== "All" ? activeFilter : undefined;
  const hasQuery = debouncedSearch.trim().length > 0;

  const { genres: apiGenres, isLoading: genresLoading } = useGenres();
  const genres = ["All", ...(apiGenres || [])];

  const {
    stories: browseStories,
    isLoading: browseLoading,
    isLoadingMore: browseLoadingMore,
    hasMore: browseHasMore,
    loadMore: browseLoadMore,
    total: browseTotal,
  } = useStories({
    limit: 20,
    genre: selectedGenre,
  });

  const {
    stories: searchStoriesList,
    isLoading: searchLoading,
    isLoadingMore: searchLoadingMore,
    hasMore: searchHasMore,
    loadMore: searchLoadMore,
    total: searchTotal,
  } = useSearchStories({
    query: debouncedSearch,
    genre: selectedGenre,
    limit: 20,
  });

  const stories = hasQuery ? searchStoriesList : browseStories;
  const isLoading = hasQuery ? searchLoading : browseLoading;
  const isLoadingMore = hasQuery ? searchLoadingMore : browseLoadingMore;
  const hasMore = hasQuery ? searchHasMore : browseHasMore;
  const loadMore = hasQuery ? searchLoadMore : browseLoadMore;
  const total = hasQuery ? searchTotal : browseTotal;

  const handleFilterClick = (genre: string) => {
    setActiveFilter(genre);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const clearSearch = () => {
    setSearch("");
  };

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const nearBottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight + 120;

      if (nearBottom && hasMore && !isLoading && !isLoadingMore) {
        loadMore();
      }
    },
    [hasMore, isLoading, isLoadingMore, loadMore],
  );

  const resultsLabel = isLoading
    ? "Loading stories..."
    : `${total || stories.length} result${(total || stories.length) !== 1 ? "s" : ""}`;

  return (
    <div className="h-screen flex flex-col bg-accent-shade-1">
      <div className="flex-shrink-0 bg-accent-shade-1 pt-4 pb-2 px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Link
              href="/home"
              className="flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={20} className="text-secondary" />
            </Link>
            <div className="flex-1">
              <SearchField
                htmlFor="search"
                type="text"
                id="search"
                placeholder="Search stories"
                onChange={handleSearch}
                onEnter={() => undefined}
                reqValue="*"
                required={false}
                minLen={0}
                maxLen={100}
                value={search}
                disabled={false}
                isInvalid={false}
                errorMessage="Search is required"
                size="lg"
                startcnt={<Search className="w-4 h-4 text-secondary" />}
                endcnt={
                  search ? (
                    <button
                      aria-label="Clear search"
                      onClick={clearSearch}
                      className="h-7 w-7 rounded-full bg-primary-shade-3 flex items-center justify-center text-white"
                      type="button"
                    >
                      ×
                    </button>
                  ) : undefined
                }
              />
            </div>
          </div>

          <div className="w-full">
            {genresLoading ? (
              <div className="flex gap-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-24 rounded-lg bg-accent-colour animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {genres.map((genre) => (
                  <Button
                    key={genre}
                    onClick={() => handleFilterClick(genre)}
                    className={`rounded-lg px-6 py-2 min-w-fit shrink-0 transition-all duration-200 font-medium ${
                      activeFilter === genre
                        ? "bg-primary text-white hover:bg-primary-1"
                        : "bg-transparent text-primary-shade-2 border border-primary-shade-2 hover:bg-primary-shade-2 hover:text-white"
                    }`}
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          <div className="text-left py-2">
            <p className="text-complimentary-colour text-[14px]">
              {resultsLabel}
              {selectedGenre ? ` in ${selectedGenre}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4" onScroll={handleScroll}>
        <div className="space-y-4">
          {isLoading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-accent-colour animate-pulse rounded-lg"
                />
              ))}
            </div>
          )}

          {!isLoading && stories.length > 0 && (
            <div className="space-y-3">
              {stories.map(
                (story: {
                  id: string;
                  title: string;
                  genres?: string[];
                  imageUrl?: string;
                  storyStatus?: string;
                  author?: { penName?: string; name?: string };
                }) => (
                  <Link
                    key={story.id}
                    href={`/story/${story.id}`}
                    className="block"
                  >
                    <SearchResult
                      title={story.title}
                      genre={story.genres?.[0] || "Unknown"}
                      author={
                        story.author?.penName ||
                        story.author?.name ||
                        "Anonymous"
                      }
                      image={getStoryCoverSrc(story.imageUrl)}
                      hasWarning={story.storyStatus === "ongoing"}
                    />
                  </Link>
                ),
              )}
            </div>
          )}

          {!isLoading && stories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-primary-shade-2 text-[14px]">
                {hasQuery
                  ? "No stories found matching your search criteria."
                  : "No stories found for this genre."}
              </p>
              <p className="text-primary-shade-2 text-[14px] mt-2">
                Try another genre or search by title, author, or keyword.
              </p>
            </div>
          )}

          {isLoadingMore && (
            <div className="space-y-3 pt-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-accent-colour animate-pulse rounded-lg"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchView;
