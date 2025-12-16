"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@/components/ui/button";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { useUserStories } from "@/src/hooks/useUserStories";
import { Skeleton } from "@heroui/skeleton";
import Link from "next/link";
import { Edit, Eye, ThumbsUp, MessageSquare } from "lucide-react";

export const StoriesModal = () => {
  const { stories, isLoading, error } = useUserStories();

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>My Stories</h2>
        <p className={`text-sm text-grey-3 ${Magnetik_Regular.className}`}>
          {stories.length} {stories.length === 1 ? "story" : "stories"}
        </p>
      </ModalHeader>
      <ModalBody className="pb-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-accent-shade-1 rounded-lg"
              >
                <Skeleton className="w-12 h-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                  <Skeleton className="h-3 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className={`text-red-500 mb-4 ${Magnetik_Regular.className}`}>
              Failed to load your stories. Please try again.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-primary-colour text-white"
            >
              Retry
            </Button>
          </div>
        ) : !Array.isArray(stories) || stories.length === 0 ? (
          <div className="text-center py-8">
            <p className={`text-grey-3 mb-4 ${Magnetik_Regular.className}`}>
              You haven't written any stories yet
            </p>
            <Link href="/new-story">
              <Button className="bg-primary-colour text-white">
                Write Your First Story
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stories.map((story) => (
              <div
                key={story.id}
                className="flex items-center gap-3 p-3 bg-accent-shade-1 rounded-lg hover:bg-accent-shade-2 transition-colors"
              >
                <div className="w-12 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">
                    {story.chapter ? "📖" : story.episodes ? "📺" : "📝"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm truncate ${Magnetik_Medium.className}`}
                  >
                    {story.title}
                  </h3>
                  <p
                    className={`text-xs text-grey-3 ${Magnetik_Regular.className}`}
                  >
                    {Array.isArray(story.genres)
                      ? story.genres.join(", ")
                      : typeof story.genres === "string"
                        ? story.genres
                        : "Uncategorized"}{" "}
                    • {story.storyStatus || "Draft"}
                  </p>
                  <div
                    className={`flex items-center gap-3 mt-1 text-xs text-grey-4 ${Magnetik_Regular.className}`}
                  >
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {story.likeCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {story.commentCount || 0}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href={`/story/${story.id}`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      isIconOnly
                      className="text-primary-colour"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/edit-story/${story.id}`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      isIconOnly
                      className="text-primary-colour"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            <div className="text-center py-4">
              <Link href="/new-story">
                <Button className="bg-primary-colour text-white">
                  Write New Story
                </Button>
              </Link>
            </div>
          </div>
        )}
      </ModalBody>
    </>
  );
};
