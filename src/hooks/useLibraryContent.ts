"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usersControllerGetAllReadingProgress } from "@/src/client/sdk.gen";
import { useReadingHistory } from "@/src/hooks/useReadingHistory";
import { useOfflineStories } from "@/src/hooks/useOfflineStories";

export type LibraryTab = "library" | "downloads";

export type LibraryFilter = "all" | "in-progress" | "completed";

export type LibraryStoryItem = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  coverImage?: string;
  author?: { penName?: string; name?: string; avatar?: string };
  genres?: string[];
  status?: string;
  progress?: number;
  isDeleted?: boolean;
};

function mapHistoryToStories(
  history: unknown[],
  readingProgress: Record<string, number>,
): LibraryStoryItem[] {
  return history.map((item: unknown) => {
    const entry = item as {
      id?: string;
      storyId?: string;
      story?: {
        id: string;
        title: string;
        description?: string;
        imageUrl?: string;
        author?: LibraryStoryItem["author"];
        storyStatus?: string;
      };
    };

    const story = entry.story;

    if (!story) {
      return {
        id: entry.storyId || `deleted-${entry.id}`,
        title: "Unavailable Story",
        description: "This story is no longer available.",
        imageUrl: "/images/storytime-fallback.png",
        coverImage: "/images/storytime-fallback.png",
        author: { penName: "Former Author" },
        genres: [],
        status: "deleted",
        progress: 0,
        isDeleted: true,
      };
    }

    return {
      id: story.id,
      title: story.title,
      description: story.description,
      imageUrl: story.imageUrl,
      coverImage: story.imageUrl,
      author: story.author,
      genres: [],
      status: story.storyStatus,
      progress: readingProgress[story.id] ?? 0,
    };
  });
}

function applyLibraryFilter(
  stories: LibraryStoryItem[],
  filter: LibraryFilter,
): LibraryStoryItem[] {
  switch (filter) {
    case "in-progress":
      return stories.filter(
        (s) => !s.isDeleted && (s.progress ?? 0) > 0 && (s.progress ?? 0) < 100,
      );
    case "completed":
      return stories.filter((s) => !s.isDeleted && (s.progress ?? 0) >= 100);
    default:
      return stories;
  }
}

export function useLibraryContent(page: number, activeTab: LibraryTab) {
  const [readingProgress, setReadingProgress] = useState<
    Record<string, number>
  >({});

  const { history, isLoading, totalPages } = useReadingHistory(page, 20);

  const {
    offlineStories,
    isLoading: isLoadingOffline,
    storageInfo,
    deleteOfflineStory,
  } = useOfflineStories();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await usersControllerGetAllReadingProgress({
          query: { page: 1, limit: 100 },
        });

        if (response.error || !response.data) return;

        const payload = response.data as Record<string, unknown>;
        const nested = payload.data;
        const progressData = Array.isArray(nested)
          ? nested
          : Array.isArray(payload)
            ? payload
            : Array.isArray(response.data)
              ? response.data
              : [];

        const progressMap: Record<string, number> = {};

        if (Array.isArray(progressData)) {
          progressData.forEach((item: unknown) => {
            const row = item as {
              storyId?: string;
              percentageRead?: number;
            };
            if (row.storyId !== undefined && row.percentageRead !== undefined) {
              progressMap[row.storyId] = row.percentageRead;
            }
          });
        }

        setReadingProgress(progressMap);
      } catch (error) {
        console.error("Error fetching reading progress:", error);
      }
    };

    if (activeTab === "library" && history.length > 0) {
      void fetchProgress();
    }
  }, [activeTab, history]);

  const libraryStories = useMemo(
    () => mapHistoryToStories(history, readingProgress),
    [history, readingProgress],
  );

  const downloadedStories = useMemo<LibraryStoryItem[]>(
    () =>
      offlineStories.map((offline) => ({
        id: offline.id,
        title: offline.title,
        description: offline.description,
        imageUrl: offline.coverImage,
        coverImage: offline.coverImage,
        author: offline.author,
        genres: offline.genres,
        status: offline.status,
      })),
    [offlineStories],
  );

  const filterStories = useCallback(
    (filter: LibraryFilter) => {
      const base = activeTab === "library" ? libraryStories : downloadedStories;
      return activeTab === "library" ? applyLibraryFilter(base, filter) : base;
    },
    [activeTab, libraryStories, downloadedStories],
  );

  return {
    libraryStories,
    downloadedStories,
    filterStories,
    isLoadingHistory: isLoading,
    isLoadingOffline,
    totalPages,
    storageInfo,
    deleteOfflineStory,
    historyCount: libraryStories.length,
    downloadsCount: downloadedStories.length,
  };
}
