import { useState, useEffect, useCallback } from "react";
import { useChapter, useEpisode } from "@/src/hooks/useStoryDetail";

interface UseStoryContentProps {
  story: any;
  chapters: any[];
  episodes: any[];
  offlineStory: any;
  offlineContent: any[];
  isUsingOfflineData: boolean;
  syncChapterIfNeeded?: (
    chapterId: string,
    serverChapter: any
  ) => Promise<boolean>;
  syncEpisodeIfNeeded?: (
    episodeId: string,
    serverEpisode: any
  ) => Promise<boolean>;
  initialContentId?: string | null;
}

export function useStoryContent({
  story,
  chapters,
  episodes,
  offlineStory,
  offlineContent,
  isUsingOfflineData,
  syncChapterIfNeeded,
  syncEpisodeIfNeeded,
  initialContentId,
}: UseStoryContentProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    initialContentId || null
  );

  const activeStory = isUsingOfflineData ? offlineStory : story;
  const activeChapters = isUsingOfflineData ? offlineContent : chapters;
  const activeEpisodes = isUsingOfflineData ? offlineContent : episodes;

  // Determine if we're using chapters or episodes
  const isChapterMode = activeChapters && activeChapters.length > 0;
  const isEpisodeMode = !isChapterMode && activeEpisodes && activeEpisodes.length > 0;

  // Fetch individual chapter/episode on-demand (only when online)
  const { chapter: fetchedChapter, comments: chapterComments, isLoading: isChapterLoading, mutate: mutateChapter } = useChapter(
    !isUsingOfflineData && isChapterMode && selectedChapterId ? selectedChapterId : undefined
  );
  
  const { episode: fetchedEpisode, comments: episodeComments, isLoading: isEpisodeLoading, mutate: mutateEpisode } = useEpisode(
    !isUsingOfflineData && isEpisodeMode && selectedChapterId ? selectedChapterId : undefined
  );

  // Get current content from either fetched data or offline data
  const currentContent = isUsingOfflineData
    ? (offlineContent.find((c: any) => c.id === selectedChapterId)?.content || "")
    : isChapterMode
    ? (fetchedChapter as any)?.content || ""
    : isEpisodeMode
    ? (fetchedEpisode as any)?.content || ""
    : activeStory?.content || activeStory?.description || "";

  const currentTitle = isUsingOfflineData
    ? (offlineContent.find((c: any) => c.id === selectedChapterId)?.title || activeStory?.title)
    : isChapterMode
    ? (fetchedChapter as any)?.title || ""
    : isEpisodeMode
    ? (fetchedEpisode as any)?.title || ""
    : activeStory?.title || "";

  // Get comments from fetched data
  const currentComments = isChapterMode ? chapterComments : isEpisodeMode ? episodeComments : [];

  // Debug logging
  console.log("useStoryContent Debug:", {
    isChapterMode,
    isEpisodeMode,
    selectedChapterId,
    fetchedEpisode,
    fetchedChapter,
    currentContent: currentContent?.substring(0, 100),
    currentTitle,
    activeEpisodes,
    activeChapters,
  });

  // Set initial content ID when chapters/episodes load
  useEffect(() => {
    if (!selectedChapterId && activeStory) {
      if (isChapterMode) {
        setSelectedChapterId(activeChapters[0]?.id || null);
      } else if (isEpisodeMode) {
        setSelectedChapterId(activeEpisodes[0]?.id || null);
      }
    }
  }, [activeStory, activeChapters, activeEpisodes, isChapterMode, isEpisodeMode, selectedChapterId]);

  // Sync chapter/episode when selection changes and we're online with downloaded content
  useEffect(() => {
    const syncCurrentContent = async () => {
      if (!selectedChapterId || isUsingOfflineData) return;

      if (isChapterMode && fetchedChapter && syncChapterIfNeeded) {
        await syncChapterIfNeeded(selectedChapterId, fetchedChapter);
      } else if (isEpisodeMode && fetchedEpisode && syncEpisodeIfNeeded) {
        await syncEpisodeIfNeeded(selectedChapterId, fetchedEpisode);
      }
    };

    syncCurrentContent();
  }, [
    selectedChapterId,
    isUsingOfflineData,
    fetchedChapter,
    fetchedEpisode,
    isChapterMode,
    isEpisodeMode,
    syncChapterIfNeeded,
    syncEpisodeIfNeeded,
  ]);

  const handleChapterChange = useCallback((chapterId: string) => {
    setSelectedChapterId(chapterId);
    window.scrollTo(0, 0);
  }, []);

  const handlePrevious = useCallback(() => {
    const list = isChapterMode ? activeChapters : isEpisodeMode ? activeEpisodes : [];
    if (!list || list.length === 0) return;

    const currentIndex = list.findIndex(
      (item: any) => item.id === selectedChapterId
    );
    if (currentIndex > 0) {
      setSelectedChapterId(list[currentIndex - 1].id);
      window.scrollTo(0, 0);
    }
  }, [activeChapters, activeEpisodes, selectedChapterId, isChapterMode, isEpisodeMode]);

  const handleNext = useCallback(() => {
    const list = isChapterMode ? activeChapters : isEpisodeMode ? activeEpisodes : [];
    if (!list || list.length === 0) return;

    const currentIndex = list.findIndex(
      (item: any) => item.id === selectedChapterId
    );
    if (currentIndex < list.length - 1) {
      setSelectedChapterId(list[currentIndex + 1].id);
      window.scrollTo(0, 0);
    }
  }, [activeChapters, activeEpisodes, selectedChapterId, isChapterMode, isEpisodeMode]);

  const navigationList = isChapterMode ? activeChapters : isEpisodeMode ? activeEpisodes : [];
  const hasNavigation = navigationList && navigationList.length > 1;
  const currentIndex = Array.isArray(navigationList)
    ? navigationList.findIndex((i: any) => i.id === selectedChapterId)
    : -1;

  return {
    selectedChapterId,
    currentContent,
    currentTitle,
    currentComments,
    hasNavigation,
    navigationList,
    currentIndex,
    activeStory,
    handleChapterChange,
    handlePrevious,
    handleNext,
    isLoading: isChapterLoading || isEpisodeLoading,
  };
}
