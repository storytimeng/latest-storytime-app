"use client";

import { SearchResult } from "@/components/reusables/customUI";
import { SearchField } from "@/components/reusables/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import React, { useState, useMemo } from "react";
import data from "@/data/data.json";

interface Story {
  id: number;
  title: string;
  author: string;
  rating: number;
  comments: number;
  genre: string;
  image: string;
  sample: string;
  status: string;
}

const SearchView = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [hasSearched, setHasSearched] = useState(false);

  // Combine all stories from different categories
  const allStories = useMemo(
    () => [
      ...data.stories,
      ...data.oldStories,
      ...data.anonymousStories,
      ...data.hotStories,
      ...(data.popularStories || []),
    ],
    []
  );

  // Filter stories based on search query and genre
  const filteredStories = useMemo(() => {
    let stories = allStories;

    // Filter by genre if not "All"
    if (activeFilter !== "All") {
      stories = stories.filter(
        (story) => story.genre.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    // Filter by search query
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      stories = stories.filter(
        (story) =>
          story.title.toLowerCase().includes(searchLower) ||
          story.author.toLowerCase().includes(searchLower) ||
          story.genre.toLowerCase().includes(searchLower) ||
          story.sample.toLowerCase().includes(searchLower)
      );
    }

    return stories;
  }, [allStories, search, activeFilter]);

  const genres = [
    "All",
    "Adventure",
    "Fantasy",
    "Romance",
    "Mystery",
    "Sci-fi",
    "Horror",
    "Historical",
    "Thriller",
  ];

  const handleFilterClick = (genre: string) => {
    setActiveFilter(genre);
  };

  const handleStoryClick = (story: Story) => {
    // Navigate to story detail page or perform action
    // TODO: Implement navigation logic
    // You can add navigation logic here
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const clearSearch = () => {
    setSearch("");
  };
  return (
    <div className="h-screen flex flex-col bg-accent-shade-1">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 bg-accent-shade-1 pt-4 pb-2 px-4">
        <div className="space-y-4">
          {/* Search Bar and Back Button */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
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
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {genres.map((genre) => (
                <Button
                  key={genre}
                  onClick={() => handleFilterClick(genre)}
                  className={`rounded-lg px-6 py-2 min-w-fit shrink-0 transition-all duration-200 font-medium ${
                    activeFilter === genre
                      ? "bg-primary-colour text-white hover:bg-primary-shade-1"
                      : "bg-transparent text-primary-shade-2 border border-primary-shade-2 hover:bg-primary-shade-2 hover:text-white"
                  }`}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2">
          {/* Search Status */}
          {search && (
            <div className="text-left py-2">
              <p className="text-complimentary-colour text-[14px]">
                Search results
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Search Results Section */}
        <div className="space-y-4">
          {/* Search Results */}
          {search && filteredStories.length > 0 && (
            <div className="space-y-3">
              {filteredStories.map((story) => (
                <SearchResult
                  key={story.id}
                  title={story.title}
                  genre={story.genre}
                  author={story.author}
                  image={story.image}
                  hasWarning={story.status === "Ongoing"}
                  onClick={() => handleStoryClick(story)}
                />
              ))}
            </div>
          )}

          {/* No Results Message */}
          {search && filteredStories.length === 0 && (
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
