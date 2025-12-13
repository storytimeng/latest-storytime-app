"use client";

import React, {
  useState,
  Suspense,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const initialChapterId = searchParams.get("chapterId");
  const initialEpisodeId = searchParams.get("episodeId");
  const initialContentId = initialChapterId || initialEpisodeId;

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
  const commentsSectionRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastProgressUpdateRef = useRef<number>(0);
  const hasRestoredScrollRef = useRef<boolean>(false);

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
  const { createComment: createStoryComment } = useStoryComments(
    structure === "single" ? storyId : undefined
  );

  const { createComment: createChapterComment } = useChapterComments(
    structure === "chapters" && selectedChapterId
      ? selectedChapterId
      : undefined
  );

  const { createComment: createEpisodeComment } = useEpisodeComments(
    structure === "episodes" && selectedChapterId
      ? selectedChapterId
      : undefined
  );

  // Use comments from current content
  const comments = currentComments || [];
  const displayCommentCount = comments.length;

  const handleCreateComment = async (text: string, parentId?: string) => {
    if (structure === "chapters") {
      await createChapterComment(text, parentId);
    } else if (structure === "episodes") {
      await createEpisodeComment(text, parentId);
    } else {
      await createStoryComment(text, parentId);
    }
  };

  // Calculate reading progress based on scroll position
  const calculateProgress = useCallback(() => {
    if (!contentContainerRef.current || !isOnline) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    const contentText = currentContent || "";
    const words = contentText.split(/\s+/).filter((w: string) => w.length > 0);
    const totalWords = words.length;
    const readingTimeSeconds = Math.floor(
      (Date.now() - startTimeRef.current) / 1000
    );

    // Check if comments section is visible - means story is fully read
    if (commentsSectionRef.current) {
      const commentsRect = commentsSectionRef.current.getBoundingClientRect();
      const isCommentsVisible = commentsRect.top < clientHeight;

      if (isCommentsVisible) {
        return {
          percentageRead: 100,
          wordsRead: totalWords,
          totalWords,
          readingTimeSeconds,
        };
      }
    }

    // If entire content fits on screen, it's 100% read
    if (scrollHeight <= clientHeight) {
      return {
        percentageRead: 100,
        wordsRead: totalWords,
        totalWords,
        readingTimeSeconds,
      };
    }

    // Calculate based on BOTTOM of viewport (what user can see)
    const scrollBottom = scrollTop + clientHeight;
    const maxScroll = scrollHeight;

    // Calculate percentage based on bottom of viewport
    const percentageRead = Math.min(
      100,
      Math.round((scrollBottom / maxScroll) * 100)
    );

    // Count actual words up to the bottom of viewport
    const scrollRatio = scrollBottom / maxScroll;
    const wordsRead = Math.floor(scrollRatio * totalWords);

    return {
      percentageRead: isNaN(percentageRead) ? 0 : Math.max(percentageRead, 0),
      wordsRead: Math.min(wordsRead, totalWords),
      totalWords,
      readingTimeSeconds,
    };
  }, [currentContent, isOnline]);

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
  useEffect(() => {
    if (!currentProgress || startTimeRef.current !== Date.now()) return;

    // Only initialize if we haven't set it yet (still at default Date.now())
    const existingReadingTime =
      (currentProgress as any)?.readingTimeSeconds || 0;
    startTimeRef.current = Date.now() - existingReadingTime * 1000;
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
      <div className="min-h-screen bg-accent-shade-1 p-4 space-y-4">
        <Skeleton className="w-full h-12 rounded-lg" />
        <Skeleton className="w-full h-96 rounded-lg" />
      </div>
    );
  }

  // Story not found
  if (!activeStory) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
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
          <Skeleton className="w-full h-96 rounded-lg" />
        </div>
      ) : (
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
