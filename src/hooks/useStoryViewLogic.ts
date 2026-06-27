import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateStory,
  useUpdateStory,
  useFetchStory,
  useCreateMultipleChapters,
  useCreateMultipleEpisodes,
} from "@/src/hooks/useStoryMutations";
import { storiesControllerRemove } from "@/src/client";
import { useUpdateMultipleChapters } from "@/src/hooks/useUpdateChapter";
import { useUpdateMultipleEpisodes } from "@/src/hooks/useUpdateEpisode";
import { useDeleteMultipleChapters } from "@/src/hooks/useDeleteChapter";
import { useDeleteMultipleEpisodes } from "@/src/hooks/useDeleteEpisode";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { usersControllerGetProfile } from "@/src/client/sdk.gen";
import { useUserStore } from "@/src/stores/useUserStore";
import { showToast } from "@/lib/showNotification";
import { getStoryBlurbValidationError } from "@/lib/storyBlurb";
import {
  saveChaptersCache,
  saveEpisodesCache,
  clearStoryCache,
  clearExpiredCaches,
} from "@/lib/storyCache";
import {
  migrateLocalStorageToIndexedDB,
  needsMigration,
} from "@/lib/cacheMigration";
import type { StoryFormData, Chapter, Part } from "@/types/story";
import type { CreateStoryDto, UpdateStoryDto } from "@/src/client/types.gen";
import { useStoryFormState } from "@/src/hooks/useStoryFormState";
import type { StoryStructure } from "@/types/story";
import { getStoryRoutes, type StoryShell } from "@/lib/storyRoutes";

interface UseStoryViewLogicProps {
  mode: "create" | "edit";
  storyId?: string;
  shell?: StoryShell;
}

interface UseStoryViewLogicReturn {
  initialData: Partial<StoryFormData> | undefined;
  initialChapters: Chapter[] | undefined;
  initialParts: Part[] | undefined;
  createdStoryId: string | null;
  isCreating: boolean;
  isSubmitting: boolean;
  isUpdating: boolean;
  isFetchingStory: boolean;
  handleSubmit: (
    formData: StoryFormData,
    chapters?: Chapter[],
    parts?: Part[],
    deletedChapters?: Chapter[],
    deletedParts?: Part[],
  ) => Promise<void>;
  handleCancel: () => void;
  pageTitle: string;
  backLink: string;
  // Lifted form state
  formData: StoryFormData;
  formErrors: Partial<Record<keyof StoryFormData, string>>;
  currentStep: "form" | "structure" | "writing" | "additional";
  storyStructure: StoryStructure;
  setFormData: React.Dispatch<React.SetStateAction<StoryFormData>>;
  setFormErrors: React.Dispatch<
    React.SetStateAction<Partial<Record<keyof StoryFormData, string>>>
  >;
  setCurrentStep: React.Dispatch<
    React.SetStateAction<"form" | "structure" | "writing" | "additional">
  >;
  setStoryStructure: React.Dispatch<React.SetStateAction<StoryStructure>>;
  handleFieldChange: (
    field: keyof StoryFormData,
    value: string | number | boolean | string[],
  ) => void;
  handleGenreToggle: (genre: string) => void;
  validateForm: () => boolean;
  handleStructureNext: (structure: StoryStructure) => void;
  handleBack: () => void;
}

/**
 * Custom hook that encapsulates all business logic for StoryView component
 * Handles story creation, editing, authorization, and cache management
 */
export function useStoryViewLogic({
  mode,
  storyId,
  shell = "mobile",
}: UseStoryViewLogicProps): UseStoryViewLogicReturn {
  const router = useRouter();
  const routes = useMemo(() => getStoryRoutes(shell), [shell]);
  const { user: swrUser } = useUserProfile();
  const { user: storeUser } = useUserStore();
  const [initialData, setInitialData] = useState<
    Partial<StoryFormData> | undefined
  >();
  const [initialChapters, setInitialChapters] = useState<
    Chapter[] | undefined
  >();
  const [initialParts, setInitialParts] = useState<Part[] | undefined>();
  const [createdStoryId, setCreatedStoryId] = useState<string | null>(
    storyId || null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // Lifted form state
  const formState = useStoryFormState({ initialData, mode });
  const { currentStep, setCurrentStep, storyStructure } = formState;

  // Hooks for mutations
  const { createStory, isCreating: isCreatingStory } = useCreateStory();
  const { updateStory, isUpdating, error: updateError } = useUpdateStory();
  const { createMultipleChapters, isCreating: isCreatingChapters } =
    useCreateMultipleChapters();
  const { createMultipleEpisodes, isCreating: isCreatingEpisodes } =
    useCreateMultipleEpisodes();
  const { updateMultipleChapters, isUpdating: isUpdatingChapters } =
    useUpdateMultipleChapters();
  const { updateMultipleEpisodes, isUpdating: isUpdatingEpisodes } =
    useUpdateMultipleEpisodes();
  const { deleteMultipleChapters, isDeleting: isDeletingChapters } =
    useDeleteMultipleChapters();
  const { deleteMultipleEpisodes, isDeleting: isDeletingEpisodes } =
    useDeleteMultipleEpisodes();

  const isCreating =
    isCreatingStory ||
    isCreatingChapters ||
    isCreatingEpisodes ||
    isUpdatingChapters ||
    isUpdatingEpisodes ||
    isDeletingChapters ||
    isDeletingEpisodes;

  // Fetch story data for edit mode
  const { story, isLoading: isFetchingStory } = useFetchStory(
    mode === "edit" ? storyId : undefined,
  );

  // Prefetch common navigation routes
  useEffect(() => {
    router.prefetch(routes.myStories);
    router.prefetch(routes.write);
    if (storyId) {
      router.prefetch(routes.story(storyId));
    }
  }, [router, storyId, routes]);

  // Initialize cache on mount
  useEffect(() => {
    const initCache = async () => {
      if (storeUser?.id && needsMigration()) {
        const result = await migrateLocalStorageToIndexedDB(storeUser.id);

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

      await clearExpiredCaches();
    };

    if (storeUser?.id) {
      initCache();
    }
  }, [storeUser?.id]);

  // Authorization check for edit mode
  useEffect(() => {
    if (mode === "edit" && story && !isFetchingStory) {
      const currentUser = storeUser || swrUser;

      const storyAuthorId = story.authorId || story.author?.id || story.author;
      const currentAuthorId = currentUser?.authorId || currentUser?.id;

      const isAuthor =
        currentAuthorId &&
        storyAuthorId &&
        (currentAuthorId === storyAuthorId ||
          currentUser?.id === storyAuthorId);

      if (!isAuthor) {
        showToast({
          type: "error",
          message: "You are not authorized to edit this story.",
        });
        if (storyId) {
          router.push(routes.story(storyId));
        }
      }
    }
  }, [
    mode,
    story,
    isFetchingStory,
    storeUser,
    swrUser,
    storyId,
    router,
    routes,
  ]);

  // Transform API story data to form data
  useEffect(() => {
    if (mode === "edit" && story) {
      const capitalizeLanguage = (lang: string) => {
        if (!lang) return "English";
        return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
      };

      setInitialData({
        id: story.id,
        title: story.title || "",
        collaborate: Array.isArray(story.collaborate)
          ? story.collaborate.join(", ")
          : story.collaborate || "",
        description: story.description || "",
        content: story.content || "",
        selectedGenres: Array.isArray(story.genres) ? story.genres : [],
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
        coverImage:
          (story as any).imageUrl ||
          story.coverImage ||
          (story as any).cover ||
          undefined,
      });

      // Populate initial chapters and parts - keep all from API (even if just metadata)
      // In edit mode, we want to show all chapters/episodes that exist, even if they don't have content yet
      if (
        story.chapters &&
        Array.isArray(story.chapters) &&
        story.chapters.length > 0
      ) {
        const mappedChapters = story.chapters.map((ch: any, index: number) => ({
          id: index + 1, // Use array index for unique local ID
          uuid: ch.id, // Store the API's UUID
          title: ch.title || `Chapter ${ch.chapterNumber || index + 1}`,
          body: ch.content || ch.body || "",
          chapterNumber: ch.chapterNumber,
          createdAt: ch.createdAt,
          updatedAt: ch.updatedAt,
          isDraft: ch.isDraft ?? false,
        }));
        console.log(
          "[useStoryViewLogic] Setting initialChapters from API chapters:",
          {
            apiChapters: story.chapters,
            mappedChapters,
          },
        );
        setInitialChapters(mappedChapters);
      }

      if (
        story.episodes &&
        Array.isArray(story.episodes) &&
        story.episodes.length > 0
      ) {
        const mappedEpisodes = story.episodes.map((ep: any, index: number) => ({
          id: index + 1, // Use array index for unique local ID
          uuid: ep.id, // Store the API's UUID
          title: ep.title || `Episode ${ep.episodeNumber || index + 1}`,
          body: ep.content || ep.body || "",
          episodeNumber: ep.episodeNumber,
          createdAt: ep.createdAt,
          updatedAt: ep.updatedAt,
          isDraft: ep.isDraft ?? false,
        }));
        console.log(
          "[useStoryViewLogic] Setting initialParts from API episodes:",
          {
            apiEpisodes: story.episodes,
            mappedEpisodes,
          },
        );
        setInitialParts(mappedEpisodes);
      }
    }
  }, [mode, story]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (currentStep === "writing") {
      // Go back to structure selection if in create mode and no chapters/episodes yet?
      // Or if structure was just selected.
      // Actually, if we are in writing step, we should check if we came from structure step.
      // If mode is create, we likely came from structure if hasChapters/hasEpisodes is true.
      if (mode === "create") {
        setCurrentStep("structure");
      } else {
        // In edit mode, maybe go back to form?
        // But edit mode initializes to writing if chapters exist.
        // Let's assume hitting back in writing goes to form (details)
        setCurrentStep("form");
      }
    } else if (currentStep === "structure") {
      setCurrentStep("form");
    } else {
      // Default router back
      if (mode === "edit") {
        router.push(routes.myStories);
      } else {
        router.push(routes.write);
      }
    }
  }, [currentStep, mode, router, routes, setCurrentStep]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (
      formData: StoryFormData,
      _chapters?: Chapter[],
      _parts?: Part[],
      deletedChapters?: Chapter[],
      deletedParts?: Part[],
    ) => {
      if (isSubmittingRef.current) return;

      isSubmittingRef.current = true;
      setIsSubmitting(true);

      try {
        // If we have a createdStoryId, this is publishing chapters/episodes
        // ONLY valid if we are in CREATE mode (step 2 of wizard).
        // In Edit mode, we want to fall through to the update logic.
        if (mode === "create" && createdStoryId && (_chapters || _parts)) {
          const hasChapters = formData.chapter === true;
          const hasEpisodes = formData.episodes === true;

          let publishSuccess = false;
          let result:
            | { success: boolean; count?: number; error?: string }
            | undefined;

          // Bulk creation of chapters or episodes
          if (hasChapters && _chapters && _chapters.length > 0) {
            const chaptersPayload = _chapters.map((ch) => ({
              title: ch.title,
              body: ch.body,
              isDraft: ch.isDraft ?? true,
            }));
            result = await createMultipleChapters(
              createdStoryId,
              chaptersPayload,
            );
            publishSuccess = result?.success === true;
          } else if (hasEpisodes && _parts && _parts.length > 0) {
            const episodesPayload = _parts.map((ep) => ({
              title: ep.title,
              body: ep.body,
              isDraft: ep.isDraft ?? true,
            }));
            result = await createMultipleEpisodes(
              createdStoryId,
              episodesPayload,
            );
            publishSuccess = result?.success === true;
          }

          // Only clear cache after successful publish
          if (publishSuccess) {
            if (storeUser?.id) {
              clearStoryCache(createdStoryId, storeUser.id);
            }

            showToast({
              type: "success",
              message: hasChapters
                ? "Chapters published successfully!"
                : "Episodes published successfully!",
            });

            if (formData.storyStatus === "Draft") {
              router.push(routes.myStoriesDrafts);
            } else if (createdStoryId) {
              router.push(routes.story(createdStoryId));
            }
          } else {
            const errorMsg =
              result?.error ||
              "Failed to publish. Your work is saved in cache.";

            // Clean up the orphaned story so the author doesn't end up with
            // a chapter/episode story that has no content attached.
            try {
              await storiesControllerRemove({ path: { id: createdStoryId } });
              setCreatedStoryId(null);
            } catch (cleanupErr) {
              console.warn(
                "[useStoryViewLogic] Orphaned story cleanup failed:",
                cleanupErr,
              );
            }

            showToast({
              type: "error",
              message: errorMsg,
            });
          }
          return;
        }

        // Get effective user
        let effectiveUser = storeUser || swrUser;

        // If missing, call profile API directly
        if (!effectiveUser?.id) {
          try {
            const resp = await usersControllerGetProfile();
            const apiUser = (resp?.data as any)?.user;
            if (apiUser?.id) {
              effectiveUser = apiUser;
              useUserStore.getState().setUser(apiUser);
            }
          } catch (e) {
            console.warn("[useStoryViewLogic] direct profile fetch failed", e);
          }
        }

        if (!effectiveUser?.id) {
          showToast({
            type: "error",
            message: "Please log in to publish your story.",
          });
          return;
        }

        // Validate description
        const hasChapters = formData.chapter === true;
        const hasEpisodes = formData.episodes === true;

        const blurbError = getStoryBlurbValidationError(formData.description);
        if (blurbError) {
          showToast({
            type: "error",
            message: blurbError,
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

        // Check if content already exists via props or logic before proceeding
        // The API integration below looks correct

        // Content logic:
        // - For stories WITH chapters/episodes: content can be description (for CREATE) or empty
        // - For stories WITHOUT chapters/episodes: content is the actual story text from formData.content
        // - Description and content are SEPARATE fields and should not be mixed in updates
        const contentText =
          hasChapters || hasEpisodes
            ? formData.content || formData.description || "" // Use description as fallback for CREATE
            : formData.content ||
              (_parts && _parts.length > 0
                ? _parts.map((p) => `${p.title}\n${p.body}`).join("\n\n")
                : "");

        if (mode === "edit" && storyId) {
          // Update existing story - only send changed fields
          const updatePayload: Partial<UpdateStoryDto> = {};

          if (formData.title !== initialData?.title) {
            updatePayload.title = formData.title;
          }

          // Update description if changed
          if (formData.description !== initialData?.description) {
            (updatePayload as any).description = formData.description;
          }

          // Update content if changed (separate from description)
          if (
            formData.content !== initialData?.content &&
            formData.content !== undefined &&
            formData.content !== null
          ) {
            updatePayload.content = formData.content;
          }

          if (
            JSON.stringify(formData.selectedGenres) !==
            JSON.stringify(initialData?.selectedGenres)
          ) {
            updatePayload.genres = formData.selectedGenres;
          }

          const currentCollaborators = formData.collaborate
            ? formData.collaborate
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
            : [];
          const initialCollaborators = initialData?.collaborate
            ? typeof initialData.collaborate === "string"
              ? initialData.collaborate
                  .split(",")
                  .map((c: string) => c.trim())
                  .filter(Boolean)
              : initialData.collaborate
            : [];

          if (
            JSON.stringify(currentCollaborators) !==
            JSON.stringify(initialCollaborators)
          ) {
            updatePayload.collaborate =
              currentCollaborators.length > 0 ? currentCollaborators : [];
          }

          if (formData.coverImage !== initialData?.coverImage) {
            updatePayload.imageUrl = formData.coverImage || undefined;
          }

          const apiStatus =
            formData.storyStatus === "Published" ||
            formData.storyStatus === "Completed"
              ? "complete"
              : formData.storyStatus === "In Progress" ||
                  formData.storyStatus === "On Hold"
                ? "ongoing"
                : "drafts";

          const initialStatus =
            initialData?.storyStatus === "Completed" ||
            initialData?.storyStatus === "Published"
              ? "complete"
              : initialData?.storyStatus === "In Progress" ||
                  initialData?.storyStatus === "On Hold"
                ? "ongoing"
                : "drafts";

          if (apiStatus !== initialStatus) {
            updatePayload.storyStatus = apiStatus as any;
          }

          // Update story metadata (excludes chapters/episodes)
          let storyUpdateSuccess = true;
          if (Object.keys(updatePayload).length > 0) {
            console.log("[useStoryViewLogic] Updating story with payload:", {
              storyId,
              updatePayload,
              note: "content field should only contain formData.content, NOT description",
            });

            storyUpdateSuccess = await updateStory(
              storyId,
              updatePayload as any,
            );

            if (!storyUpdateSuccess) {
              const errorMessage =
                updateError?.message ||
                "Failed to update story. Please try again.";
              showToast({
                type: "error",
                message: errorMessage,
              });
              return;
            }
          }

          // Handle chapter/episode updates separately
          let contentUpdateSuccess = true;
          let contentUpdateMessage = "";
          let deletedCount = 0;
          let createdCount = 0;

          // Delete chapters/episodes first
          if (deletedChapters && deletedChapters.length > 0) {
            const chapterUuidsToDelete = deletedChapters
              .filter((ch) => ch.uuid)
              .map((ch) => ch.uuid!);

            if (chapterUuidsToDelete.length > 0) {
              console.log(
                "[useStoryViewLogic] Deleting chapters:",
                chapterUuidsToDelete,
              );

              const deleteResult =
                await deleteMultipleChapters(chapterUuidsToDelete);
              deletedCount += deleteResult.deleted;

              if (deleteResult.failed > 0) {
                contentUpdateMessage += ` ${deleteResult.failed} chapter${deleteResult.failed > 1 ? "s" : ""} failed to delete.`;
              }
            }
          }

          if (deletedParts && deletedParts.length > 0) {
            const partUuidsToDelete = deletedParts
              .filter((p) => p.uuid)
              .map((p) => p.uuid!);

            if (partUuidsToDelete.length > 0) {
              console.log(
                "[useStoryViewLogic] Deleting episodes:",
                partUuidsToDelete,
              );

              const deleteResult =
                await deleteMultipleEpisodes(partUuidsToDelete);
              deletedCount += deleteResult.deleted;

              if (deleteResult.failed > 0) {
                contentUpdateMessage += ` ${deleteResult.failed} episode${deleteResult.failed > 1 ? "s" : ""} failed to delete.`;
              }
            }
          }

          // Create new chapters/episodes (ones without UUID)
          if (_chapters && _chapters.length > 0 && storyId) {
            const newChapters = _chapters.filter((ch) => !ch.uuid);

            if (newChapters.length > 0) {
              console.log(
                "[useStoryViewLogic] Creating new chapters:",
                newChapters,
              );

              const chaptersPayload = newChapters.map((ch) => ({
                title: ch.title,
                body: ch.body,
                isDraft: ch.isDraft ?? true,
              }));

              const result = await createMultipleChapters(
                storyId,
                chaptersPayload,
              );

              if (result?.success) {
                createdCount += result.count || 0;
              }
            }
          }

          if (_parts && _parts.length > 0 && storyId) {
            const newParts = _parts.filter((p) => !p.uuid);

            if (newParts.length > 0) {
              console.log(
                "[useStoryViewLogic] Creating new episodes:",
                newParts,
              );

              const partsPayload = newParts.map((p) => ({
                title: p.title,
                body: p.body,
                isDraft: p.isDraft ?? true,
              }));

              const result = await createMultipleEpisodes(
                storyId,
                partsPayload,
              );

              if (result?.success) {
                createdCount += result.count || 0;
              }
            }
          }

          // Update existing chapters/episodes
          if (_chapters && _chapters.length > 0) {
            // Filter chapters that have UUIDs (existing chapters)
            const chaptersToUpdate = _chapters.filter((ch) => ch.uuid);

            if (chaptersToUpdate.length > 0) {
              console.log(
                "[useStoryViewLogic] Updating edited chapters:",
                chaptersToUpdate,
              );

              const updatePayload = chaptersToUpdate.map((ch) => ({
                uuid: ch.uuid!,
                title: ch.title,
                body: ch.body,
                chapterNumber: ch.chapterNumber,
                isDraft: ch.isDraft,
              }));

              console.log(
                "[useStoryViewLogic] Chapter update payload:",
                updatePayload,
              );

              const result = await updateMultipleChapters(updatePayload);

              contentUpdateSuccess = result.success;

              if (result.updated > 0) {
                contentUpdateMessage += ` ${result.updated} chapter${result.updated > 1 ? "s" : ""} updated.`;
              }

              if (result.failed > 0) {
                contentUpdateMessage += ` ${result.failed} chapter${result.failed > 1 ? "s" : ""} failed to update.`;
              }
            }
          }

          if (_parts && _parts.length > 0) {
            // Filter episodes that have UUIDs (existing episodes)
            const episodesToUpdate = _parts.filter((p) => p.uuid);

            if (episodesToUpdate.length > 0) {
              console.log(
                "[useStoryViewLogic] Updating edited episodes:",
                episodesToUpdate,
              );

              const updatePayload = episodesToUpdate.map((p) => ({
                uuid: p.uuid!,
                title: p.title,
                body: p.body,
                episodeNumber: p.episodeNumber,
                isDraft: p.isDraft,
              }));

              console.log(
                "[useStoryViewLogic] Episode update payload:",
                updatePayload,
              );

              const result = await updateMultipleEpisodes(updatePayload);

              contentUpdateSuccess = result.success;

              if (result.updated > 0) {
                contentUpdateMessage += ` ${result.updated} episode${result.updated > 1 ? "s" : ""} updated.`;
              }

              if (result.failed > 0) {
                contentUpdateMessage += ` ${result.failed} episode${result.failed > 1 ? "s" : ""} failed to update.`;
              }
            }
          }

          // Build summary message
          if (deletedCount > 0) {
            contentUpdateMessage = `${deletedCount} item${deletedCount > 1 ? "s" : ""} deleted.${contentUpdateMessage}`;
          }
          if (createdCount > 0) {
            contentUpdateMessage = `${createdCount} item${createdCount > 1 ? "s" : ""} created.${contentUpdateMessage}`;
          }

          // Show appropriate success/error messages
          if (storyUpdateSuccess && contentUpdateSuccess) {
            const message = contentUpdateMessage
              ? `Story updated! ${contentUpdateMessage}`
              : "Story updated successfully!";

            showToast({
              type: "success",
              message,
            });
            if (storyId) {
              router.push(routes.story(storyId));
            }
          } else if (storyUpdateSuccess && !contentUpdateSuccess) {
            showToast({
              type: "warning",
              message: `Story metadata updated but some content updates failed. ${contentUpdateMessage}`,
            });
          } else {
            showToast({
              type: "error",
              message: "Failed to update story.",
            });
          }
        } else {
          // Create new story
          // Parse collaborators - only include if there are actual values
          const collaborators = formData.collaborate
            ? formData.collaborate
                .split(",")
                .map((c) => c.trim())
                .filter((c) => c.length > 0)
            : [];

          const apiStatus =
            formData.storyStatus === "Published" ||
            formData.storyStatus === "Completed"
              ? hasChapters || hasEpisodes
                ? "ongoing"
                : "complete"
              : formData.storyStatus === "In Progress" ||
                  formData.storyStatus === "On Hold"
                ? "ongoing"
                : "drafts";

          const createPayload: CreateStoryDto = {
            authorId: effectiveUser.id,
            title: formData.title,
            description: formData.description,
            content: contentText,
            genres: formData.selectedGenres,
            // Only include collaborate if there are collaborators
            ...(collaborators.length > 0 && { collaborate: collaborators }),
            language: formData.language.toLowerCase() as any,
            anonymous: formData.goAnonymous,
            onlyOnStorytime: formData.onlyOnStorytime,
            trigger: formData.trigger,
            copyright: formData.copyright,
            imageUrl: formData.coverImage,
            // API requires chapter and episodes flags to be present
            chapter: hasChapters,
            episodes: hasEpisodes,
            storyStatus: apiStatus as any,
          } as CreateStoryDto;

          const result = await createStory(createPayload);

          if (result.success && result.id) {
            const newStoryId = result.id;
            setCreatedStoryId(newStoryId);

            // Save chapters/episodes to cache for later bulk creation
            if (
              hasChapters &&
              _chapters &&
              _chapters.length > 0 &&
              storeUser?.id
            ) {
              saveChaptersCache(newStoryId, storeUser.id, _chapters);
            } else if (
              hasEpisodes &&
              _parts &&
              _parts.length > 0 &&
              storeUser?.id
            ) {
              saveEpisodesCache(newStoryId, storeUser.id, _parts);
            }

            showToast({
              type: "success",
              message:
                hasChapters || hasEpisodes
                  ? "Story created! You can now add chapters/episodes."
                  : "Story created successfully!",
            });

            // If has chapters/episodes, immediately attempt to publish them
            if (hasChapters || hasEpisodes) {
              let publishSuccess = false;
              let result:
                | { success: boolean; count?: number; error?: string }
                | undefined;

              if (hasChapters && _chapters && _chapters.length > 0) {
                const chaptersPayload = _chapters.map((ch) => ({
                  title: ch.title,
                  body: ch.body,
                  isDraft: ch.isDraft ?? true,
                }));
                result = await createMultipleChapters(
                  newStoryId,
                  chaptersPayload,
                );
                publishSuccess = result?.success === true;
              } else if (hasEpisodes && _parts && _parts.length > 0) {
                const episodesPayload = _parts.map((ep) => ({
                  title: ep.title,
                  body: ep.body,
                  isDraft: ep.isDraft ?? true,
                }));
                result = await createMultipleEpisodes(
                  newStoryId,
                  episodesPayload,
                );
                publishSuccess = result?.success === true;
              }

              if (publishSuccess) {
                if (storeUser?.id) {
                  clearStoryCache(newStoryId, storeUser.id);
                }
                showToast({
                  type: "success",
                  message: hasChapters
                    ? "Story and chapters published successfully!"
                    : "Story and episodes published successfully!",
                });
                router.push(routes.story(newStoryId));
              } else {
                const errorMsg = hasChapters
                  ? result?.error || "Failed to publish chapters"
                  : result?.error || "Failed to publish episodes";
                throw new Error(errorMsg);
              }
            } else {
              if (formData.storyStatus === "Draft") {
                router.push(routes.myStoriesDrafts);
              } else {
                router.push(routes.story(newStoryId));
              }
            }
          } else {
            showToast({
              type: "error",
              message: "Failed to create story. Please try again.",
            });
          }
        }
      } catch (error: any) {
        console.error("Failed to save story:", error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "An error occurred while saving the story";
        throw new Error(errorMessage);
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
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
      createdStoryId,
      updateError,
      router,
    ],
  );

  // Handle cancel action
  const handleCancel = useCallback(() => {
    if (mode === "edit") {
      router.push(routes.myStories);
    } else {
      router.push(routes.write);
    }
  }, [mode, router, routes]);

  // Determine page title and back link
  const pageTitle = mode === "edit" ? "Edit Story" : "New Story";
  const backLink = mode === "edit" ? routes.myStories : routes.write;

  return {
    initialData,
    initialChapters,
    initialParts,
    createdStoryId,
    isCreating,
    isSubmitting,
    isUpdating,
    isFetchingStory,
    handleSubmit,
    handleCancel,
    pageTitle,
    backLink,
    handleBack,
    // Return all form state
    ...formState,
  };
}
