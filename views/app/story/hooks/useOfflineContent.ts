import { useState, useEffect } from "react";
import {
  storiesStore,
  chaptersStore,
  episodesStore,
} from "@/lib/offline/indexedDB";
import { useUserStore } from "@/src/stores/useUserStore";

export function useOfflineContent(
  isOnline: boolean,
  storyId: string,
  updateLastRead: (id: string) => Promise<void>
) {
  const { user } = useUserStore();
  const userId = user?.id;

  const [isUsingOfflineData, setIsUsingOfflineData] = useState(false);
  const [offlineStory, setOfflineStory] = useState<any>(null);
  const [offlineContent, setOfflineContent] = useState<any[]>([]);

  useEffect(() => {
    if (!isOnline && userId) {
      const loadOfflineData = async () => {
        try {
          const offlineStoryData = await storiesStore.get(
            `${userId}_${storyId}`
          );
          if (offlineStoryData) {
            setOfflineStory(offlineStoryData);
            setIsUsingOfflineData(true);

            // Update last read time
            await updateLastRead(storyId);

            // Load chapters/episodes
            if (offlineStoryData.structure === "chapters") {
              const offlineChapters = await chaptersStore.getByIndex(
                "storyId",
                storyId
              );
              const userChapters = offlineChapters.filter(
                (c) => c.userId === userId
              );
              setOfflineContent(
                userChapters.sort((a, b) => a.chapterNumber - b.chapterNumber)
              );
            } else {
              const offlineEpisodes = await episodesStore.getByIndex(
                "storyId",
                storyId
              );
              const userEpisodes = offlineEpisodes.filter(
                (e) => e.userId === userId
              );
              setOfflineContent(
                userEpisodes.sort((a, b) => a.episodeNumber - b.episodeNumber)
              );
            }
          }
        } catch (error) {
          console.error("Failed to load offline data:", error);
        }
      };

      loadOfflineData();
    } else {
      setIsUsingOfflineData(false);
      setOfflineStory(null);
      setOfflineContent([]);
    }
  }, [isOnline, storyId, updateLastRead, userId]);

  return {
    isUsingOfflineData,
    offlineStory,
    offlineContent,
  };
}
