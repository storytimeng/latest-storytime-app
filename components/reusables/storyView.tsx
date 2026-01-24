"use client";

import React, { lazy, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";
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
  const router = useRouter();
  const { openModal: openAuthModal } = useAuthModalStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Prefetch home route as it's the most common redirect
    router.prefetch("/");
    
    if (!isAuthenticated()) {
      openAuthModal("login");
      router.push("/");
    }
  }, [isAuthenticated, openAuthModal, router]);

  const {
    initialData,
    createdStoryId,
    isCreating,
    isUpdating,
    isFetchingStory,
    handleSubmit,
    handleCancel,
    initialChapters,
    initialParts,
    pageTitle,
    backLink,
    handleBack,
    // Lifted state
    formData,
    formErrors,
    currentStep,
    storyStructure,
    setFormData,
    setFormErrors,
    setCurrentStep,
    setStoryStructure,
    handleFieldChange,
    handleGenreToggle,
    validateForm,
    handleStructureNext,
  } = useStoryViewLogic({ mode, storyId });

  // Show loading state while fetching data in edit mode
  if (mode === "edit" && isFetchingStory) {
    return (
      <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto">
        <PageHeader
          title={pageTitle}
          backLink={backLink}
          className="px-4 pt-5 pb-4"
          onBackPress={handleBack}
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
          onBackPress={handleBack}
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
              initialChapters={initialChapters}
              initialParts={initialParts}
              // Pass lifted state
              formData={formData}
              formErrors={formErrors}
              currentStep={currentStep}
              storyStructure={storyStructure}
              setFormData={setFormData}
              setFormErrors={setFormErrors}
              setCurrentStep={setCurrentStep}
              setStoryStructure={setStoryStructure}
              handleFieldChange={handleFieldChange}
              handleGenreToggle={handleGenreToggle}
              validateForm={validateForm}
              handleStructureNext={handleStructureNext}
            />
          </Suspense>
        </div>
      </div>
    </StoryViewErrorBoundary>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(StoryView);
