"use client";

import React, { useState, useCallback, useEffect } from "react";
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
import { showToast } from "@/lib/showNotification";
import {
  saveChaptersCache,
  saveEpisodesCache,
  getChaptersCache,
  getEpisodesCache,
  clearStoryCache,
  clearExpiredCaches,
} from "@/lib/storyCache";
import {
  migrateLocalStorageToIndexedDB,
  needsMigration,
} from "@/lib/cacheMigration";
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
  const [createdStoryId, setCreatedStoryId] = useState<string | null>(
    storyId || null
  );

  // Hooks for mutations
  const { createStory, isCreating: isCreatingStory } = useCreateStory();
  const { updateStory, isUpdating, error: updateError } = useUpdateStory();
  const { createMultipleChapters, isCreating: isCreatingChapters } =
    useCreateMultipleChapters();
  const { createMultipleEpisodes, isCreating: isCreatingEpisodes } =
    useCreateMultipleEpisodes();

  const isCreating =
    isCreatingStory || isCreatingChapters || isCreatingEpisodes;

  // Migrate from localStorage to IndexedDB and clear expired caches on mount
  useEffect(() => {
    const initCache = async () => {
      // Check if migration is needed
      if (needsMigration()) {
        console.log("Migrating cache from localStorage to IndexedDB...");
        const result = await migrateLocalStorageToIndexedDB();
        
        if (result.success) {
          showToast({
            type: "success",
            message: `Migrated ${result.migratedCount} cached items to IndexedDB`,
          });
        } else if (result.errors.length > 0) {
          console.error("Migration errors:", result.errors);
          showToast({
            type: "warning",
            message: "Some cached items failed to migrate",
          });
        }
      }
      
      // Clear expired caches
      await clearExpiredCaches();
    };

    initCache();
  }, []);

  // Fetch story data for edit mode
  const { story, isLoading: isFetchingStory } = useFetchStory(
    mode === "edit" ? storyId : undefined
  );

  // Authorization check for edit mode
  React.useEffect(() => {
    if (mode === "edit" && story && !isFetchingStory) {
      // Get current user
      const storeCandidate = (
        storeUser && (storeUser as any).data
          ? (storeUser as any).data?.user
          : storeUser
      ) as any;
      const currentUser = storeCandidate || swrUser;

      console.log("[StoryView] Authorization check:", {
        currentUserId: currentUser?.id,
        currentUserAuthorId: currentUser?.authorId,
        storyAuthorId: story.authorId,
        storyAuthor: story.author,
      });

      // Check if current user is the author
      // Try multiple ways to match: author.id, authorId, or currentUser.authorId
      const storyAuthorId = story.authorId || story.author?.id || story.author;
      const currentAuthorId = currentUser?.authorId || currentUser?.id;

      const isAuthor =
        currentAuthorId &&
        storyAuthorId &&
        (currentAuthorId === storyAuthorId ||
          currentUser?.id === storyAuthorId);

      console.log("[StoryView] Authorization result:", {
        isAuthor,
        currentAuthorId,
        storyAuthorId,
      });

      if (!isAuthor) {
        showToast({
          type: "error",
          message: "You are not authorized to edit this story.",
        });
        router.push(`/story/${storyId}`);
      }
    }
  }, [mode, story, isFetchingStory, storeUser, swrUser, storyId, router]);

  // Transform API story data to form data
  React.useEffect(() => {
    if (mode === "edit" && story) {
      // Capitalize language to match form options (API returns lowercase)
      const capitalizeLanguage = (lang: string) => {
        if (!lang) return "English";
        return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
      };

      setInitialData({
        id: story.id,
        title: story.title || "",
        collaborate: story.collaborate?.join(", ") || "",
        description: story.description || "",
        content: story.content || "",
        selectedGenres: story.genres || [],
        language: capitalizeLanguage(story.language || "english"),
        goAnonymous: story.anonymous || false,
        onlyOnStorytime: story.onlyOnStorytime || false,
        trigger: story.trigger || false,
        copyright: story.copyright || false,
        chapter: (story as any).chapter || false,
        episodes: (story as any).episodes || false,
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
        // If we have a createdStoryId, this is publishing chapters/episodes
        if (createdStoryId && (_chapters || _parts)) {
          console.log("[StoryView] Publishing chapters/episodes...", {
            createdStoryId,
            hasChapters: formData.chapter,
            hasEpisodes: formData.episodes,
            chaptersCount: _chapters?.length,
            partsCount: _parts?.length,
          });

          const hasChapters = formData.chapter === true;
          const hasEpisodes = formData.episodes === true;

          let publishSuccess = false;

          // Bulk creation of chapters or episodes
          if (hasChapters && _chapters && _chapters.length > 0) {
            console.log("[StoryView] Creating chapters...", _chapters);
            const chaptersPayload = _chapters.map((ch) => ({
              title: ch.title,
              body: ch.body,
            }));
            const result = await createMultipleChapters(
              createdStoryId,
              chaptersPayload
            );
            console.log("[StoryView] Chapters result:", result);
            publishSuccess = result?.success === true;
          } else if (hasEpisodes && _parts && _parts.length > 0) {
            console.log("[StoryView] Creating episodes...", _parts);
            const episodesPayload = _parts.map((ep) => ({
              title: ep.title,
              body: ep.body,
            }));
            const result = await createMultipleEpisodes(
              createdStoryId,
              episodesPayload
            );
            console.log("[StoryView] Episodes result:", result);
            publishSuccess = result?.success === true;
          } else {
            console.warn("[StoryView] No chapters or episodes to publish", {
              hasChapters,
              hasEpisodes,
              _chapters,
              _parts,
            });
          }

          // Only clear cache after successful publish
          if (publishSuccess) {
            clearStoryCache(createdStoryId);

            showToast({
              type: "success",
              message: hasChapters
                ? "Chapters published successfully!"
                : "Episodes published successfully!",
            });

            if (formData.storyStatus === "Draft") {
              router.push("/my-stories?tab=drafts");
            } else {
              router.push(`/story/${createdStoryId}`);
            }
          } else {
            showToast({
              type: "error",
              message: "Failed to publish. Your work is saved in cache.",
            });
          }
          return;
        }

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
          showToast({
            type: "error",
            message: "Please log in to publish your story.",
          });
          return;
        }

        // Story can have either chapters OR episodes, not both
        // Use the flags from formData which are set based on user selection
        const hasChapters = formData.chapter === true;
        const hasEpisodes = formData.episodes === true;

        const contentText =
          hasChapters || hasEpisodes
            ? formData.description
            : formData.content ||
              (_parts && _parts.length > 0
                ? _parts.map((p) => `${p.title}\n${p.body}`).join("\n\n")
                : formData.description);

        const wordsCount = formData.description
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;
        const descChars = formData.description.trim().length;

        // Validation for description (both create and edit)
        if (!formData.description.trim()) {
          showToast({
            type: "error",
            message: "Description is required.",
          });
          return;
        }

        if (wordsCount < 50) {
          showToast({
            type: "error",
            message: `Description needs at least 50 words. You have ${wordsCount} word${wordsCount !== 1 ? "s" : ""}.`,
          });
          return;
        }

        if (wordsCount > 100) {
          showToast({
            type: "error",
            message: `Description cannot exceed 100 words. You have ${wordsCount} words.`,
          });
          return;
        }

        if (descChars < 50) {
          showToast({
            type: "error",
            message: `Description needs at least 50 characters. You have ${descChars} character${descChars !== 1 ? "s" : ""}.`,
          });
          return;
        }

        // Content validation for stories without chapters/episodes
        if (!hasChapters && !hasEpisodes && !formData.content?.trim()) {
          showToast({
            type: "error",
            message:
              "Story content is required when not using chapters or episodes.",
          });
          return;
        }

        if (mode === "edit" && storyId) {
          // Update existing story - only send allowed fields for update
          const updatePayload: UpdateStoryDto = {
            title: formData.title,
            content: contentText,
            genres: formData.selectedGenres,
            collaborate: formData.collaborate
              ? formData.collaborate.split(",").map((c) => c.trim())
              : [],
            imageUrl: formData.coverImage || undefined,
          };

          const success = await updateStory(storyId, updatePayload);

          if (success) {
            showToast({
              type: "success",
              message: "Story updated successfully!",
            });
            router.push(`/story/${storyId}`);
          } else {
            // Show specific error message if available
            const errorMessage =
              updateError?.message ||
              "Failed to update story. Please try again.";
            showToast({
              type: "error",
              message: errorMessage,
            });
          }
        } else {
          // Create new story - includes all fields
          const createPayload: CreateStoryDto = {
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
            chapter: hasChapters,
            episodes: hasEpisodes,
            storyStatus:
              formData.storyStatus === "Completed"
                ? "complete"
                : formData.storyStatus === "In Progress"
                  ? "ongoing"
                  : ("drafts" as any),
          };

          const result = await createStory(createPayload);

          if (result.success && result.id) {
            const newStoryId = result.id;
            setCreatedStoryId(newStoryId); // Store created story ID

            // Save chapters/episodes to cache for later bulk creation
            if (hasChapters && _chapters && _chapters.length > 0) {
              saveChaptersCache(newStoryId, _chapters);
            } else if (hasEpisodes && _parts && _parts.length > 0) {
              saveEpisodesCache(newStoryId, _parts);
            }

            // Show success message
            showToast({
              type: "success",
              message:
                hasChapters || hasEpisodes
                  ? "Story created! You can now add chapters/episodes."
                  : "Story created successfully!",
            });

            // If has chapters/episodes, stay on the page to allow adding them
            // Otherwise redirect
            if (!hasChapters && !hasEpisodes) {
              if (formData.storyStatus === "Draft") {
                router.push("/my-stories?tab=drafts");
              } else {
                router.push(`/story/${newStoryId}`);
              }
            }
          } else {
            showToast({
              type: "error",
              message: "Failed to create story. Please try again.",
            });
          }
        }
      } catch (error) {
        console.error("Failed to save story:", error);
        showToast({
          type: "error",
          message: "An error occurred while saving the story.",
        });
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
          createdStoryId={createdStoryId}
        />
      </div>
    </div>
  );
};

export default StoryView;
