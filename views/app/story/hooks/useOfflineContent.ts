import { useState, useEffect, useCallback } from "react";
import { storiesStore, chaptersStore, episodesStore } from "@/lib/offline/db";
import { useUserStore } from "@/src/stores/useUserStore";

export function useOfflineContent(storyId: string) {
  const { user } = useUserStore();
  const userId = user?.id;

  const [isUsingOfflineData, setIsUsingOfflineData] = useState(false);
  const [offlineStory, setOfflineStory] = useState<any>(null);
  const [offlineContent, setOfflineContent] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadOffline = useCallback(async () => {
    if (!userId || !storyId) {
      setIsLoaded(true);
      return;
    }
    try {
      const offlineStoryData = await storiesStore.get(`${userId}_${storyId}`);
      if (!offlineStoryData) {
        setIsLoaded(true);
        return;
      }

      setOfflineStory(offlineStoryData);
      setIsUsingOfflineData(true);

      if (offlineStoryData.structure === "chapters") {
        const offlineChapters = await chaptersStore.getByIndex(
          "storyId",
          storyId,
        );
        const userChapters = offlineChapters.filter(
          (c: any) => c.userId === userId,
        );
        setOfflineContent(
          userChapters.sort(
            (a: any, b: any) => a.chapterNumber - b.chapterNumber,
          ),
        );
      } else {
        const offlineEpisodes = await episodesStore.getByIndex(
          "storyId",
          storyId,
        );
        const userEpisodes = offlineEpisodes.filter(
          (e: any) => e.userId === userId,
        );
        setOfflineContent(
          userEpisodes.sort(
            (a: any, b: any) => a.episodeNumber - b.episodeNumber,
          ),
        );
      }
    } catch (error) {
      // IndexedDB failure is not fatal — just continue without offline data.
      console.error("Failed to load offline data:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [userId, storyId]);

  useEffect(() => {
    loadOffline();
  }, [loadOffline]);

  const updateLastRead = useCallback(async () => {
    if (!userId || !storyId || !offlineStory) return;
    try {
      const updated = {
        ...offlineStory,
        lastReadAt: Date.now(),
      };
      await storiesStore.put(updated);
    } catch {
      // Ignore — best-effort.
    }
  }, [userId, storyId, offlineStory]);

  return {
    isUsingOfflineData,
    offlineStory,
    offlineContent,
    isLoaded,
    updateLastRead,
  };
}