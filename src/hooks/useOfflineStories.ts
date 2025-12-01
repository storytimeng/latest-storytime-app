import { useState, useEffect, useCallback } from "react";
import {
  storiesStore,
  chaptersStore,
  episodesStore,
  OfflineStory,
  OfflineChapter,
  OfflineEpisode,
  getStorageEstimate,
} from "@/lib/offline/indexedDB";
import { showToast } from "@/lib/showNotification";

/**
 * Hook for managing offline stories
 */
export function useOfflineStories() {
  const [offlineStories, setOfflineStories] = useState<OfflineStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState({
    usage: 0,
    quota: 0,
    percentUsed: 0,
  });

  // Load all offline stories
  const loadOfflineStories = useCallback(async () => {
    try {
      setIsLoading(true);
      const stories = await storiesStore.getAll();
      // Sort by last read, then by download date
      stories.sort((a, b) => {
        if (a.lastReadAt && b.lastReadAt) {
          return b.lastReadAt - a.lastReadAt;
        }
        return b.downloadedAt - a.downloadedAt;
      });
      setOfflineStories(stories);

      // Update storage info
      const estimate = await getStorageEstimate();
      setStorageInfo(estimate);
    } catch (error) {
      console.error("Failed to load offline stories:", error);
      showToast({
        type: "error",
        message: "Failed to load downloaded stories",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOfflineStories();
  }, [loadOfflineStories]);

  // Check if a story is downloaded
  const isStoryDownloaded = useCallback(
    async (storyId: string): Promise<boolean> => {
      try {
        const story = await storiesStore.get(storyId);
        return !!story;
      } catch (error) {
        console.error("Failed to check story download status:", error);
        return false;
      }
    },
    []
  );

  // Get downloaded chapters/episodes for a story
  const getDownloadedContent = useCallback(
    async (storyId: string, structure: "chapters" | "episodes" | "single") => {
      try {
        if (structure === "chapters" || structure === "single") {
          const chapters = await chaptersStore.getByIndex("storyId", storyId);
          return chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
        } else {
          const episodes = await episodesStore.getByIndex("storyId", storyId);
          return episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
        }
      } catch (error) {
        console.error("Failed to get downloaded content:", error);
        return [];
      }
    },
    []
  );

  // Download a story with its content
  const downloadStory = useCallback(
    async (
      story: any,
      content: Array<{
        id: string;
        title: string;
        content: string;
        number: number;
      }>
    ) => {
      try {
        // Determine structure: chapters, episodes, or single
        let structure: "chapters" | "episodes" | "single" = "single";
        if (
          story.structure === "chapters" ||
          (story.totalChapters && story.totalChapters > 0)
        ) {
          structure = "chapters";
        } else if (
          story.structure === "episodes" ||
          (story.totalEpisodes && story.totalEpisodes > 0)
        ) {
          structure = "episodes";
        }

        const downloadedAt = Date.now();

        // Save story metadata
        const offlineStory: OfflineStory = {
          id: story.id,
          title: story.title,
          description: story.description,
          coverImage: story.coverImage,
          author: story.author,
          genres: story.genres || [],
          status: story.status,
          structure,
          totalChapters: story.totalChapters,
          totalEpisodes: story.totalEpisodes,
          downloadedAt,
          metadata: {
            ...story,
          },
        };

        await storiesStore.put(offlineStory);

        // Save chapters/episodes/single content
        for (const item of content) {
          if (structure === "chapters") {
            const chapter: OfflineChapter = {
              id: item.id,
              storyId: story.id,
              chapterNumber: item.number,
              title: item.title,
              content: item.content,
              wordCount: item.content.split(/\s+/).length,
              downloadedAt,
            };
            await chaptersStore.put(chapter);
          } else if (structure === "episodes") {
            const episode: OfflineEpisode = {
              id: item.id,
              storyId: story.id,
              episodeNumber: item.number,
              title: item.title,
              content: item.content,
              downloadedAt,
            };
            await episodesStore.put(episode);
          } else {
            // For single stories, store as a chapter with number 1
            const chapter: OfflineChapter = {
              id: item.id,
              storyId: story.id,
              chapterNumber: 1,
              title: item.title,
              content: item.content,
              wordCount: item.content.split(/\s+/).length,
              downloadedAt,
            };
            await chaptersStore.put(chapter);
          }
        }

        await loadOfflineStories();

        const contentType =
          structure === "single" ? "story" : `${content.length} ${structure}`;
        showToast({
          type: "success",
          message: `Downloaded ${story.title}${structure === "single" ? "" : " with " + contentType}`,
        });

        return true;
      } catch (error) {
        console.error("Failed to download story:", error);
        showToast({
          type: "error",
          message: "Failed to download story",
        });
        return false;
      }
    },
    [loadOfflineStories]
  );

  // Download additional chapters/episodes
  const downloadAdditionalContent = useCallback(
    async (
      storyId: string,
      structure: "chapters" | "episodes" | "single",
      content: Array<{
        id: string;
        title: string;
        content: string;
        number: number;
      }>
    ) => {
      try {
        const downloadedAt = Date.now();

        for (const item of content) {
          if (structure === "chapters" || structure === "single") {
            const chapter: OfflineChapter = {
              id: item.id,
              storyId,
              chapterNumber: item.number,
              title: item.title,
              content: item.content,
              wordCount: item.content.split(/\s+/).length,
              downloadedAt,
            };
            await chaptersStore.put(chapter);
          } else {
            const episode: OfflineEpisode = {
              id: item.id,
              storyId,
              episodeNumber: item.number,
              title: item.title,
              content: item.content,
              downloadedAt,
            };
            await episodesStore.put(episode);
          }
        }

        showToast({
          type: "success",
          message: `Downloaded ${content.length} additional ${structure}`,
        });

        return true;
      } catch (error) {
        console.error("Failed to download additional content:", error);
        showToast({
          type: "error",
          message: "Failed to download content",
        });
        return false;
      }
    },
    []
  );

  // Delete a downloaded story
  const deleteOfflineStory = useCallback(
    async (storyId: string) => {
      try {
        // Delete story
        await storiesStore.delete(storyId);

        // Delete all chapters
        const chapters = await chaptersStore.getByIndex("storyId", storyId);
        for (const chapter of chapters) {
          await chaptersStore.delete(chapter.id);
        }

        // Delete all episodes
        const episodes = await episodesStore.getByIndex("storyId", storyId);
        for (const episode of episodes) {
          await episodesStore.delete(episode.id);
        }

        await loadOfflineStories();

        showToast({
          type: "success",
          message: "Removed from downloads",
        });

        return true;
      } catch (error) {
        console.error("Failed to delete offline story:", error);
        showToast({
          type: "error",
          message: "Failed to remove download",
        });
        return false;
      }
    },
    [loadOfflineStories]
  );

  // Update last read time
  const updateLastRead = useCallback(async (storyId: string) => {
    try {
      const story = await storiesStore.get(storyId);
      if (story) {
        story.lastReadAt = Date.now();
        await storiesStore.put(story);
      }
    } catch (error) {
      console.error("Failed to update last read:", error);
    }
  }, []);

  return {
    offlineStories,
    isLoading,
    storageInfo,
    isStoryDownloaded,
    getDownloadedContent,
    downloadStory,
    downloadAdditionalContent,
    deleteOfflineStory,
    updateLastRead,
    refresh: loadOfflineStories,
  };
}

/**
 * Hook for checking if online/offline
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      showToast({
        type: "info",
        message: "Back online",
      });
    }

    function handleOffline() {
      setIsOnline(false);
      showToast({
        type: "warning",
        message: "You're offline. Showing downloaded content.",
      });
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
