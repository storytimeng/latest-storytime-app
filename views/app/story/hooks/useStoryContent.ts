import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { preload } from "swr";

import {
  useChapter,
  useEpisode,
  fetchChapterById,
  fetchEpisodeById,
} from "@/src/hooks/useStoryDetail";

export type StoryStructure = "single" | "chapters" | "episodes";

interface PartCacheEntry {
  content: string;
  title: string;
}

interface UseStoryContentProps {
  story: any;
  chapters: any[];
  episodes: any[];
  structure: StoryStructure;
  offlineStory: any;
  offlineContent: any[];
  isOnline: boolean;
  isContentAvailableOffline: (contentId: string | null | undefined) => boolean;
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

function toPartCacheEntry(
  part: {
    id: string;
    content?: string;
    title?: string;
    chapterNumber?: number;
    episodeNumber?: number;
  },
  partLabel: string,
): PartCacheEntry {
  const number = part.chapterNumber ?? part.episodeNumber;
  return {
    content: part.content || "",
    title:
      part.title?.trim() ||
      (number != null ? `${partLabel} ${number}` : partLabel),
  };
}

export function useStoryContent({
  story,
  chapters,
  episodes,
  structure,
  offlineStory,
  offlineContent,
  isOnline,
  isContentAvailableOffline,
  syncChapterIfNeeded,
  syncEpisodeIfNeeded,
  initialContentId,
}: UseStoryContentProps) {
  // ============================================================
  // Stage 1: state + refs + simple constants.
  // Hoisted so every later derivation can read them safely.
  // ============================================================
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    initialContentId || null,
  );
  const [partsCache, setPartsCache] = useState<Record<string, PartCacheEntry>>(
    {},
  );

  // Tracks which content IDs we've actually attempted a network fetch
  // for, so "no content yet" during the brief moment before a fetch
  // starts doesn't get misread as "network fetch failed" and cause a
  // flash to offline data before the request even had a chance to run.
  const attemptedNetworkIdsRef = useRef<Set<string>>(new Set());

  const isChapterMode = structure === "chapters";
  const isEpisodeMode = structure === "episodes";
  const partLabel = isEpisodeMode ? "Episode" : "Chapter";

  // ============================================================
  // Stage 2: network hooks.
  // The old code passed `!isUsingOfflineData` here, but that value
  // is itself derived from the hook's *result* — a TDZ cycle. We
  // break it with a conservative "should we even try the network?"
  // flag that only depends on `isOnline` + offline availability.
  // On the first render it's identical to the old expression; on
  // later renders we may keep the hook "live" after a failed fetch,
  // but the UI is gated on the real `isUsingOfflineData` further
  // down, so nothing user-visible changes.
  // ============================================================
  const wouldPreferOfflineInitially =
    !isOnline && isContentAvailableOffline(selectedChapterId);

  const {
    chapter: fetchedChapter,
    comments: chapterComments,
    isLoading: isChapterLoading,
  } = useChapter(
    !wouldPreferOfflineInitially && isChapterMode && selectedChapterId
      ? selectedChapterId
      : undefined,
  );

  const {
    episode: fetchedEpisode,
    comments: episodeComments,
    isLoading: isEpisodeLoading,
  } = useEpisode(
    !wouldPreferOfflineInitially && isEpisodeMode && selectedChapterId
      ? selectedChapterId
      : undefined,
  );

  // Mark IDs we've actually issued a network request for. Runs after
  // the hooks settle into the `loading` state.
  useEffect(() => {
    if (!selectedChapterId) return;
    if (
      (isChapterMode && isChapterLoading) ||
      (isEpisodeMode && isEpisodeLoading)
    ) {
      attemptedNetworkIdsRef.current.add(selectedChapterId);
    }
  }, [
    selectedChapterId,
    isChapterLoading,
    isEpisodeLoading,
    isChapterMode,
    isEpisodeMode,
  ]);

  // ============================================================
  // Stage 3: derived state.
  // ============================================================
  const networkHasCurrentContent = isChapterMode
    ? Boolean(
        fetchedChapter &&
          (fetchedChapter as { id?: string }).id === selectedChapterId,
      )
    : isEpisodeMode
      ? Boolean(
          fetchedEpisode &&
            (fetchedEpisode as { id?: string }).id === selectedChapterId,
        )
      : Boolean(story);

  const hasAttemptedNetwork =
    !!selectedChapterId &&
    attemptedNetworkIdsRef.current.has(selectedChapterId);

  // True once we've actually tried the network for this specific
  // chapter/episode and it settled without giving us matching
  // content — covers a dead/unreachable backend just as well as a
  // real offline device, since neither navigator.onLine nor a
  // generic "isOnline" flag can be trusted to reflect whether
  // *our* server is reachable.
  const networkFetchFailed =
    !!selectedChapterId &&
    hasAttemptedNetwork &&
    ((isChapterMode && !isChapterLoading && !networkHasCurrentContent) ||
      (isEpisodeMode && !isEpisodeLoading && !networkHasCurrentContent));

  // Recomputed against the CURRENT selectedChapterId, not just the
  // initial one from the URL — so switching chapters while offline
  // correctly re-evaluates whether the new chapter is actually
  // available locally, instead of freezing the offline/online
  // decision at mount time.
  const isUsingOfflineData =
    (!isOnline || networkFetchFailed) &&
    isContentAvailableOffline(selectedChapterId);

  const activeStory = isUsingOfflineData ? offlineStory : story;
  const activeChapters = isUsingOfflineData ? offlineContent : chapters;
  const activeEpisodes = isUsingOfflineData ? offlineContent : episodes;

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

  // ============================================================
  // Stage 4: side-effects (parts cache, initial selection,
  // neighbour prefetch, offline sync).
  // ============================================================
  useEffect(() => {
    if (
      isChapterMode &&
      fetchedChapter &&
      (fetchedChapter as { id?: string }).id
    ) {
      const part = fetchedChapter as {
        id: string;
        content?: string;
        title?: string;
        chapterNumber?: number;
      };
      setPartsCache((prev) => ({
        ...prev,
        [part.id]: toPartCacheEntry(part, "Chapter"),
      }));
    }
  }, [fetchedChapter, isChapterMode]);

  useEffect(() => {
    if (
      isEpisodeMode &&
      fetchedEpisode &&
      (fetchedEpisode as { id?: string }).id
    ) {
      const part = fetchedEpisode as {
        id: string;
        content?: string;
        title?: string;
        episodeNumber?: number;
      };
      setPartsCache((prev) => ({
        ...prev,
        [part.id]: toPartCacheEntry(part, "Episode"),
      }));
    }
  }, [fetchedEpisode, isEpisodeMode]);

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
    if (
      isUsingOfflineData ||
      !selectedChapterId ||
      navigationList.length === 0
    ) {
      return;
    }

    const currentIdx = navigationList.findIndex(
      (item: { id: string }) => item.id === selectedChapterId,
    );
    if (currentIdx < 0) return;

    const start = Math.max(0, currentIdx - 1);
    const end = Math.min(navigationList.length, currentIdx + 3);
    const partsToPrefetch = navigationList.slice(start, end) as {
      id: string;
    }[];

    for (const part of partsToPrefetch) {
      if (isEpisodeMode) {
        void preload(`/stories/episodes/${part.id}`, () =>
          fetchEpisodeById(part.id),
        );
      } else if (isChapterMode) {
        void preload(`/stories/chapters/${part.id}`, () =>
          fetchChapterById(part.id),
        );
      }
    }
  }, [
    selectedChapterId,
    navigationList,
    isEpisodeMode,
    isChapterMode,
    isUsingOfflineData,
  ]);

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

  // ============================================================
  // Stage 5: derived view-model values.
  // ============================================================
  const cachedPart = selectedChapterId ? partsCache[selectedChapterId] : null;

  const resolvedPart = useMemo(() => {
    if (isChapterMode && fetchedChapter) {
      const part = fetchedChapter as {
        id: string;
        content?: string;
        title?: string;
        chapterNumber?: number;
      };
      if (part.id === selectedChapterId) {
        return toPartCacheEntry(part, "Chapter");
      }
    }
    if (isEpisodeMode && fetchedEpisode) {
      const part = fetchedEpisode as {
        id: string;
        content?: string;
        title?: string;
        episodeNumber?: number;
      };
      if (part.id === selectedChapterId) {
        return toPartCacheEntry(part, "Episode");
      }
    }
    return cachedPart;
  }, [
    cachedPart,
    fetchedChapter,
    fetchedEpisode,
    isChapterMode,
    isEpisodeMode,
    selectedChapterId,
  ]);

  const currentOfflinePart = isUsingOfflineData
    ? offlineContent.find(
        (c: { chapterId?: string; episodeId?: string }) =>
          (c.chapterId ?? c.episodeId) === selectedChapterId,
      )
    : null;

  const currentContent = isUsingOfflineData
    ? currentOfflinePart?.content || ""
    : isChapterMode || isEpisodeMode
      ? resolvedPart?.content || ""
      : activeStory?.content || activeStory?.description || "";

  const currentTitle = isUsingOfflineData
    ? currentOfflinePart?.title || activeStory?.title
    : isChapterMode || isEpisodeMode
      ? resolvedPart?.title || activeStory?.title || ""
      : activeStory?.title || "";

  const currentComments = isChapterMode
    ? chapterComments
    : isEpisodeMode
      ? episodeComments
      : [];

  const isPartLoading =
    (isChapterMode || isEpisodeMode) &&
    !!selectedChapterId &&
    !resolvedPart?.content &&
    (isChapterLoading || isEpisodeLoading);

  const isInitialLoading =
    (isChapterMode || isEpisodeMode) &&
    !!selectedChapterId &&
    !resolvedPart?.content &&
    isPartLoading;

  // ============================================================
  // Stage 6: navigation handlers.
  // ============================================================
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

  // ============================================================
  // Stage 7: return.
  // ============================================================
  const hasNavigation = navigationList.length > 1;
  const currentIndex = navigationList.findIndex(
    (item: { id: string }) => item.id === selectedChapterId,
  );
  const nextPart =
    currentIndex >= 0 && currentIndex < navigationList.length - 1
      ? navigationList[currentIndex + 1]
      : null;
  const prevPart = currentIndex > 0 ? navigationList[currentIndex - 1] : null;

  return {
    selectedChapterId,
    isUsingOfflineData,
    currentContent,
    currentTitle,
    currentComments,
    hasNavigation,
    navigationList,
    currentIndex,
    nextPart,
    prevPart,
    activeStory,
    handleChapterChange,
    handlePrevious,
    handleNext,
    isLoading: isInitialLoading,
    isPartLoading,
    structure,
    partLabel,
  };
}
