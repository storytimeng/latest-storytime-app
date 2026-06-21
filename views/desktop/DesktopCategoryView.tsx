"use client";

import Link from "next/link";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { StoryGroup } from "@/components/reusables";
import { DESKTOP_ROUTES } from "@/config/desktopRoutes";
import { slugToGenreName } from "@/lib/genreSlug";
import { getStoryRoutes } from "@/lib/storyRoutes";
import { useStories } from "@/src/hooks/useStories";
import {
  useRecentlyAddedStories,
  useTrendingStories,
  usePopularStories,
  useOnlyOnStorytimeStories,
} from "@/src/hooks/useStoryCategories";

const routes = getStoryRoutes("desktop");

const DESKTOP_GRID = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

type CategoryType =
  | "genre"
  | "recently-added"
  | "trending"
  | "popular"
  | "only-on-storytime";

const CURATED_SLUGS = new Set<string>([
  "recently-added",
  "trending",
  "popular",
  "only-on-storytime",
]);

const CATEGORY_TITLES: Record<string, string> = {
  "recently-added": "Recently Added Stories",
  trending: "Trending Now",
  popular: "Popular This Week",
  "only-on-storytime": "Only on Storytime",
};

function categoryTypeFromSlug(slug: string): CategoryType {
  if (CURATED_SLUGS.has(slug)) {
    return slug as CategoryType;
  }
  return "genre";
}

function storyHref(id: string) {
  return routes.story(id);
}

type DesktopCategoryViewProps = {
  categorySlug: string;
};

export function DesktopCategoryView({
  categorySlug,
}: DesktopCategoryViewProps) {
  const categoryType = categoryTypeFromSlug(categorySlug);

  const genreName =
    categoryType === "genre" ? slugToGenreName(categorySlug) : undefined;

  const title =
    categoryType === "genre"
      ? genreName || "Category"
      : CATEGORY_TITLES[categorySlug] || "Stories";

  const genreHook = useStories({
    genre: categoryType === "genre" ? genreName : undefined,
    limit: 20,
  });

  const recentHook = useRecentlyAddedStories({ limit: 20 });
  const trendingHook = useTrendingStories({ limit: 20 });
  const popularHook = usePopularStories({ limit: 20 });
  const exclusiveHook = useOnlyOnStorytimeStories({ limit: 20 });

  const hookData = (() => {
    switch (categoryType) {
      case "recently-added":
        return recentHook;
      case "trending":
        return trendingHook;
      case "popular":
        return popularHook;
      case "only-on-storytime":
        return exclusiveHook;
      case "genre":
        return genreHook;
      default: {
        const _exhaustive: never = categoryType;
        return _exhaustive;
      }
    }
  })();

  const { stories, isLoading, loadMore, hasMore, isLoadingMore, total } =
    hookData;

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

  const countLabel =
    total != null && total > 0
      ? `${total} ${total === 1 ? "story" : "stories"}`
      : `${stories.length} ${stories.length === 1 ? "story" : "stories"}`;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:gap-8">
      <aside className="w-full shrink-0 lg:w-56 xl:w-64">
        <div className="space-y-3 rounded-2xl border border-black/10 bg-white p-4 lg:sticky lg:top-20">
          <Link
            href={DESKTOP_ROUTES.home}
            className={cn(
              "block text-sm text-[#361B17]/60 hover:text-primary-colour",
              Magnetik_Medium.className,
            )}
          >
            ← Back to home
          </Link>
          {categoryType === "genre" && (
            <Link
              href={DESKTOP_ROUTES.allGenres}
              className={cn(
                "block text-sm text-[#361B17]/60 hover:text-primary-colour",
                Magnetik_Medium.className,
              )}
            >
              All genres
            </Link>
          )}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4">
          <h2
            className={cn(
              "text-xl text-[#361B17] md:text-2xl",
              Magnetik_Bold.className,
            )}
          >
            {title}
          </h2>
          <p
            className={cn(
              "mt-1 text-sm text-[#361B17]/60",
              Magnetik_Regular.className,
            )}
          >
            {isLoading ? "Loading stories…" : countLabel}
          </p>
        </div>

        <div
          className="max-h-[calc(100vh-12rem)] overflow-y-auto rounded-2xl border border-black/10 bg-white p-4 md:p-5"
          onScroll={handleScroll}
        >
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[3/4] animate-pulse rounded-xl bg-black/[0.06]" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-black/[0.06]" />
                </div>
              ))}
            </div>
          ) : stories.length > 0 ? (
            <>
              <StoryGroup
                stories={stories}
                showSeeAll={false}
                layout="grid"
                gridClassName={DESKTOP_GRID}
                getStoryHref={storyHref}
                onLoadMore={loadMore}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
              />
              {!hasMore && (
                <p
                  className={cn(
                    "py-6 text-center text-sm text-[#361B17]/50",
                    Magnetik_Regular.className,
                  )}
                >
                  You&apos;ve reached the end
                </p>
              )}
            </>
          ) : (
            <div className="py-16 text-center">
              <p className={cn("text-[#361B17]", Magnetik_Medium.className)}>
                No stories found
              </p>
              <p
                className={cn(
                  "mt-2 text-sm text-[#361B17]/60",
                  Magnetik_Regular.className,
                )}
              >
                No {title.toLowerCase()} available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
