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
import { CommentsSection } from "./components";
// Lazy load comments section (code splitting)

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

  // Use counts from story data if available, otherwise use hook counts
  const displayLikeCount = (story as any)?.likeCount ?? likeCount ?? 0;
  const displayCommentCount = (story as any)?.commentCount ?? commentCount ?? 0;

  // Use episodesList from story if episodes endpoint returns empty
  const effectiveEpisodes = episodes?.length > 0 ? episodes : (story as any)?.episodesList || [];
  const effectiveChapters = chapters?.length > 0 ? chapters : [];

  // UI State
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
    chapters: effectiveChapters,
    episodes: effectiveEpisodes,
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

  console.log("Rendering CommentsSection with", {
    comments,
    isCommentsLoading,
  });

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
        authorName={
          activeStory.anonymous
            ? "Anonymous"
            : activeStory.author?.penName || "Unknown Author"
        }
        authorAvatar={activeStory.author?.avatar}
        hasNavigation={hasNavigation}
        description={activeStory.description}
      />

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

          {/* Comments Section - Always shown */}
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
