import { useState, useEffect, useCallback } from "react";
import { storiesStore, chaptersStore, episodesStore } from "@/lib/offline/db";
import { useUserStore } from "@/src/stores/useUserStore";

export function useOfflineContent(storyId: string) {
  const { user } = useUserStore();
  const userId = user?.id;

  const [hasOfflineRecord, setHasOfflineRecord] = useState(false);
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
      setHasOfflineRecord(true);

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

  /**
   * True only when the device is offline AND the specific chapter/episode
   * being requested actually exists in local storage. A stale or partial
   * offline record for the story metadata (hasOfflineRecord) is NOT enough
   * on its own to shadow the network fetch — that was the previous bug:
   * any local record at all forced every chapter to resolve from offline
   * storage, even chapters that were never downloaded, silently blanking
   * the reader with zero network calls.
   */
  const isContentAvailableOffline = useCallback(
    (contentId: string | null | undefined) => {
      if (!contentId || !hasOfflineRecord) return false;
      return offlineContent.some((c: any) => c.id === contentId);
    },
    [hasOfflineRecord, offlineContent],
  );

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
    hasOfflineRecord,
    offlineStory,
    offlineContent,
    isContentAvailableOffline,
    isLoaded,
    updateLastRead,
  };
}
