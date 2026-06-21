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
import { cn } from "@/lib/utils";

const StoryForm = lazy(() => import("@/components/reusables/form/storyForm"));

const StoryView: React.FC<StoryViewProps> = ({
  mode,
  storyId,
  shell = "mobile",
}) => {
  const router = useRouter();
  const { openModal: openAuthModal } = useAuthModalStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isDesktop = shell === "desktop";

  useEffect(() => {
    router.prefetch("/");

    if (!isAuthenticated()) {
      openAuthModal("login");
    }
  }, [isAuthenticated, openAuthModal, router]);

  const {
    initialData,
    createdStoryId,
    isCreating,
    isSubmitting,
    isUpdating,
    isFetchingStory,
    handleSubmit,
    handleCancel,
    initialChapters,
    initialParts,
    pageTitle,
    backLink,
    handleBack,
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
  } = useStoryViewLogic({ mode, storyId, shell });

  const shellClassName = cn(
    "min-h-screen bg-accent-shade-1",
    isDesktop
      ? "mx-auto w-full max-w-4xl px-4 lg:px-8"
      : "mx-auto max-w-[28rem]",
  );

  if (mode === "edit" && isFetchingStory) {
    return (
      <div className={shellClassName}>
        <PageHeader
          title={pageTitle}
          backLink={backLink}
          className="px-0 pt-5 pb-4"
          onBackPress={handleBack}
        />
        <LoadingState message="Loading story..." />
      </div>
    );
  }

  return (
    <StoryViewErrorBoundary>
      <div className={shellClassName}>
        <PageHeader
          title={pageTitle}
          backLink={backLink}
          className="px-0 pt-5 pb-4"
          titleClassName="text-xl text-primary-colour font-bold"
          onBackPress={handleBack}
        />

        <div className={cn(isDesktop ? "" : "px-4")}>
          <Suspense fallback={<LoadingState message="Loading form..." />}>
            <StoryForm
              mode={mode}
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isCreating || isSubmitting || isUpdating}
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

export default React.memo(StoryView);
