import { useState, useEffect } from "react";
import {
  storiesStore,
  chaptersStore,
  episodesStore,
} from "@/lib/offline/indexedDB";

export function useOfflineContent(
  isOnline: boolean,
  storyId: string,
  updateLastRead: (id: string) => Promise<void>
) {
  const [isUsingOfflineData, setIsUsingOfflineData] = useState(false);
  const [offlineStory, setOfflineStory] = useState<any>(null);
  const [offlineContent, setOfflineContent] = useState<any[]>([]);

  useEffect(() => {
    if (!isOnline) {
      const loadOfflineData = async () => {
        try {
          const offlineStoryData = await storiesStore.get(storyId);
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
              setOfflineContent(
                offlineChapters.sort(
                  (a, b) => a.chapterNumber - b.chapterNumber
                )
              );
            } else {
              const offlineEpisodes = await episodesStore.getByIndex(
                "storyId",
                storyId
              );
              setOfflineContent(
                offlineEpisodes.sort(
                  (a, b) => a.episodeNumber - b.episodeNumber
                )
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
  }, [isOnline, storyId, updateLastRead]);

  return {
    isUsingOfflineData,
    offlineStory,
    offlineContent,
  };
}
