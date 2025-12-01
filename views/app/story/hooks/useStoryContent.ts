import { useState, useEffect, useCallback } from "react";

interface UseStoryContentProps {
  story: any;
  chapters: any[];
  episodes: any[];
  offlineStory: any;
  offlineContent: any[];
  isUsingOfflineData: boolean;
}

export function useStoryContent({
  story,
  chapters,
  episodes,
  offlineStory,
  offlineContent,
  isUsingOfflineData,
}: UseStoryContentProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null
  );
  const [currentContent, setCurrentContent] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");

  const activeStory = isUsingOfflineData ? offlineStory : story;
  const activeChapters = isUsingOfflineData ? offlineContent : chapters;
  const activeEpisodes = isUsingOfflineData ? offlineContent : episodes;

  useEffect(() => {
    if (activeStory) {
      if (activeChapters && activeChapters.length > 0) {
        if (!selectedChapterId) {
          setSelectedChapterId(activeChapters[0].id);
          setCurrentContent(activeChapters[0].content);
          setCurrentTitle(activeChapters[0].title);
        } else {
          const chapter = activeChapters.find(
            (c: any) => c.id === selectedChapterId
          );
          if (chapter) {
            setCurrentContent(chapter.content);
            setCurrentTitle(chapter.title);
          }
        }
      } else if (activeEpisodes && activeEpisodes.length > 0) {
        if (!selectedChapterId) {
          setSelectedChapterId(activeEpisodes[0].id);
          setCurrentContent(activeEpisodes[0].content);
          setCurrentTitle(activeEpisodes[0].title);
        } else {
          const episode = activeEpisodes.find(
            (e: any) => e.id === selectedChapterId
          );
          if (episode) {
            setCurrentContent(episode.content);
            setCurrentTitle(episode.title);
          }
        }
      } else {
        setCurrentContent(
          activeStory.content ||
            activeStory.description ||
            "No content available."
        );
        setCurrentTitle(activeStory.title);
      }
    }
  }, [activeStory, activeChapters, activeEpisodes, selectedChapterId]);

  const handleChapterChange = useCallback((chapterId: string) => {
    setSelectedChapterId(chapterId);
    window.scrollTo(0, 0);
  }, []);

  const handlePrevious = useCallback(() => {
    if (!activeChapters && !activeEpisodes) return;

    const list = activeChapters?.length ? activeChapters : activeEpisodes;
    if (!list || list.length === 0) return;

    const currentIndex = list.findIndex(
      (item: any) => item.id === selectedChapterId
    );
    if (currentIndex > 0) {
      setSelectedChapterId(list[currentIndex - 1].id);
      window.scrollTo(0, 0);
    }
  }, [activeChapters, activeEpisodes, selectedChapterId]);

  const handleNext = useCallback(() => {
    if (!activeChapters && !activeEpisodes) return;

    const list = activeChapters?.length ? activeChapters : activeEpisodes;
    if (!list || list.length === 0) return;

    const currentIndex = list.findIndex(
      (item: any) => item.id === selectedChapterId
    );
    if (currentIndex < list.length - 1) {
      setSelectedChapterId(list[currentIndex + 1].id);
      window.scrollTo(0, 0);
    }
  }, [activeChapters, activeEpisodes, selectedChapterId]);

  const hasNavigation =
    (activeChapters && activeChapters.length > 1) ||
    (activeEpisodes && activeEpisodes.length > 1);
  const navigationList = activeChapters?.length
    ? activeChapters
    : activeEpisodes;
  const currentIndex =
    navigationList?.findIndex((i: any) => i.id === selectedChapterId) ?? -1;

  return {
    selectedChapterId,
    currentContent,
    currentTitle,
    hasNavigation,
    navigationList,
    currentIndex,
    activeStory,
    handleChapterChange,
    handlePrevious,
    handleNext,
  };
}
