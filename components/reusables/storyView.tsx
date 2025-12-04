"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/reusables/customUI/pageHeader";
import StoryForm from "@/components/reusables/form/storyForm";
import {
  useCreateStory,
  useUpdateStory,
  useFetchStory,
  useCreateMultipleChapters,
  useCreateMultipleEpisodes,
} from "@/src/hooks/useStoryMutations";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { usersControllerGetProfile } from "@/src/client/sdk.gen";
import { useUserStore } from "@/src/stores/useUserStore";
import type {
  StoryFormData,
  Chapter,
  Part,
  StoryViewProps,
} from "@/types/story";
import type { CreateStoryDto, UpdateStoryDto } from "@/src/client/types.gen";

const StoryView: React.FC<StoryViewProps> = ({ mode, storyId }) => {
  const router = useRouter();
  const { user: swrUser, mutate } = useUserProfile();
  const { user: storeUser } = useUserStore();
  const [initialData, setInitialData] = useState<
    Partial<StoryFormData> | undefined
  >();

  // Hooks for mutations
  const { createStory, isCreating: isCreatingStory } = useCreateStory();
  const { updateStory, isUpdating } = useUpdateStory();
  const { createMultipleChapters, isCreating: isCreatingChapters } = useCreateMultipleChapters();
  const { createMultipleEpisodes, isCreating: isCreatingEpisodes } = useCreateMultipleEpisodes();

  const isCreating = isCreatingStory || isCreatingChapters || isCreatingEpisodes;

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
        // Prefer store-backed user, fall back to SWR user
        console.log("[StoryView] submit: storeUser:", storeUser);

        // Support both store shapes: plain user or envelope with data.user
        const storeCandidate = (
          storeUser && (storeUser as any).data
            ? (storeUser as any).data?.user
            : storeUser
        ) as any;
        let effectiveUser = storeCandidate || swrUser;

        // If missing, call profile API directly ONCE and update store immediately
        if (!effectiveUser?.id) {
          console.warn("User missing; fetching profile directly...");
          try {
            const resp = await usersControllerGetProfile();
            const apiUser = (resp?.data as any)?.user;
            console.log("[StoryView] direct profile resp user:", apiUser);
            if (apiUser?.id) {
              effectiveUser = apiUser;
              // Keep Zustand in sync for subsequent operations
              useUserStore.getState().setUser(apiUser);
              console.log(
                "[StoryView] store set to apiUser:",
                useUserStore.getState().user
              );
            }
          } catch (e) {
            console.warn("[StoryView] direct profile fetch failed", e);
          }
        }

        if (!effectiveUser?.id) {
          // Avoid noisy console error overlay; guide user instead
          alert("Please log in to publish your story.");
          return;
        }

        const chapterFlag = Boolean(_chapters && _chapters.length > 0);
        // Check if any chapter has episodes (nested structure in UI)
        // OR if we are in "Episodes" mode (which might be represented differently in future, but for now relying on UI structure)
        // The user said "episodes are not chapter a story either has episodes or it has chapter".
        // So we need to check if we are creating chapters OR episodes.
        // In the current UI (StoryForm), it seems we might be mixing them or using 'chapters' state for both.
        // Let's assume _chapters contains the items. If the user selected "Episodes" mode in the form (if that exists) or if the items are episodes.
        // Looking at StoryForm might be needed to distinguish, but for now let's assume:
        // If the items have 'episodes' property populated, maybe they are chapters with episodes?
        // BUT user said "no two ways about it".
        // So we should probably check a flag from formData if possible, or infer.
        // Let's assume if `formData.episodes` is true, we treat _chapters as episodes (flat list) or we need to adjust how we read `_chapters`.
        // Actually, `StoryForm` passes `_chapters` which are `Chapter[]`.
        // If the user wants episodes, maybe they are just "chapters" with a different label in the UI?
        // Let's look at `apiData` construction.
        
        const episodesFlag = formData.episodes; // We need to ensure this comes from form data correctly.

        // Build content from chapters or parts
        // If has chapters/episodes, the main content is just the description or prologue
        const contentText = (chapterFlag || episodesFlag)
          ? formData.description
          : (_parts && _parts.length > 0)
            ? _parts.map((p) => `${p.title}\n${p.body}`).join("\n\n")
            : formData.description;

        const wordsCount = formData.description.trim().split(/\s+/).filter(Boolean).length;
        const descChars = formData.description.trim().length;
        const contentChars = contentText.trim().length;
        
        // Backend validation guardrails
        const descWordOk = wordsCount >= 50 && wordsCount <= 100;
        const descCharOk = descChars >= 50;
        const contentOk = contentChars >= 50;
        
        if (!descWordOk || !descCharOk || !contentOk) {
          alert("Please ensure: description is 50-100 words and at least 50 characters; content at least 50 characters.");
          return;
        }

        // Transform form data to API format
        const apiData = {
          authorId: effectiveUser.id,
          title: formData.title,
          description: formData.description,
          content: contentText,
          genres: formData.selectedGenres,
          collaborate: formData.collaborate
            ? formData.collaborate.split(",").map((c) => c.trim())
            : [],
          language: formData.language.toLowerCase() as any,
          anonymous: formData.goAnonymous,
          onlyOnStorytime: formData.onlyOnStorytime,
          trigger: formData.trigger,
          copyright: formData.copyright,
          // API expects boolean Chapter and Episodes flags
          chapter: chapterFlag && !episodesFlag, // Mutually exclusive
          episodes: episodesFlag,
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
            console.log("Story created successfully:", result.id);
            const newStoryId = result.id;

            // Bulk creation
            if (_chapters && _chapters.length > 0) {
              if (episodesFlag) {
                 // Treat _chapters as episodes (flat list)
                 // We map the UI "chapters" to API "episodes"
                 const episodesPayload = _chapters.map(ch => ({
                    title: ch.title,
                    body: ch.body
                 }));
                 await createMultipleEpisodes(newStoryId, episodesPayload);
              } else {
                 // Create chapters
                 const chaptersPayload = _chapters.map(ch => ({
                    title: ch.title,
                    body: ch.body
                 }));
                 await createMultipleChapters(newStoryId, chaptersPayload);
              }
            }

            if (formData.storyStatus === "Draft") {
              router.push("/my-stories?tab=drafts");
            } else {
              router.push(`/story/${newStoryId}`);
            }
          }
        }
      } catch (error) {
        console.error("Failed to save story:", error);
      }
    },
    [
      mode,
      storyId,
      storeUser,
      swrUser,
      createStory,
      updateStory,
      createMultipleChapters,
      createMultipleEpisodes,
      router,
    ]
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
