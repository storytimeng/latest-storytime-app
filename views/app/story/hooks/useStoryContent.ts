import { useState, useEffect, useCallback, useMemo } from "react";
import { useChapter, useEpisode } from "@/src/hooks/useStoryDetail";

export type StoryStructure = "single" | "chapters" | "episodes";

interface UseStoryContentProps {
  story: any;
  chapters: any[];
  episodes: any[];
  structure: StoryStructure;
  offlineStory: any;
  offlineContent: any[];
  isUsingOfflineData: boolean;
  syncChapterIfNeeded?: (
    chapterId: string,
    serverChapter: any,
  ) => Promise<boolean>;
  syncEpisodeIfNeeded?: (
    episodeId: string,
    serverEpisode: any,
  ) => Promise<boolean>;
  initialContentId?: string | null;
}

function sortStoryParts(list: any[]) {
  return [...list].sort((a, b) => {
    const aNum = a.chapterNumber ?? a.episodeNumber ?? 0;
    const bNum = b.chapterNumber ?? b.episodeNumber ?? 0;
    return aNum - bNum;
  });
}

export function useStoryContent({
  story,
  chapters,
  episodes,
  structure,
  offlineStory,
  offlineContent,
  isUsingOfflineData,
  syncChapterIfNeeded,
  syncEpisodeIfNeeded,
  initialContentId,
}: UseStoryContentProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    initialContentId || null,
  );

  const activeStory = isUsingOfflineData ? offlineStory : story;
  const activeChapters = isUsingOfflineData ? offlineContent : chapters;
  const activeEpisodes = isUsingOfflineData ? offlineContent : episodes;

  const isChapterMode = structure === "chapters";
  const isEpisodeMode = structure === "episodes";

  const navigationList = useMemo(() => {
    if (isChapterMode) {
      return sortStoryParts(
        (activeChapters || []).filter((ch: { id?: string }) => ch?.id),
      );
    }
    if (isEpisodeMode) {
      return sortStoryParts(
        (activeEpisodes || []).filter((ep: { id?: string }) => ep?.id),
      );
    }
    return [];
  }, [activeChapters, activeEpisodes, isChapterMode, isEpisodeMode]);

  const {
    chapter: fetchedChapter,
    comments: chapterComments,
    isLoading: isChapterLoading,
    mutate: mutateChapter,
  } = useChapter(
    !isUsingOfflineData && isChapterMode && selectedChapterId
      ? selectedChapterId
      : undefined,
  );

  const {
    episode: fetchedEpisode,
    comments: episodeComments,
    isLoading: isEpisodeLoading,
    mutate: mutateEpisode,
  } = useEpisode(
    !isUsingOfflineData && isEpisodeMode && selectedChapterId
      ? selectedChapterId
      : undefined,
  );

  const fetchedChapterContent =
    (fetchedChapter as { id?: string; content?: string })?.id ===
    selectedChapterId
      ? (fetchedChapter as { content?: string })?.content || ""
      : "";

  const fetchedEpisodeContent =
    (fetchedEpisode as { id?: string; content?: string })?.id ===
    selectedChapterId
      ? (fetchedEpisode as { content?: string })?.content || ""
      : "";

  const currentContent = isUsingOfflineData
    ? offlineContent.find((c: { id?: string }) => c.id === selectedChapterId)
        ?.content || ""
    : isChapterMode
      ? fetchedChapterContent
      : isEpisodeMode
        ? fetchedEpisodeContent
        : activeStory?.content || activeStory?.description || "";

  const currentTitle = isUsingOfflineData
    ? offlineContent.find((c: { id?: string }) => c.id === selectedChapterId)
        ?.title || activeStory?.title
    : isChapterMode
      ? (fetchedChapter as { title?: string; chapterNumber?: number })?.title ||
        `Chapter ${(fetchedChapter as { chapterNumber?: number })?.chapterNumber ?? ""}`
      : isEpisodeMode
        ? (fetchedEpisode as { title?: string; episodeNumber?: number })
            ?.title ||
          `Episode ${(fetchedEpisode as { episodeNumber?: number })?.episodeNumber ?? ""}`
        : activeStory?.title || "";

  const currentComments = isChapterMode
    ? chapterComments
    : isEpisodeMode
      ? episodeComments
      : [];

  useEffect(() => {
    if (initialContentId) {
      setSelectedChapterId(initialContentId);
    }
  }, [initialContentId]);

  useEffect(() => {
    if (initialContentId || selectedChapterId || navigationList.length === 0) {
      return;
    }
    setSelectedChapterId(navigationList[0].id);
  }, [initialContentId, selectedChapterId, navigationList]);

  useEffect(() => {
    const syncCurrentContent = async () => {
      if (!selectedChapterId || isUsingOfflineData) return;

      if (isChapterMode && fetchedChapter && syncChapterIfNeeded) {
        await syncChapterIfNeeded(selectedChapterId, fetchedChapter);
      } else if (isEpisodeMode && fetchedEpisode && syncEpisodeIfNeeded) {
        await syncEpisodeIfNeeded(selectedChapterId, fetchedEpisode);
      }
    };

    void syncCurrentContent();
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
    if (!navigationList.length) return;

    const currentIdx = navigationList.findIndex(
      (item: { id: string }) => item.id === selectedChapterId,
    );
    if (currentIdx > 0) {
      setSelectedChapterId(navigationList[currentIdx - 1].id);
      window.scrollTo(0, 0);
    }
  }, [navigationList, selectedChapterId]);

  const handleNext = useCallback(() => {
    if (!navigationList.length) return;

    const currentIdx = navigationList.findIndex(
      (item: { id: string }) => item.id === selectedChapterId,
    );
    if (currentIdx >= 0 && currentIdx < navigationList.length - 1) {
      setSelectedChapterId(navigationList[currentIdx + 1].id);
      window.scrollTo(0, 0);
    }
  }, [navigationList, selectedChapterId]);

  const hasNavigation = navigationList.length > 1;
  const currentIndex = navigationList.findIndex(
    (item: { id: string }) => item.id === selectedChapterId,
  );

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
    structure,
  };
}
