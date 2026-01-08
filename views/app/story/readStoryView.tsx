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
} from "@/src/hooks/useStoryDetail";
import {
  useOfflineStories,
  useOnlineStatus,
} from "@/src/hooks/useOfflineStories";
import { useUserStore } from "@/src/stores/useUserStore";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";

// Component imports
import { OfflineBanner } from "./components/OfflineBanner";
import { StoryHeader } from "./components/StoryHeader";
import { ChapterSelector } from "./components/ChapterSelector";
import { StoryContent } from "./components/StoryContent";
import { InteractionSection } from "./components/InteractionSection";
import { NavigationBar } from "./components/NavigationBar";
import { CommentsSection } from "./components/CommentsSection";

// Custom hooks
import { useScrollVisibility } from "./hooks/useScrollVisibility";
import { useOfflineContent } from "./hooks/useOfflineContent";
import { useStoryContent } from "./hooks/useStoryContent";

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
    if (!isAuthenticated()) {
      openAuthModal("login");
      router.push(`/story/${storyId}`);
    }
  }, [isAuthenticated, openAuthModal, router, storyId]);

  // Get current user
  const { user } = useUserStore();

  // Check online/offline status
  const isOnline = useOnlineStatus();
  const { updateLastRead, syncChapterIfNeeded, syncEpisodeIfNeeded } =
    useOfflineStories();
  const { isUsingOfflineData, offlineStory, offlineContent } =
    useOfflineContent(isOnline, storyId, updateLastRead);

  // Data hooks - only fetch when online
  const { story, isLoading: isStoryLoading } = useStory(
    isOnline ? storyId : undefined
  );
  const { likeCount, isLiked, toggleLike } = useStoryLikes(
    isOnline ? storyId : undefined
  );

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
    useReadingProgress(isOnline ? storyId : undefined);

  // The story object contains episode/chapter metadata (id, number, dates)
  // but NOT the actual content. We use this for navigation.
  const storyEpisodes = (story as any)?.episodes || [];
  const storyChapters = (story as any)?.chapters || [];

  // Determine structure from story data
  const hasChapters = (story as any)?.chapter === true;
  const hasEpisodes = !hasChapters && storyEpisodes.length > 0;

  // Use the metadata from story object for navigation list
  const effectiveEpisodes = hasEpisodes ? storyEpisodes : [];
  const effectiveChapters = hasChapters ? storyChapters : [];

  // Use counts from story data if available, otherwise use hook counts
  const displayLikeCount = (story as any)?.likeCount ?? likeCount ?? 0;

  // UI State
  const [showDropdown, setShowDropdown] = useState(false);

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
    handlePrevious,
    handleNext,
    isLoading: isContentLoading,
  } = useStoryContent({
    story,
    chapters: effectiveChapters,
    episodes: effectiveEpisodes,
    offlineStory,
    offlineContent,
    isUsingOfflineData,
    syncChapterIfNeeded,
    syncEpisodeIfNeeded,
    initialContentId: initialContentId || undefined,
  });

  // Memoize word count to avoid recalculating on every render/interval
  const totalWords = React.useMemo(() => {
    if (!currentContent) return 0;
    return currentContent.trim().split(/\s+/).length;
  }, [currentContent]);

  // Get chapter/episode progress hooks based on content type - only call the one we need
  const { progress: chapterProgress, updateProgress: updateChapterProgress } =
    useChapterProgress(
      hasChapters && isOnline ? storyId : undefined,
      hasChapters && selectedChapterId ? selectedChapterId : undefined
    );

  const { progress: episodeProgress, updateProgress: updateEpisodeProgress } =
    useEpisodeProgress(
      !hasChapters && hasEpisodes && isOnline ? storyId : undefined,
      !hasChapters && hasEpisodes && selectedChapterId
        ? selectedChapterId
        : undefined
    );

  // Current progress data
  const currentProgress = hasChapters
    ? chapterProgress
    : hasEpisodes
      ? episodeProgress
      : null;

  // Determine structure for comments
  const structure = hasChapters
    ? "chapters"
    : hasEpisodes
      ? "episodes"
      : "single";

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
      : undefined
  );

  const {
    createComment: createEpisodeComment,
    updateComment: updateEpisodeComment,
    deleteComment: deleteEpisodeComment,
  } = useEpisodeComments(
    structure === "episodes" && selectedChapterId
      ? selectedChapterId
      : undefined
  );

  // Use comments from current content
  const comments = structure === "single" ? storyComments : (currentComments || []);
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
      accumulatedTimeRef.current + currentSessionTime
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
    }, 5000);

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

  return (
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
      />

      {/* Chapter Selector */}
      {hasNavigation && navigationList && (
        <ChapterSelector
          navigationList={navigationList}
          selectedChapterId={selectedChapterId}
          onChapterChange={handleChapterChange}
          isVisible={isNavVisible}
        />
      )}

      {/* Story Content */}
      {isContentLoading ? (
        <div className="px-4 py-8">
          <Skeleton className="w-full rounded-lg h-96" />
        </div>
      ) : (
        <div ref={storyContentRef}>
          <StoryContent
            content={currentContent}
            authorName={
              activeStory.anonymous
                ? "Anonymous"
                : activeStory.author?.penName || "Unknown Author"
            }
            authorAvatar={activeStory.author?.avatar}
            hasNavigation={hasNavigation}
            description={activeStory.description}
          />
        </div>
      )}

      {/* Interaction Section (only when online) */}
      {isOnline && (
        <div className="px-4 pb-6">
          <InteractionSection
            likeCount={displayLikeCount}
            commentCount={displayCommentCount}
            isLiked={isLiked || false}
            showComments={true}
            onToggleLike={toggleLike} // Note: This toggles STORY like, not chapter like.
            onToggleComments={() => {}}
          />

          {/* Comments Section - Always shown */}
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
                        penName: user.penName || user.firstName || "Anonymous",
                        avatar: user.avatar || user.profilePicture || "",
                      }
                    : undefined
                }
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      {hasNavigation && navigationList && (
        <NavigationBar
          currentIndex={currentIndex}
          total={navigationList.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isVisible={isNavVisible}
          navigationList={navigationList}
          selectedChapterId={selectedChapterId}
        />
      )}
    </div>
  );
};
