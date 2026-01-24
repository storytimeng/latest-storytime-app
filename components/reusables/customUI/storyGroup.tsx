"use client";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";
import { Magnetik_Bold } from "@/lib/font";
import { cn } from "@/lib/utils";
import StoryCard from "./storyCard";
import { useInfiniteScroll } from "@/src/hooks/useInfiniteScroll";
import Link from "next/link";

import { StoryResponseDto } from "@/src/client/types.gen";

interface StoryGroupProps {
  title?: string;
  stories: StoryResponseDto[];
  showSeeAll?: boolean;
  categorySlug?: string;
  className?: string;
  containerClassName?: string;
  scrollClassName?: string;
  cardClassName?: string;
  layout?: "horizontal" | "grid";
  // Infinite scroll props
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

const StoryGroup = React.memo(
  ({
    title,
    stories,
    showSeeAll = true,
    categorySlug,
    className,
    containerClassName,
    scrollClassName,
    cardClassName,
    layout = "horizontal",
    onLoadMore,
    hasMore = false,
    isLoadingMore = false,
  }: StoryGroupProps) => {
    const router = useRouter();
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Trigger loadMore when user scrolls 70% through the horizontal list
    useInfiniteScroll(
      scrollRef,
      () => {
        if (onLoadMore && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.7, enabled: layout === "horizontal" && !!onLoadMore }
    );

    if (!stories || stories.length === 0) {
      return (
        <div className={cn("px-4", className)}>
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xl font-bold text-black ${Magnetik_Bold.className}`}
              >
                {title}
              </h2>
              {showSeeAll && (
                <Button
                  variant="ghost"
                  className={`text-grey-2 body-text-smallest-medium-auto`}
                >
                  See all
                </Button>
              )}
            </div>
          )}
          <p className="text-muted-foreground">No stories available</p>
        </div>
      );
    }

    const handleStoryCardClick = (storyId: string | number) => {
      router.push(`/story/${storyId}`);
    };

    return (
      <div className={cn("", className)}>
        {title && (
          <div className="flex items-center justify-between mb-2">
            <h2 className={`body-text-small-medium-auto text-black`}>
              {title}
            </h2>
             
            {showSeeAll && categorySlug && (
                          <Link prefetch={true} href={`/category/${categorySlug}`}>

              <Button
                variant="ghost"
                className={`text-grey-2 body-text-smallest-medium-auto`}
                 
              >
                See all
              </Button>
               </Link>
            )}
          </div>
        )}

        {layout === "horizontal" ? (
          <ScrollShadow
            ref={scrollRef}
            orientation="horizontal"
            size={20}
            hideScrollBar={false}
            isEnabled={true}
            visibility="auto"
            className={cn("w-full scrollbar-hide", scrollClassName)}
          >
            <div className={cn("flex gap-4", containerClassName)}>
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  className={cardClassName}
                  onClick={handleStoryCardClick}
                />
              ))}
              {/* Loading indicator */}
              {isLoadingMore && (
                <div className="flex items-center justify-center min-w-[160px] h-[240px]">
                  <div className="w-8 h-8 border-4 border-complimentary-colour border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </ScrollShadow>
        ) : (
          <div className={cn("grid grid-cols-2 gap-4", containerClassName)}>
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                className={cn("w-full", cardClassName)}
                onClick={handleStoryCardClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

StoryGroup.displayName = "StoryGroup";

export default StoryGroup;
