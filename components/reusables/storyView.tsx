"use client";

import React, { lazy, Suspense } from "react";
import PageHeader from "@/components/reusables/customUI/pageHeader";
import LoadingState from "@/components/reusables/customUI/LoadingState";
import StoryViewErrorBoundary from "@/components/reusables/StoryViewErrorBoundary";
import { useStoryViewLogic } from "@/src/hooks/useStoryViewLogic";
import type { StoryViewProps } from "@/types/story";

// Lazy load the heavy StoryForm component
const StoryForm = lazy(() => import("@/components/reusables/form/storyForm"));

/**
 * StoryView component for creating and editing stories
 * Implements code splitting and lazy loading for optimal performance
 */
const StoryView: React.FC<StoryViewProps> = ({ mode, storyId }) => {
  const {
    initialData,
    createdStoryId,
    isCreating,
    isUpdating,
    isFetchingStory,
    handleSubmit,
    handleCancel,
    pageTitle,
    backLink,
  } = useStoryViewLogic({ mode, storyId });

  // Show loading state while fetching data in edit mode
  if (mode === "edit" && isFetchingStory) {
    return (
      <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto">
        <PageHeader
          title={pageTitle}
          backLink={backLink}
          className="px-4 pt-5 pb-4"
        />
        <LoadingState message="Loading story..." />
      </div>
    );
  }

  return (
    <StoryViewErrorBoundary>
      <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto">
        {/* Page Header */}
        <PageHeader
          title={pageTitle}
          backLink={backLink}
          className="px-4 pt-5 pb-4"
          titleClassName="text-xl text-primary-colour font-bold"
        />

        {/* Story Form with Suspense for lazy loading */}
        <div className="px-4">
          <Suspense fallback={<LoadingState message="Loading form..." />}>
            <StoryForm
              mode={mode}
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isCreating || isUpdating}
              createdStoryId={createdStoryId}
            />
          </Suspense>
        </div>
      </div>
    </StoryViewErrorBoundary>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(StoryView);
