"use client";

import { ScrollShadow } from "@heroui/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";
import { Magnetik_Bold } from "@/lib/font";
import { cn } from "@/lib/utils";
import StoryCard from "./storyCard";

interface Story {
  id: number;
  title: string;
  author: string;
  rating: number;
  comments: number;
  genre: string;
  image: string;
  status: string;
}

interface StoryGroupProps {
  title?: string;
  stories: Story[];
  showSeeAll?: boolean;
  categorySlug?: string;
  className?: string;
  containerClassName?: string;
  scrollClassName?: string;
  cardClassName?: string;
  layout?: "horizontal" | "grid";
}

const StoryGroup = ({
  title,
  stories,
  showSeeAll = true,
  categorySlug,
  className,
  containerClassName,
  scrollClassName,
  cardClassName,
  layout = "horizontal",
}: StoryGroupProps) => {
  const router = useRouter();

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

  return (
    <div className={cn("", className)}>
      {title && (
        <div className="flex items-center justify-between mb-2">
          <h2 className={`body-text-small-medium-auto text-black`}>
            {title}
          </h2>
          {showSeeAll && categorySlug && (
            <Button
              variant="ghost"
              className={`text-grey-2 body-text-smallest-medium-auto`}
              onPress={() => router.push(`/app/category/${categorySlug}`)}
            >
              See all
            </Button>
          )}
        </div>
      )}

      {layout === "horizontal" ? (
        <ScrollShadow
          orientation="horizontal"
          size={10}
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
              />
            ))}
          </div>
        </ScrollShadow>
      ) : (
        <div className={cn("grid grid-cols-2 gap-4", containerClassName)}>
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              className={cn("w-full", cardClassName)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StoryGroup;
