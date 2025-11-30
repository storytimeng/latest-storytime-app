"use client";

import { SearchResult } from "@/components/reusables/customUI";
import { SearchField } from "@/components/reusables/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useGenres } from "@/src/hooks/useGenres";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useSearchStories } from "@/src/hooks/useStoryCategories";

const SearchView = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce search query
  const debouncedSearch = useDebounce(search, 300);

  // Fetch genres
  const { genres: apiGenres, isLoading: genresLoading } = useGenres();
  const genres = ["All", ...(apiGenres || [])];

  // Fetch stories with search and filter using dedicated search endpoint
  const { stories, isLoading } = useSearchStories({
    query: debouncedSearch || "",
    // @ts-ignore
    genre: activeFilter !== "All" ? activeFilter : undefined,
    limit: 50,
  });

  const handleFilterClick = (genre: string) => {
    setActiveFilter(genre);
  };

  const handleStoryClick = (storyId: string) => {
    // Navigation is handled by Link in SearchResult component
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    if (value.trim()) {
      setHasSearched(true);
    }
  };

  const clearSearch = () => {
    setSearch("");
    setHasSearched(false);
  };

  return (
    <div className="h-screen flex flex-col bg-accent-shade-1">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 bg-accent-shade-1 pt-4 pb-2 px-4">
        <div className="space-y-4">
          {/* Search Bar and Back Button */}
          <div className="flex items-center gap-4">
            <Link href="/home" className="flex items-center gap-2 cursor-pointer">
              <ArrowLeft size={20} className="text-secondary" />
            </Link>
            <div className="flex-1">
              <SearchField
                htmlFor="search"
                type="text"
                id="search"
                placeholder="Search stories"
                onChange={handleSearch}
                onEnter={() => {
                  if (search.trim()) setHasSearched(true);
                }}
                reqValue="*"
                required={true}
                minLen={1}
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
            {!hasSearched && !search.trim() && (
              <p className="text-complimentary-colour shrink-0">Search</p>
            )}
          </div>

          {/* Genre Filters */}
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
          {/* Search Status */}
          {search && (
            <div className="text-left py-2">
              <p className="text-complimentary-colour text-[14px]">
                {isLoading
                  ? "Searching..."
                  : `${stories.length} result${stories.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Search Results Section */}
        <div className="space-y-4">
          {/* Loading State */}
          {isLoading && search && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-accent-colour animate-pulse rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Search Results */}
          {!isLoading && search && stories.length > 0 && (
            <div className="space-y-3">
              {stories.map((story: any) => (
                <SearchResult
                  key={story.id}
                  title={story.title}
                  genre={story.genres?.[0] || "Unknown"}
                  author={(story.author as any)?.penName || story.author?.name || "Anonymous"}
                  image={story.imageUrl || "/images/placeholder.jpg"}
                  hasWarning={(story as any).storyStatus === "ongoing"}
                  onClick={() => handleStoryClick(story.id)}
                />
              ))}
            </div>
          )}

          {/* No Results Message */}
          {!isLoading && search && stories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-primary-shade-2 text-[14px]">
                No stories found matching your search criteria.
              </p>
              <p className="text-primary-shade-2 text-[14px] mt-2">
                Try adjusting your search terms or genre filter.
              </p>
            </div>
          )}

          {/* Initial State */}
          {!search && (
            <div className="text-center py-12">
              <p className="text-primary-shade-2 text-[14px]">
                Start typing to search for stories
              </p>
              <p className="text-primary-shade-2 text-[14px] mt-2">
                Use the genre filters above to narrow down your search
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchView;
