"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { SearchResult } from "@/components/reusables/customUI";
import { SearchField } from "@/components/reusables/form";
import { Button } from "@/components/ui/button";
import { useGenres } from "@/src/hooks/useGenres";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useSearchStories } from "@/src/hooks/useStoryCategories";
import { useStories } from "@/src/hooks/useStories";
import { getStoryCoverSrc } from "@/lib/storyCover";

function storyHref(id: string) {
  return `/story/${id}`;
}

export function DesktopSearchView() {
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
  } = useStories({ limit: 20, genre: selectedGenre });

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
    <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:gap-8">
      {/* Filters sidebar */}
      <aside className="w-full shrink-0 lg:w-64 xl:w-72">
        <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-4 lg:sticky lg:top-20">
          <div>
            <p
              className={cn(
                "mb-2 text-xs font-semibold uppercase tracking-wider text-[#361B17]/50",
                Magnetik_Medium.className,
              )}
            >
              Search
            </p>
            <SearchField
              htmlFor="desktop-search"
              type="text"
              id="desktop-search"
              placeholder="Title, author, keyword…"
              onChange={setSearch}
              onEnter={() => undefined}
              reqValue="*"
              required={false}
              minLen={0}
              maxLen={100}
              value={search}
              disabled={false}
              isInvalid={false}
              errorMessage=""
              size="lg"
              startcnt={<Search className="h-4 w-4 text-[#361B17]/50" />}
              endcnt={
                search ? (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#361B17]/10 text-[#361B17]"
                  >
                    ×
                  </button>
                ) : undefined
              }
            />
          </div>

          <div>
            <p
              className={cn(
                "mb-2 text-xs font-semibold uppercase tracking-wider text-[#361B17]/50",
                Magnetik_Medium.className,
              )}
            >
              Genre
            </p>
            {genresLoading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-9 animate-pulse rounded-lg bg-black/[0.06]"
                  />
                ))}
              </div>
            ) : (
              <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto lg:flex-col lg:flex-nowrap">
                {genres.map((genre) => (
                  <Button
                    key={genre}
                    onClick={() => setActiveFilter(genre)}
                    className={cn(
                      "min-w-fit shrink-0 justify-start rounded-lg px-3 py-2 text-sm font-medium transition-all lg:w-full",
                      activeFilter === genre
                        ? "bg-primary-colour text-white hover:bg-primary-shade-6"
                        : "border border-black/10 bg-transparent text-[#361B17]/80 hover:bg-black/[0.04]",
                    )}
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Results */}
      <div className="min-w-0 flex-1">
        <div className="mb-4">
          <h2
            className={cn(
              "text-xl text-[#361B17] md:text-2xl",
              Magnetik_Bold.className,
            )}
          >
            {hasQuery ? "Search results" : "Browse stories"}
          </h2>
          <p
            className={cn(
              "mt-1 text-sm text-[#361B17]/60",
              Magnetik_Regular.className,
            )}
          >
            {resultsLabel}
            {selectedGenre ? ` in ${selectedGenre}` : ""}
          </p>
        </div>

        <div
          className="max-h-[calc(100vh-12rem)] overflow-y-auto rounded-2xl border border-black/10 bg-white p-4"
          onScroll={handleScroll}
        >
          {isLoading && (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-lg bg-black/[0.06]"
                />
              ))}
            </div>
          )}

          {!isLoading && stories.length > 0 && (
            <div className="divide-y divide-black/5">
              {stories.map(
                (story: {
                  id: string;
                  title: string;
                  genres?: string[];
                  imageUrl?: string;
                  storyStatus?: string;
                  likeCount?: number;
                  commentCount?: number;
                  viewCount?: number;
                  author?: { penName?: string; name?: string };
                }) => (
                  <Link
                    key={story.id}
                    href={storyHref(story.id)}
                    className="block py-1"
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
                      storyStatus={story.storyStatus}
                      likeCount={story.likeCount ?? 0}
                      commentCount={story.commentCount ?? 0}
                      viewCount={story.viewCount ?? 0}
                    />
                  </Link>
                ),
              )}
            </div>
          )}

          {!isLoading && stories.length === 0 && (
            <div className="py-16 text-center">
              <p className={cn("text-[#361B17]", Magnetik_Medium.className)}>
                {hasQuery
                  ? "No stories match your search."
                  : "No stories in this genre."}
              </p>
              <p
                className={cn(
                  "mt-2 text-sm text-[#361B17]/60",
                  Magnetik_Regular.className,
                )}
              >
                Try another genre or different keywords.
              </p>
            </div>
          )}

          {isLoadingMore && (
            <div className="space-y-3 pt-4">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-lg bg-black/[0.06]"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
