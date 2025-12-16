"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@/components/ui/button";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { useUserStories } from "@/src/hooks/useUserStories";
import { Skeleton } from "@heroui/skeleton";
import Link from "next/link";
import { Edit } from "lucide-react";

export const DraftsModal = () => {
  const { stories, isLoading, error } = useUserStories();
  const drafts = Array.isArray(stories)
    ? stories.filter(
        (story) =>
          story.storyStatus === "Draft" || story.storyStatus === "draft"
      )
    : [];

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>My Drafts</h2>
        <p className={`text-sm text-grey-3 ${Magnetik_Regular.className}`}>
          {drafts.length} {drafts.length === 1 ? "draft" : "drafts"}
        </p>
      </ModalHeader>
      <ModalBody className="pb-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-accent-shade-1"
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
              Failed to load your drafts. Please try again.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="text-white bg-primary-colour"
            >
              Retry
            </Button>
          </div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-8">
            <p className={`text-grey-3 mb-4 ${Magnetik_Regular.className}`}>
              You don't have any drafts
            </p>
            <Link href="/new-story">
              <Button className="text-white bg-primary-colour">
                Start Writing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-accent-shade-1 hover:bg-accent-shade-2 transition-colors"
              >
                <div className="flex items-center justify-center w-12 h-16 rounded bg-grey-3">
                  <span className="text-xs text-white">📝</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm truncate ${Magnetik_Medium.className}`}
                  >
                    {draft.title || "Untitled Story"}
                  </h3>
                  <p
                    className={`text-xs text-grey-3 ${Magnetik_Regular.className}`}
                  >
                    {Array.isArray(draft.genres)
                      ? draft.genres.join(", ")
                      : typeof draft.genres === "string"
                        ? draft.genres
                        : "Uncategorized"}{" "}
                    • Draft
                  </p>
                  <p
                    className={`text-xs text-grey-4 ${Magnetik_Regular.className}`}
                  >
                    Last edited {formatDate(draft.createdAt)}
                  </p>
                </div>
                <Link href={`/edit-story/${draft.id}`}>
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
            ))}
            <div className="py-4 text-center">
              <Link href="/new-story">
                <Button className="w-full text-white bg-primary-colour">
                  Start New Draft
                </Button>
              </Link>
            </div>
          </div>
        )}
      </ModalBody>
    </>
  );
};
