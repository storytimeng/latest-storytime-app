import React, { useState, lazy, Suspense } from "react";
import { Skeleton } from "@heroui/skeleton";
import {
  useStory,
  useStoryLikes,
  useStoryComments,
  useStoryChapters,
  useStoryEpisodes,
} from "@/src/hooks/useStoryDetail";
import {
  useOfflineStories,
  useOnlineStatus,
} from "@/src/hooks/useOfflineStories";

// Component imports
import { OfflineBanner } from "./components/OfflineBanner";
import { StoryHeader } from "./components/StoryHeader";
import { ChapterSelector } from "./components/ChapterSelector";
import { StoryContent } from "./components/StoryContent";
import { InteractionSection } from "./components/InteractionSection";
import { NavigationBar } from "./components/NavigationBar";

// Custom hooks
import { useScrollVisibility } from "./hooks/useScrollVisibility";
import { useOfflineContent } from "./hooks/useOfflineContent";
import { useStoryContent } from "./hooks/useStoryContent";

// Lazy load comments section (code splitting)
const CommentsSection = lazy(() =>
  import("./components/CommentsSection").then((mod) => ({
    default: mod.CommentsSection,
  }))
);

interface ReadStoryViewProps {
  storyId: string;
}

export const ReadStoryView = ({ storyId }: ReadStoryViewProps) => {
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
  const {
    comments,
    commentCount,
    isLoading: isCommentsLoading,
    createComment,
  } = useStoryComments(isOnline ? storyId : undefined);
  const { chapters, isLoading: isChaptersLoading } = useStoryChapters(
    isOnline ? storyId : undefined
  );
  const { episodes, isLoading: isEpisodesLoading } = useStoryEpisodes(
    isOnline ? storyId : undefined
  );

  // UI State
  const [showComments, setShowComments] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Custom hooks for derived state
  const isNavVisible = useScrollVisibility();
  const {
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
  } = useStoryContent({
    story,
    chapters,
    episodes,
    offlineStory,
    offlineContent,
    isUsingOfflineData,
    syncChapterIfNeeded,
    syncEpisodeIfNeeded,
  });

  // Handler for submitting comments
  const handleCommentSubmit = async (text: string) => {
    await createComment(text);
  };

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
    <div className="min-h-screen bg-accent-shade-1 relative overflow-hidden max-w-[28rem] mx-auto">
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
      <StoryContent
        content={currentContent}
        authorName={activeStory.author?.name || "Unknown Author"}
        authorAvatar={activeStory.author?.avatar}
        hasNavigation={hasNavigation}
      />

      {/* Interaction Section (only when online) */}
      {isOnline && (
        <div className="px-4 pb-6">
          <InteractionSection
            likeCount={likeCount || 0}
            commentCount={commentCount || 0}
            isLiked={isLiked || false}
            showComments={showComments}
            onToggleLike={toggleLike}
            onToggleComments={() => setShowComments(!showComments)}
          />

          {/* Comments Section (Lazy Loaded) */}
          {showComments && (
            <Suspense
              fallback={
                <div className="py-4">
                  <Skeleton className="w-full h-20 rounded-lg" />
                </div>
              }
            >
              <CommentsSection
                comments={comments || []}
                onSubmitComment={handleCommentSubmit}
              />
            </Suspense>
          )}
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
        />
      )}
    </div>
  );
};
