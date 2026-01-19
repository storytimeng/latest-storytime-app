import { useState, useEffect, useCallback } from "react";
import {
  storiesStore,
  chaptersStore,
  episodesStore,
  OfflineStory,
  OfflineChapter,
  OfflineEpisode,
  getStorageEstimate,
} from "@/lib/offline/db";
import { showToast } from "@/lib/showNotification";
import { useUserStore } from "@/src/stores/useUserStore";

/**
 * Hook for managing offline stories
 */
export function useOfflineStories() {
  const { user } = useUserStore();
  const userId = user?.id;

  const [offlineStories, setOfflineStories] = useState<OfflineStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState({
    usage: 0,
    quota: 0,
    percentUsed: 0,
  });

  // Load all offline stories
  const loadOfflineStories = useCallback(async () => {
    if (!userId) {
      setOfflineStories([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Filter by userId
      const stories = await storiesStore.getByIndex("userId", userId);

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
  }, [userId]);

  useEffect(() => {
    loadOfflineStories();
  }, [loadOfflineStories]);

  // Check if a story is downloaded
  const isStoryDownloaded = useCallback(
    async (storyId: string): Promise<boolean> => {
      if (!userId) return false;
      try {
        const story = await storiesStore.get(`${userId}_${storyId}`);
        return !!story;
      } catch (error) {
        console.error("Failed to check story download status:", error);
        return false;
      }
    },
    [userId],
  );

  // Get downloaded chapters/episodes for a story
  const getDownloadedContent = useCallback(
    async (storyId: string, structure: "chapters" | "episodes" | "single") => {
      if (!userId) return [];
      try {
        if (structure === "chapters" || structure === "single") {
          const chapters = await chaptersStore.getByIndex("storyId", storyId);
          // Filter by userId
          const userChapters = chapters.filter((c) => c.userId === userId);
          return userChapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
        } else {
          const episodes = await episodesStore.getByIndex("storyId", storyId);
          // Filter by userId
          const userEpisodes = episodes.filter((e) => e.userId === userId);
          return userEpisodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
        }
      } catch (error) {
        console.error("Failed to get downloaded content:", error);
        return [];
      }
    },
    [userId],
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
      }>,
    ) => {
      if (!userId) {
        showToast({
          type: "error",
          message: "You must be logged in to download stories",
        });
        return false;
      }

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
        const lastUpdatedAt = story.updatedAt
          ? new Date(story.updatedAt).getTime()
          : downloadedAt;

        // Save story metadata
        const offlineStory: OfflineStory = {
          id: `${userId}_${story.id}`,
          storyId: story.id,
          userId,
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
          lastUpdatedAt,
          metadata: {
            ...story,
          },
        };

        await storiesStore.put(offlineStory);

        // Save chapters/episodes/single content
        for (const item of content) {
          const itemUpdatedAt = (item as any).updatedAt
            ? new Date((item as any).updatedAt).getTime()
            : downloadedAt;

          if (structure === "chapters") {
            const chapter: OfflineChapter = {
              id: `${userId}_${item.id}`,
              chapterId: item.id,
              storyId: story.id,
              userId,
              chapterNumber: item.number,
              title: item.title,
              content: item.content,
              wordCount: item.content ? item.content.split(/\s+/).length : 0,
              downloadedAt,
              lastUpdatedAt: itemUpdatedAt,
            };
            await chaptersStore.put(chapter);
          } else if (structure === "episodes") {
            const episode: OfflineEpisode = {
              id: `${userId}_${item.id}`,
              episodeId: item.id,
              storyId: story.id,
              userId,
              episodeNumber: item.number,
              title: item.title,
              content: item.content,
              downloadedAt,
              lastUpdatedAt: itemUpdatedAt,
            };
            await episodesStore.put(episode);
          } else {
            // For single stories, store as a chapter with number 1
            const chapter: OfflineChapter = {
              id: `${userId}_${item.id}`,
              chapterId: item.id,
              storyId: story.id,
              userId,
              chapterNumber: 1,
              title: item.title,
              content: item.content,
              wordCount: item.content ? item.content.split(/\s+/).length : 0,
              downloadedAt,
              lastUpdatedAt: itemUpdatedAt,
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
    [loadOfflineStories, userId],
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
      }>,
    ) => {
      if (!userId) return false;

      try {
        const downloadedAt = Date.now();

        for (const item of content) {
          const itemUpdatedAt = (item as any).updatedAt
            ? new Date((item as any).updatedAt).getTime()
            : downloadedAt;

          if (structure === "chapters" || structure === "single") {
            const chapter: OfflineChapter = {
              id: `${userId}_${item.id}`,
              chapterId: item.id,
              storyId,
              userId,
              chapterNumber: item.number,
              title: item.title,
              content: item.content,
              wordCount: item.content ? item.content.split(/\s+/).length : 0,
              downloadedAt,
              lastUpdatedAt: itemUpdatedAt,
            };
            await chaptersStore.put(chapter);
          } else {
            const episode: OfflineEpisode = {
              id: `${userId}_${item.id}`,
              episodeId: item.id,
              storyId,
              userId,
              episodeNumber: item.number,
              title: item.title,
              content: item.content,
              downloadedAt,
              lastUpdatedAt: itemUpdatedAt,
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
    [userId],
  );

  // Delete a downloaded story
  const deleteOfflineStory = useCallback(
    async (storyId: string) => {
      if (!userId) return false;

      try {
        // Delete story
        await storiesStore.delete(`${userId}_${storyId}`);

        // Delete all chapters
        const chapters = await chaptersStore.getByIndex("storyId", storyId);
        for (const chapter of chapters) {
          if (chapter.userId === userId) {
            await chaptersStore.delete(chapter.id);
          }
        }

        // Delete all episodes
        const episodes = await episodesStore.getByIndex("storyId", storyId);
        for (const episode of episodes) {
          if (episode.userId === userId) {
            await episodesStore.delete(episode.id);
          }
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
    [loadOfflineStories, userId],
  );

  // Delete specific downloaded content (chapter/episode)
  const deleteOfflineContent = useCallback(
    async (storyId: string, contentId: string, type: "chapter" | "episode") => {
      if (!userId) return false;

      try {
        if (type === "chapter") {
          await chaptersStore.delete(`${userId}_${contentId}`);
        } else {
          await episodesStore.delete(`${userId}_${contentId}`);
        }

        // Check if story has any content left
        const chapters = await chaptersStore.getByIndex("storyId", storyId);
        const userChapters = chapters.filter((c) => c.userId === userId);

        const episodes = await episodesStore.getByIndex("storyId", storyId);
        const userEpisodes = episodes.filter((e) => e.userId === userId);

        if (userChapters.length === 0 && userEpisodes.length === 0) {
          // If no content left, delete the story metadata too
          await storiesStore.delete(`${userId}_${storyId}`);
          await loadOfflineStories(); // Refresh list
        }

        showToast({
          type: "success",
          message: "Removed from downloads",
        });

        return true;
      } catch (error) {
        console.error("Failed to delete offline content:", error);
        showToast({
          type: "error",
          message: "Failed to remove content",
        });
        return false;
      }
    },
    [loadOfflineStories, userId],
  );

  // Update last read time
  const updateLastRead = useCallback(
    async (storyId: string) => {
      if (!userId) return;
      try {
        const story = await storiesStore.get(`${userId}_${storyId}`);
        if (story) {
          story.lastReadAt = Date.now();
          await storiesStore.put(story);
        }
      } catch (error) {
        console.error("Failed to update last read:", error);
      }
    },
    [userId],
  );

  // Sync story metadata if it has been updated on server
  const syncStoryIfNeeded = useCallback(
    async (storyId: string, serverStory: any) => {
      if (!userId) return false;
      try {
        const offlineStory = await storiesStore.get(`${userId}_${storyId}`);
        if (!offlineStory) return false;

        const serverUpdatedAt = serverStory.updatedAt
          ? new Date(serverStory.updatedAt).getTime()
          : 0;
        const offlineUpdatedAt = offlineStory.lastUpdatedAt || 0;

        // If server version is newer, update the offline story
        if (serverUpdatedAt > offlineUpdatedAt) {
          const updatedStory: OfflineStory = {
            ...offlineStory,
            title: serverStory.title,
            description: serverStory.description,
            coverImage: serverStory.coverImage,
            author: serverStory.author,
            genres: serverStory.genres || [],
            status: serverStory.status,
            totalChapters: serverStory.totalChapters,
            totalEpisodes: serverStory.totalEpisodes,
            lastUpdatedAt: serverUpdatedAt,
            metadata: {
              ...serverStory,
            },
          };

          await storiesStore.put(updatedStory);

          showToast({
            type: "info",
            message: "Story updated with latest changes",
          });

          return true;
        }

        return false;
      } catch (error) {
        console.error("Failed to sync story:", error);
        return false;
      }
    },
    [],
  );

  // Sync chapter if it has been updated on server
  const syncChapterIfNeeded = useCallback(
    async (chapterId: string, serverChapter: any) => {
      try {
        const offlineChapter = await chaptersStore.get(chapterId);
        if (!offlineChapter) return false;

        const serverUpdatedAt = serverChapter.updatedAt
          ? new Date(serverChapter.updatedAt).getTime()
          : 0;
        const offlineUpdatedAt = offlineChapter.lastUpdatedAt || 0;

        // If server version is newer, update the offline chapter
        if (serverUpdatedAt > offlineUpdatedAt) {
          const updatedChapter: OfflineChapter = {
            ...offlineChapter,
            title: serverChapter.title,
            content: serverChapter.content,
            wordCount: serverChapter.content.split(/\s+/).length,
            lastUpdatedAt: serverUpdatedAt,
          };

          await chaptersStore.put(updatedChapter);

          showToast({
            type: "info",
            message: "Chapter updated with latest changes",
          });

          return true;
        }

        return false;
      } catch (error) {
        console.error("Failed to sync chapter:", error);
        return false;
      }
    },
    [],
  );

  // Sync episode if it has been updated on server
  const syncEpisodeIfNeeded = useCallback(
    async (episodeId: string, serverEpisode: any) => {
      try {
        const offlineEpisode = await episodesStore.get(episodeId);
        if (!offlineEpisode) return false;

        const serverUpdatedAt = serverEpisode.updatedAt
          ? new Date(serverEpisode.updatedAt).getTime()
          : 0;
        const offlineUpdatedAt = offlineEpisode.lastUpdatedAt || 0;

        // If server version is newer, update the offline episode
        if (serverUpdatedAt > offlineUpdatedAt) {
          const updatedEpisode: OfflineEpisode = {
            ...offlineEpisode,
            title: serverEpisode.title,
            content: serverEpisode.content,
            lastUpdatedAt: serverUpdatedAt,
          };

          await episodesStore.put(updatedEpisode);

          showToast({
            type: "info",
            message: "Episode updated with latest changes",
          });

          return true;
        }

        return false;
      } catch (error) {
        console.error("Failed to sync episode:", error);
        return false;
      }
    },
    [],
  );

  // Sync all chapters for a story
  const syncAllChapters = useCallback(
    async (storyId: string, serverChapters: any[]) => {
      try {
        let updatedCount = 0;

        for (const serverChapter of serverChapters) {
          const wasUpdated = await syncChapterIfNeeded(
            serverChapter.id,
            serverChapter,
          );
          if (wasUpdated) updatedCount++;
        }

        if (updatedCount > 0) {
          showToast({
            type: "success",
            message: `Updated ${updatedCount} chapter${updatedCount > 1 ? "s" : ""}`,
          });
        }

        return updatedCount;
      } catch (error) {
        console.error("Failed to sync chapters:", error);
        return 0;
      }
    },
    [syncChapterIfNeeded],
  );

  // Sync all episodes for a story
  const syncAllEpisodes = useCallback(
    async (storyId: string, serverEpisodes: any[]) => {
      try {
        let updatedCount = 0;

        for (const serverEpisode of serverEpisodes) {
          const wasUpdated = await syncEpisodeIfNeeded(
            serverEpisode.id,
            serverEpisode,
          );
          if (wasUpdated) updatedCount++;
        }

        if (updatedCount > 0) {
          showToast({
            type: "success",
            message: `Updated ${updatedCount} episode${updatedCount > 1 ? "s" : ""}`,
          });
        }

        return updatedCount;
      } catch (error) {
        console.error("Failed to sync episodes:", error);
        return 0;
      }
    },
    [syncEpisodeIfNeeded],
  );

  return {
    offlineStories,
    isLoading,
    storageInfo,
    isStoryDownloaded,
    getDownloadedContent,
    downloadStory,
    downloadAdditionalContent,
    deleteOfflineStory,
    deleteOfflineContent,
    updateLastRead,
    syncStoryIfNeeded,
    syncChapterIfNeeded,
    syncEpisodeIfNeeded,
    syncAllChapters,
    syncAllEpisodes,
    refresh: loadOfflineStories,
  };
}

/**
 * Hook for checking if online/offline
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
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
