"use client";

import React, { useMemo } from "react";
import { StoryGroup } from "@/components/reusables";
import { useStories } from "@/src/hooks/useStories";

interface GenreSectionProps {
  genre: string;
}

const GenreSection: React.FC<GenreSectionProps> = ({ genre }) => {
  const {
    stories,
    isLoading,
    loadMore,
    hasMore,
    isLoadingMore,
    total,
  } = useStories({
    genre,
    limit: 10,
  });

  const Section = useMemo(() => {
    if (!stories.length && !isLoading) return null;

    if (isLoading) {
      return (
        <div className="space-y-2">
          <div className="w-48 h-6 rounded bg-accent-colour animate-pulse" />
          <div className="flex gap-3 overflow-x-auto">
            {[...Array(3)].map((_, j) => (
              <div
                key={j}
                className="flex-shrink-0 w-32 h-48 rounded-lg bg-accent-colour animate-pulse"
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <StoryGroup
        title={`${genre} Stories (${total})`}
        stories={stories}
        categorySlug={`${genre.toLowerCase().replace(/\s+/g, '-')}`}
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      />
    );
  }, [stories, isLoading, total, loadMore, hasMore, isLoadingMore, genre]);

  return Section;
};

export default GenreSection;
