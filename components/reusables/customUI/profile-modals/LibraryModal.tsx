"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { storiesControllerGetMyLibrary } from "@/src/client/sdk.gen";
import useSWR from "swr";
import { Skeleton } from "@heroui/skeleton";
import Link from "next/link";
import { Eye } from "lucide-react";

export const LibraryModal = () => {
  const { data, isLoading, error } = useSWR(
    "/stories/my-library",
    async () => {
      const response = await storiesControllerGetMyLibrary();
      if (response.data) {
        const responseData = response.data as any;
        return responseData.data?.stories || responseData.stories || [];
      }
      return [];
    },
    {
      revalidateOnFocus: false,
    }
  );

  const library = Array.isArray(data) ? data : [];

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>My Library</h2>
        <p className={`text-sm text-grey-3 ${Magnetik_Regular.className}`}>
          {library.length} {library.length === 1 ? "story" : "stories"} saved
        </p>
      </ModalHeader>
      <ModalBody className="pb-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-accent-shade-1 rounded-lg"
              >
                <Skeleton className="w-12 h-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className={`text-red-500 mb-4 ${Magnetik_Regular.className}`}>
              Failed to load your library. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary-colour hover:underline"
            >
              Retry
            </button>
          </div>
        ) : library.length === 0 ? (
          <div className="text-center py-8">
            <p className={`text-grey-3 mb-4 ${Magnetik_Regular.className}`}>
              Your library is empty
            </p>
            <Link href="/home">
              <button className="text-primary-colour hover:underline">
                Discover stories to add
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {library.map((story: any) => (
              <Link key={story.id} href={`/story/${story.id}`}>
                <div className="flex items-center gap-3 p-3 bg-accent-shade-1 rounded-lg hover:bg-accent-shade-2 transition-colors cursor-pointer">
                  <div className="w-12 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">📚</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm truncate ${Magnetik_Medium.className}`}
                    >
                      {story.title || "Untitled"}
                    </h3>
                    <p
                      className={`text-xs text-grey-3 ${Magnetik_Regular.className}`}
                    >
                      {Array.isArray(story.genres)
                        ? story.genres.join(", ")
                        : typeof story.genres === "string"
                          ? story.genres
                          : "Uncategorized"}
                    </p>
                  </div>
                  <Eye className="w-4 h-4 text-grey-3" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </ModalBody>
    </>
  );
};
