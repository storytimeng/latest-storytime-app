"use client";

import { useParams } from "next/navigation";
import { useRef, useEffect, useCallback } from "react";
import { PageHeader, StoryGroup } from "@/components/reusables";
import { useStories } from "@/src/hooks/useStories";
import {
  useRecentlyAddedStories,
  useTrendingStories,
  usePopularStories,
  useOnlyOnStorytimeStories,
} from "@/src/hooks/useStoryCategories";

type CategoryType = "genre" | "recently-added" | "trending" | "popular" | "only-on-storytime";

interface CategoryViewProps {
  categorySlug?: string;
  type?: CategoryType;
}

// Map slug to display title
const CATEGORY_TITLES: Record<string, string> = {
  "recently-added": "Recently Added Stories",
  trending: "Trending Now",
  popular: "Popular This Week",
  "only-on-storytime": "Only on StoryTime",
};

const CategoryView = ({
  categorySlug: propSlug,
  type: propType,
}: CategoryViewProps) => {
  const params = useParams();
  const categorySlug = propSlug || (params?.slug as string);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Determine type from slug or prop
  const categoryType: CategoryType =
    propType ||
    (["recently-added", "trending", "popular", "only-on-storytime"].includes(categorySlug)
      ? (categorySlug as CategoryType)
      : "genre");

  // Convert slug to readable genre name for genre type
  const genreName =
    categoryType === "genre"
      ? categorySlug
          ?.split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : undefined;

  // Get title based on type
  const title =
    categoryType === "genre"
      ? genreName || "Category"
      : CATEGORY_TITLES[categorySlug] || "Stories";

  // Use appropriate hook based on type
  const genreHook = useStories({
    genre: categoryType === "genre" ? genreName : undefined,
    limit: 20,
  });

  const recentHook = useRecentlyAddedStories({
    limit: 20,
  });

  const trendingHook = useTrendingStories({
    limit: 20,
  });

  const popularHook = usePopularStories({
    limit: 20,
  });

  const exclusiveHook = useOnlyOnStorytimeStories({
    limit: 20,
  });

  // Select the right hook data based on type
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
      default:
        return {
          stories: genreHook.stories,
          isLoading: genreHook.isLoading,
          loadMore: () => {},
          hasMore: false,
          isLoadingMore: false,
        };
    }
  })();

  const { stories, isLoading, loadMore, hasMore, isLoadingMore } = hookData;

  // Infinite scroll handler - triggers at 70% scroll
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasMore || isLoadingMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage >= 0.7) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div
      ref={scrollContainerRef}
      className="min-h-screen px-4 pt-4 pb-20 bg-accent-shade-1 overflow-y-auto"
    >
      <PageHeader title={title} showBackButton />

      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-accent-colour animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : stories.length > 0 ? (
          <>
            <StoryGroup
              stories={stories}
              showSeeAll={false}
              layout="grid"
            />
            {/* Loading indicator for infinite scroll */}
            {isLoadingMore && (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-4 border-complimentary-colour border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {/* End of list indicator */}
            {!hasMore && stories.length > 0 && (
              <div className="text-center py-6 text-grey-2 text-sm">
                You&apos;ve reached the end
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4 text-6xl">📚</div>
            <h3 className="text-lg font-bold text-grey-3 mb-2">
              No stories found
            </h3>
            <p className="text-sm text-grey-2">
              No {title.toLowerCase()} available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryView;
