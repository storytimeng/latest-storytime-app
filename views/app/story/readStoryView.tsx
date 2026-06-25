"use client";

import React, {
  useState,
  Suspense,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@heroui/skeleton";
import {
  useStory,
  useStoryLikes,
  useStoryComments,
  useChapterComments,
  useEpisodeComments,
  useReadingProgress,
  useChapterProgress,
  useEpisodeProgress,
  useMarkStoryAsRead,
} from "@/src/hooks/useStoryDetail";
import {
  useOfflineStories,
  useOnlineStatus,
} from "@/src/hooks/useOfflineStories";
import { useUserStore } from "@/src/stores/useUserStore";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";
import { useTTSStore } from "@/src/stores/useTTSStore";
import { TTSProvider } from "@/components/providers/TTSProvider";
import { stopBrowserTTS } from "@/src/lib/tts/stopBrowserTTS";

// Component imports
import { OfflineBanner } from "./components/OfflineBanner";
import { StoryHeader } from "./components/StoryHeader";
import { ChapterSelector } from "./components/ChapterSelector";
import { StoryContent } from "./components/StoryContent";
import { InteractionSection } from "./components/InteractionSection";
import { NavigationBar } from "./components/NavigationBar";
import { StoryAudioBar } from "./components/StoryAudioBar";
import { StoryPartFooter } from "./components/StoryPartFooter";
import { CommentsSection } from "./components/CommentsSection";
import type { StoryReadingMode } from "./components/StoryHeader";

// Custom hooks
import { useScrollVisibility } from "./hooks/useScrollVisibility";
import { useOfflineContent } from "./hooks/useOfflineContent";
import { useStoryContent } from "./hooks/useStoryContent";
import { useStoryAudio } from "@/src/hooks/useStoryAudio";
import { useStoryAudioVoices } from "@/src/hooks/useStoryAudioVoices";
import { usePremiumFeatures } from "@/src/hooks/usePremiumFeatures";
import { usePremiumUpsell } from "@/src/hooks/usePremiumUpsell";
import { PremiumUpsellModal } from "@/components/reusables/PremiumUpsellModal";
import { PremiumLockedReadView } from "./components/PremiumLockedReadView";
import { canReadExclusiveStory } from "@/src/lib/premiumUpsell";

interface ReadStoryViewProps {
  storyId: string;
}

export const ReadStoryView = ({ storyId }: ReadStoryViewProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialChapterId = searchParams.get("chapterId");
  const initialEpisodeId = searchParams.get("episodeId");
  const initialContentId = initialChapterId || initialEpisodeId;

  // Auth check
  const { openModal: openAuthModal } = useAuthModalStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Prefetch parent story route
    router.prefetch(`/story/${storyId}`);

    // Check both store and cookies to avoid false negatives during hydration
    const hasToken =
      isAuthenticated() ||
      (typeof window !== "undefined" && document.cookie.includes("authToken="));

    if (!hasToken) {
      openAuthModal("login");
      router.push(`/story/${storyId}`);
    }
  }, [isAuthenticated, openAuthModal, router, storyId]);

  // Get current user
  const { user } = useUserStore();
  const { isPremium, checkFeature } = usePremiumFeatures();
  const { requireFeature, upsellReason, closeUpsell, isUpsellOpen } =
    usePremiumUpsell();

  // Check online/offline status
  const isOnline = useOnlineStatus();
  const { updateLastRead, syncChapterIfNeeded, syncEpisodeIfNeeded } =
    useOfflineStories();
  const { isUsingOfflineData, offlineStory, offlineContent } =
    useOfflineContent(isOnline, storyId, updateLastRead);

  // Data hooks - only fetch when online
  const { story, isLoading: isStoryLoading } = useStory(
    isOnline ? storyId : undefined,
  );
  const { likeCount, isLiked, toggleLike } = useStoryLikes(
    isOnline ? storyId : undefined,
    isAuthenticated(),
  );

  // Mark as read after delay
  const { markAsRead } = useMarkStoryAsRead();
  const hasMarkedAsReadRef = useRef(false);

  useEffect(() => {
    if (!isOnline || !storyId || hasMarkedAsReadRef.current) return;

    const timer = setTimeout(() => {
      markAsRead(storyId);
      hasMarkedAsReadRef.current = true;
    }, 5000); // 5 seconds delay

    return () => clearTimeout(timer);
  }, [isOnline, storyId, markAsRead]);

  // Reading progress tracking
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const storyContentRef = useRef<HTMLDivElement>(null); // Ref for the actual story text container
  const commentsSectionRef = useRef<HTMLDivElement>(null);
  const accumulatedTimeRef = useRef<number>(0); // Track time before current session
  const lastVisibilityChangeRef = useRef<number>(Date.now());
  const hasRestoredScrollRef = useRef<boolean>(false);

  // Handle page visibility to track accurate reading time
  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      if (document.hidden) {
        // User left: add current session time to accumulated
        accumulatedTimeRef.current +=
          (now - lastVisibilityChangeRef.current) / 1000;
      } else {
        // User returned: reset start time for new session
        lastVisibilityChangeRef.current = now;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Get progress hooks
  const { progress: storyProgress, updateProgress: updateStoryProgress } =
    useReadingProgress(isOnline ? storyId : undefined, isAuthenticated());

  // Story metadata lists episodes/chapters by id + number only; content is fetched per part.
  const rawStoryEpisodes = (story as any)?.episodes || [];
  const rawStoryChapters = (story as any)?.chapters || [];

  const storyEpisodes = Array.isArray(rawStoryEpisodes)
    ? rawStoryEpisodes.filter((ep: { id?: string }) => ep?.id)
    : [];
  const storyChapters = Array.isArray(rawStoryChapters)
    ? rawStoryChapters.filter((ch: { id?: string }) => ch?.id)
    : [];

  // Match preview page: episodes take priority over chapters
  const hasEpisodes = storyEpisodes.length > 0;
  const hasChapters =
    !hasEpisodes &&
    (story as any)?.chapter === true &&
    storyChapters.length > 0;

  const effectiveEpisodes = hasEpisodes ? storyEpisodes : [];
  const effectiveChapters = hasChapters ? storyChapters : [];

  const structure = hasChapters
    ? "chapters"
    : hasEpisodes
      ? "episodes"
      : "single";

  // Use counts from story data if available, otherwise use hook counts
  const displayLikeCount = (story as any)?.likeCount ?? likeCount ?? 0;

  // UI State
  const [showDropdown, setShowDropdown] = useState(false);
  const [readingMode, setReadingMode] = useState<StoryReadingMode>("read");
  const selectedNarrationVoiceId = useTTSStore(
    (state) => state.selectedNarrationVoiceId,
  );
  const setSelectedNarrationVoiceId = useTTSStore(
    (state) => state.setSelectedNarrationVoiceId,
  );
  const { defaultVoice } = useStoryAudioVoices(isOnline && !isUsingOfflineData);
  const narrationVoice = selectedNarrationVoiceId ?? defaultVoice;

  useEffect(() => {
    if (!selectedNarrationVoiceId && defaultVoice) {
      setSelectedNarrationVoiceId(defaultVoice);
    }
  }, [defaultVoice, selectedNarrationVoiceId, setSelectedNarrationVoiceId]);

  // Custom hooks for derived state
  const isNavVisible = useScrollVisibility();
  const {
    selectedChapterId,
    currentContent,
    currentTitle,
    currentComments,
    hasNavigation,
    navigationList,
    currentIndex,
    activeStory,
    handleChapterChange,
    isLoading: isContentLoading,
    isPartLoading,
    nextPart,
    prevPart,
    partLabel,
  } = useStoryContent({
    story,
    chapters: effectiveChapters,
    episodes: effectiveEpisodes,
    structure,
    offlineStory,
    offlineContent,
    isUsingOfflineData,
    syncChapterIfNeeded,
    syncEpisodeIfNeeded,
    initialContentId: initialContentId || undefined,
  });

  const updateContentUrl = useCallback(
    (contentId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("chapterId");
      params.delete("episodeId");
      if (structure === "chapters") {
        params.set("chapterId", contentId);
      } else if (structure === "episodes") {
        params.set("episodeId", contentId);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, structure],
  );

  const handleChapterChangeWithUrl = useCallback(
    (contentId: string) => {
      handleChapterChange(contentId);
      updateContentUrl(contentId);
    },
    [handleChapterChange, updateContentUrl],
  );

  const handlePreviousWithUrl = useCallback(() => {
    const idx = navigationList.findIndex(
      (item: { id: string }) => item.id === selectedChapterId,
    );
    if (idx > 0) {
      const prevId = navigationList[idx - 1].id;
      handleChapterChange(prevId);
      updateContentUrl(prevId);
    }
  }, [
    navigationList,
    selectedChapterId,
    handleChapterChange,
    updateContentUrl,
  ]);

  const handleNextWithUrl = useCallback(() => {
    const idx = navigationList.findIndex(
      (item: { id: string }) => item.id === selectedChapterId,
    );
    if (idx >= 0 && idx < navigationList.length - 1) {
      const nextId = navigationList[idx + 1].id;
      handleChapterChange(nextId);
      updateContentUrl(nextId);
    }
  }, [
    navigationList,
    selectedChapterId,
    handleChapterChange,
    updateContentUrl,
  ]);

  const audioChapterId =
    hasChapters && selectedChapterId ? selectedChapterId : null;
  const audioEpisodeId =
    !hasChapters && hasEpisodes && selectedChapterId ? selectedChapterId : null;

  const storyAudio = useStoryAudio({
    storyId,
    chapterId: audioChapterId,
    episodeId: audioEpisodeId,
    voice: narrationVoice,
    enabled:
      readingMode === "listen" &&
      isOnline &&
      !isUsingOfflineData &&
      checkFeature("audioNarration"),
  });

  const handleReadingModeChange = useCallback(
    (mode: StoryReadingMode) => {
      if (mode === "listen") {
        if (!requireFeature("audioNarration")) {
          return;
        }
        stopBrowserTTS();
      } else {
        storyAudio.stop();
      }
      setReadingMode(mode);
    },
    [requireFeature, storyAudio.stop],
  );

  const handleAudioPreviousChapter = useCallback(() => {
    storyAudio.stop();
    handlePreviousWithUrl();
  }, [handlePreviousWithUrl, storyAudio.stop]);

  const handleAudioNextChapter = useCallback(() => {
    storyAudio.stop();
    handleNextWithUrl();
  }, [handleNextWithUrl, storyAudio.stop]);

  // Memoize word count to avoid recalculating on every render/interval
  const totalWords = React.useMemo(() => {
    if (!currentContent) return 0;
    return currentContent.trim().split(/\s+/).length;
  }, [currentContent]);

  // Get chapter/episode progress hooks based on content type - only call the one we need
  const { progress: chapterProgress, updateProgress: updateChapterProgress } =
    useChapterProgress(
      hasChapters && isOnline ? storyId : undefined,
      hasChapters && selectedChapterId ? selectedChapterId : undefined,
      isAuthenticated(),
    );

  const { progress: episodeProgress, updateProgress: updateEpisodeProgress } =
    useEpisodeProgress(
      !hasChapters && hasEpisodes && isOnline ? storyId : undefined,
      !hasChapters && hasEpisodes && selectedChapterId
        ? selectedChapterId
        : undefined,
      isAuthenticated(),
    );

  // Current progress data
  const currentProgress = hasChapters
    ? chapterProgress
    : hasEpisodes
      ? episodeProgress
      : null;

  // Get comment creation function based on content type
  const {
    comments: storyComments,
    createComment: createStoryComment,
    updateComment: updateStoryComment,
    deleteComment: deleteStoryComment,
  } = useStoryComments(structure === "single" ? storyId : undefined);

  const {
    createComment: createChapterComment,
    updateComment: updateChapterComment,
    deleteComment: deleteChapterComment,
  } = useChapterComments(
    structure === "chapters" && selectedChapterId
      ? selectedChapterId
      : undefined,
  );

  const {
    createComment: createEpisodeComment,
    updateComment: updateEpisodeComment,
    deleteComment: deleteEpisodeComment,
  } = useEpisodeComments(
    structure === "episodes" && selectedChapterId
      ? selectedChapterId
      : undefined,
  );

  // Use comments from current content
  const comments =
    structure === "single" ? storyComments : currentComments || [];
  const displayCommentCount = comments.length;

  const handleCreateComment = async (text: string, parentId?: string) => {
    if (structure === "chapters") {
      return await createChapterComment(text, parentId);
    } else if (structure === "episodes") {
      return await createEpisodeComment(text, parentId);
    } else {
      return await createStoryComment(text, parentId);
    }
  };

  const handleUpdateComment = async (id: string, text: string) => {
    if (structure === "chapters") {
      await updateChapterComment(id, text);
    } else if (structure === "episodes") {
      await updateEpisodeComment(id, text);
    } else {
      await updateStoryComment(id, text);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (structure === "chapters") {
      await deleteChapterComment(id);
    } else if (structure === "episodes") {
      await deleteEpisodeComment(id);
    } else {
      await deleteStoryComment(id);
    }
  };

  // Calculate reading progress based on scroll position
  const calculateProgress = useCallback(() => {
    if (!isOnline) return;

    // Calculate active reading time
    const currentSessionTime = !document.hidden
      ? (Date.now() - lastVisibilityChangeRef.current) / 1000
      : 0;
    const readingTimeSeconds = Math.floor(
      accumulatedTimeRef.current + currentSessionTime,
    );

    // If we can't measure content, return basic stats
    if (!storyContentRef.current) {
      return {
        percentageRead: 0,
        wordsRead: 0,
        totalWords,
        readingTimeSeconds,
      };
    }

    const clientHeight = window.innerHeight;
    const contentRect = storyContentRef.current.getBoundingClientRect();
    const contentTop = contentRect.top;
    const contentHeight = contentRect.height;
    const contentBottom = contentRect.bottom;

    // Calculate how much of the content has been scrolled past the bottom of the viewport
    // When contentTop is at clientHeight, we are at 0% (start of content entering view)
    // When contentBottom is at clientHeight, we are at 100% (end of content entering view)

    // However, usually "read" means the user has scrolled it out of view (top) or it's fully visible.
    // A better metric for "reading" text is: how much of the text has passed the user's eye line?
    // Let's assume the user reads at the bottom of the screen (worst case) or middle.
    // Standard practice: Percentage of content that is above the bottom of the viewport.

    // Distance from top of content to bottom of viewport
    const visibleContentHeight = clientHeight - contentTop;

    let percentageRead = 0;

    if (contentHeight <= 0) {
      percentageRead = 100;
    } else {
      percentageRead = (visibleContentHeight / contentHeight) * 100;
    }

    // Clamp percentage
    percentageRead = Math.min(100, Math.max(0, percentageRead));

    // If the bottom of the content is visible in the viewport, consider it 100% read
    if (contentBottom <= clientHeight) {
      percentageRead = 100;
    }

    // Calculate words read based on percentage
    const wordsRead = Math.floor((percentageRead / 100) * totalWords);

    return {
      percentageRead: Math.round(percentageRead),
      wordsRead,
      totalWords,
      readingTimeSeconds,
    };
  }, [totalWords, isOnline]);

  // Update reading progress - no debounce since interval controls frequency
  const updateReadingProgress = useCallback(async () => {
    if (!isOnline || !user) return;

    const progressData = calculateProgress();
    if (!progressData) return;

    try {
      // Update chapter/episode progress - story progress is auto-aggregated by backend
      if (hasChapters && selectedChapterId) {
        await updateChapterProgress(progressData);
      } else if (hasEpisodes && selectedChapterId) {
        await updateEpisodeProgress(progressData);
      }
    } catch (error) {
      console.error("Failed to update reading progress:", error);
    }
  }, [
    isOnline,
    user,
    calculateProgress,
    hasChapters,
    hasEpisodes,
    selectedChapterId,
    currentIndex,
    updateChapterProgress,
    updateEpisodeProgress,
    updateStoryProgress,
  ]);

  // Initialize start time ONCE from saved progress
  const isTimeInitializedRef = useRef(false);
  useEffect(() => {
    if (!currentProgress || isTimeInitializedRef.current) return;

    const existingReadingTime =
      (currentProgress as any)?.readingTimeSeconds || 0;

    accumulatedTimeRef.current = existingReadingTime;
    isTimeInitializedRef.current = true;
  }, [currentProgress]);

  // Restore scroll position from progress
  useEffect(() => {
    if (
      !currentProgress ||
      hasRestoredScrollRef.current ||
      isContentLoading ||
      !contentContainerRef.current
    ) {
      return;
    }

    const percentageRead = (currentProgress as any)?.percentageRead || 0;
    if (percentageRead > 0 && percentageRead < 95) {
      // Wait for content to render
      setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const targetScroll =
          ((scrollHeight - clientHeight) * percentageRead) / 100;

        window.scrollTo({
          top: targetScroll,
          behavior: "smooth",
        });

        hasRestoredScrollRef.current = true;
      }, 500);
    }
  }, [currentProgress, isContentLoading]);

  // Timer: update progress every 5 seconds
  useEffect(() => {
    if (!isOnline || !user) return;

    const interval = setInterval(() => {
      updateReadingProgress();
    }, 10000);

    return () => {
      clearInterval(interval);
      // Final progress update on unmount
      updateReadingProgress();
    };
  }, [isOnline, user, updateReadingProgress]);

  // Reset when chapter/episode changes
  useEffect(() => {
    hasRestoredScrollRef.current = false;
  }, [selectedChapterId]);

  // Loading state
  if (isStoryLoading && !isUsingOfflineData) {
    return (
      <div className="min-h-screen p-4 space-y-4 bg-accent-shade-1">
        <Skeleton className="w-full h-12 rounded-lg" />
        <Skeleton className="w-full rounded-lg h-96" />
      </div>
    );
  }

  // Story not found
  if (!activeStory) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-accent-shade-1">
        <p className="text-primary">
          {!isOnline ? "Story not available offline" : "Story not found"}
        </p>
      </div>
    );
  }

  const storyAuthorId =
    (activeStory as { authorId?: string }).authorId || activeStory.author?.id;
  const isStoryAuthor = Boolean(
    user?.id === storyAuthorId || user?.authorId === storyAuthorId,
  );
  const isExclusiveLocked =
    !isUsingOfflineData &&
    !isStoryAuthor &&
    !canReadExclusiveStory(
      {
        onlyOnStorytime: (activeStory as { onlyOnStorytime?: boolean })
          .onlyOnStorytime,
        requiresPremium: (activeStory as { requiresPremium?: boolean })
          .requiresPremium,
        authorId: storyAuthorId,
      },
      { isPremium, userId: user?.id },
    );

  if (isExclusiveLocked) {
    return (
      <>
        <PremiumLockedReadView
          storyId={storyId}
          storyTitle={activeStory.title}
        />
        <PremiumUpsellModal
          isOpen={isUpsellOpen}
          onClose={closeUpsell}
          reason={upsellReason}
        />
      </>
    );
  }

  const canUseAudio = checkFeature("audioNarration");

  return (
    <TTSProvider>
      <div
        ref={contentContainerRef}
        className="min-h-screen bg-accent-shade-1 relative overflow-hidden max-w-[28rem] mx-auto"
      >
        {/* Offline Mode Banner */}
        {isUsingOfflineData && <OfflineBanner />}

        {/* Story Header */}
        <StoryHeader
          storyId={storyId}
          currentTitle={currentTitle}
          storyTitle={activeStory.title}
          isVisible={isNavVisible}
          showDropdown={showDropdown}
          onToggleDropdown={() => setShowDropdown(!showDropdown)}
          isOffline={isUsingOfflineData}
          readingMode={readingMode}
          onReadingModeChange={
            isOnline && !isUsingOfflineData
              ? handleReadingModeChange
              : undefined
          }
          listenLocked={!canUseAudio}
          onListenLocked={() => requireFeature("audioNarration")}
        />

        {/* Chapter Selector */}
        {hasNavigation && navigationList && (
          <ChapterSelector
            navigationList={navigationList}
            selectedChapterId={selectedChapterId}
            onChapterChange={handleChapterChangeWithUrl}
            isVisible={isNavVisible}
            partLabel={structure === "episodes" ? "Episode" : "Chapter"}
          />
        )}

        {/* Story Content */}
        {isContentLoading && !currentContent ? (
          <div className="px-4 py-8">
            <Skeleton className="w-full rounded-lg h-96" />
          </div>
        ) : isPartLoading && !currentContent ? (
          <div className="px-4 py-8 space-y-4">
            <div className="h-1 w-full overflow-hidden rounded-full bg-light-grey-2">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-complimentary-colour" />
            </div>
            <Skeleton className="w-full rounded-lg h-64" />
          </div>
        ) : (
          currentContent && (
            <React.Fragment>
              {isPartLoading ? (
                <div className="sticky top-28 z-30 px-4">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-light-grey-2">
                    <div className="h-full w-1/3 animate-pulse rounded-full bg-complimentary-colour" />
                  </div>
                </div>
              ) : null}

              <div ref={storyContentRef}>
                <StoryContent
                  content={currentContent}
                  authorName={
                    activeStory.anonymous
                      ? "Anonymous"
                      : activeStory.author?.penName || "Anonymous"
                  }
                  authorAvatar={activeStory.author?.avatar}
                  hasNavigation={hasNavigation}
                  description={activeStory.description}
                  listenMode={readingMode === "listen"}
                />
              </div>

              {hasNavigation ? (
                <StoryPartFooter
                  partLabel={partLabel}
                  currentIndex={currentIndex}
                  total={navigationList.length}
                  nextPart={nextPart}
                  prevPart={prevPart}
                  onNext={nextPart ? handleNextWithUrl : undefined}
                  onPrevious={prevPart ? handlePreviousWithUrl : undefined}
                  isLoading={isPartLoading}
                />
              ) : null}

              {/* Interaction Section (only when online) */}
              {isOnline && (
                <div className="px-4 pb-6">
                  <InteractionSection
                    likeCount={displayLikeCount}
                    commentCount={displayCommentCount}
                    isLiked={isLiked || false}
                    showComments={true}
                    onToggleLike={toggleLike}
                    onToggleComments={() => {}}
                  />

                  {/* Comments Section */}
                  <div ref={commentsSectionRef} className="pb-24">
                    <Suspense
                      fallback={
                        <div className="py-4">
                          <Skeleton className="w-full h-20 rounded-lg" />
                        </div>
                      }
                    >
                      <CommentsSection
                        comments={comments || []}
                        onSubmitComment={handleCreateComment}
                        onUpdateComment={handleUpdateComment}
                        onDeleteComment={handleDeleteComment}
                        isThreaded={true}
                        currentUser={
                          user
                            ? {
                                id: user.id,
                                penName:
                                  user.penName || user.firstName || "Anonymous",
                                avatar:
                                  user.avatar || user.profilePicture || "",
                              }
                            : undefined
                        }
                      />
                    </Suspense>
                  </div>
                </div>
              )}

              {/* Audio player — human narration */}
              {readingMode === "listen" && (
                <StoryAudioBar
                  isVisible={isNavVisible}
                  isLoading={storyAudio.isLoading}
                  error={storyAudio.error}
                  onPlay={storyAudio.play}
                  onPause={storyAudio.pause}
                  onResume={storyAudio.resume}
                  onStop={storyAudio.stop}
                  onSeek={storyAudio.seek}
                  currentIndex={currentIndex}
                  totalChapters={navigationList?.length ?? 0}
                  onPreviousChapter={
                    hasNavigation ? handleAudioPreviousChapter : undefined
                  }
                  onNextChapter={
                    hasNavigation ? handleAudioNextChapter : undefined
                  }
                />
              )}

              {/* Browser TTS navigation — read mode with multi-part stories */}
              {readingMode === "read" && hasNavigation && navigationList && (
                <NavigationBar
                  currentIndex={currentIndex}
                  total={navigationList.length}
                  onPrevious={handlePreviousWithUrl}
                  onNext={handleNextWithUrl}
                  isVisible={isNavVisible}
                  navigationList={navigationList}
                  selectedChapterId={selectedChapterId}
                  partLabel={structure === "episodes" ? "Episode" : "Chapter"}
                  onTtsLocked={() => requireFeature("audioNarration")}
                />
              )}
            </React.Fragment>
          )
        )}
      </div>
      <PremiumUpsellModal
        isOpen={isUpsellOpen}
        onClose={closeUpsell}
        reason={upsellReason}
      />
    </TTSProvider>
  );
};
