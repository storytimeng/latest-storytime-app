"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/reusables/customUI/pageHeader";
import StoryForm from "@/components/reusables/form/storyForm";
import {
  useCreateStory,
  useUpdateStory,
  useFetchStory,
} from "@/src/hooks/useStoryMutations";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import type {
  StoryFormData,
  Chapter,
  Part,
  StoryViewProps,
} from "@/types/story";
import type { CreateStoryDto, UpdateStoryDto } from "@/src/client/types.gen";

const StoryView: React.FC<StoryViewProps> = ({ mode, storyId }) => {
  const router = useRouter();
  const { user } = useUserProfile();
  const [initialData, setInitialData] = useState<
    Partial<StoryFormData> | undefined
  >();

  // Hooks for mutations
  const { createStory, isCreating } = useCreateStory();
  const { updateStory, isUpdating } = useUpdateStory();

  // Fetch story data for edit mode
  const { story, isLoading: isFetchingStory } = useFetchStory(
    mode === "edit" ? storyId : undefined
  );

  // Transform API story data to form data
  React.useEffect(() => {
    if (mode === "edit" && story) {
      setInitialData({
        id: story.id,
        title: story.title || "",
        collaborate: story.collaborate?.join(", ") || "",
        description: story.description || "",
        selectedGenres: story.genres || [],
        language: story.language || "English",
        goAnonymous: story.anonymous || false,
        onlyOnStorytime: story.onlyOnStorytime || false,
        trigger: story.trigger || false,
        copyright: story.copyright || false,
        storyStatus:
          story.storyStatus === "complete"
            ? "Completed"
            : story.storyStatus === "ongoing"
              ? "In Progress"
              : story.storyStatus === "drafts"
                ? "Draft"
                : "Draft",
        coverImage: story.coverImage || story.cover || undefined,
      });
    }
  }, [mode, story]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (formData: StoryFormData, _chapters?: Chapter[], _parts?: Part[]) => {
      try {
        if (!user?.id) {
          console.error("User not authenticated");
          return;
        }

        // Transform form data to API format
        const apiData = {
          authorId: user.id,
          title: formData.title,
          description: formData.description,
          content: formData.description, // TODO: Add separate content field in form
          genres: formData.selectedGenres,
          collaborate: formData.collaborate
            ? formData.collaborate.split(",").map((c) => c.trim())
            : [],
          language: formData.language.toLowerCase() as any,
          anonymous: formData.goAnonymous,
          onlyOnStorytime: formData.onlyOnStorytime,
          trigger: formData.trigger,
          copyright: formData.copyright,
          storyStatus:
            formData.storyStatus === "Completed"
              ? "complete"
              : formData.storyStatus === "In Progress"
                ? "ongoing"
                : ("drafts" as any),
        };

        if (mode === "edit" && storyId) {
          // Update existing story
          const success = await updateStory(storyId, apiData as UpdateStoryDto);

          if (success) {
            console.log("Story updated successfully!");
            router.push(`/story/${storyId}`);
          }
        } else {
          // Create new story
          const result = await createStory(apiData as CreateStoryDto);

          if (result.success && result.id) {
            console.log("Story created successfully!");

            if (formData.storyStatus === "Draft") {
              router.push("/my-stories?tab=drafts");
            } else {
              router.push(`/story/${result.id}`);
            }
          }
        }
      } catch (error) {
        console.error("Failed to save story:", error);
      }
    },
    [mode, storyId, user, createStory, updateStory, router]
  );

  // Handle cancel action
  const handleCancel = useCallback(() => {
    if (mode === "edit") {
      router.push("/my-stories");
    } else {
      router.push("/pen");
    }
  }, [mode, router]);

  // Determine page title and back link
  const pageTitle = mode === "edit" ? "Edit Story" : "New Story";
  const backLink = mode === "edit" ? "/my-stories" : "/pen";

  // Show loading state while fetching data
  if (mode === "edit" && isFetchingStory) {
    return (
      <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto">
        <PageHeader
          title={pageTitle}
          backLink={backLink}
          className="px-4 pt-5 pb-4"
        />
        <div className="px-4 flex items-center justify-center py-20">
          <div className="text-primary-colour">Loading story...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto">
      {/* Page Header */}
      <PageHeader
        title={pageTitle}
        backLink={backLink}
        className="px-4 pt-5 pb-4"
        titleClassName="text-xl text-primary-colour font-bold"
      />

      {/* Story Form */}
      <div className="px-4">
        <StoryForm
          mode={mode}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isCreating || isUpdating}
        />
      </div>
    </div>
  );
};

export default StoryView;
