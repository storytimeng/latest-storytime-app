import React from "react";
import {
  storiesControllerRemove,
  storiesControllerCreate,
  storiesControllerUpdate,
  storiesControllerFindOne,
  storiesControllerCreateChapter,
  storiesControllerCreateEpisode,
  storiesControllerCreateMultipleChapters,
  storiesControllerCreateMultipleEpisodes,
} from "@/src/client";
import type { CreateStoryDto, UpdateStoryDto } from "@/src/client/types.gen";

export function useDeleteStory() {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const deleteStory = async (storyId: string): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      await storiesControllerRemove({
        path: { id: storyId },
      });

      console.log("✅ Story deleted successfully:", storyId);
      return true;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete story");
      console.error("❌ Failed to delete story:", error);
      setError(error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteStory,
    isDeleting,
    error,
  };
}

export function useCreateStory() {
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const createStory = async (
    storyData: CreateStoryDto
  ): Promise<{ success: boolean; id?: string }> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await storiesControllerCreate({
        body: storyData,
      });

      const result = (response?.data as any)?.data || response?.data;
      console.log("✅ Story created successfully:", result);

      return {
        success: true,
        id: result?.id || result?._id,
      };
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to create story");
      console.error("❌ Failed to create story:", error);
      setError(error);
      return { success: false };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createStory,
    isCreating,
    error,
  };
}

export function useUpdateStory() {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const updateStory = async (
    storyId: string,
    storyData: UpdateStoryDto
  ): Promise<boolean> => {
    setIsUpdating(true);
    setError(null);

    try {
      await storiesControllerUpdate({
        path: { id: storyId },
        body: storyData,
      });

      console.log("✅ Story updated successfully:", storyId);
      return true;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to update story");
      console.error("❌ Failed to update story:", error);
      setError(error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateStory,
    isUpdating,
    error,
  };
}

export function useFetchStory(storyId: string | undefined) {
  const [story, setStory] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!storyId) return;

    const fetchStory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await storiesControllerFindOne({
          path: { id: storyId },
        });

        const result = (response?.data as any)?.data || response?.data;
        console.log("✅ Story fetched successfully:", result);
        setStory(result);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to fetch story");
        console.error("❌ Failed to fetch story:", error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  return {
    story,
    isLoading,
    error,
  };
}

export function useCreateChapter() {
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const createChapter = async (
    storyId: string,
    chapterData: any
  ): Promise<{ success: boolean; id?: string }> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await storiesControllerCreateChapter({
        body: {
          storyId,
          ...chapterData,
        },
      });

      const result = (response?.data as any)?.data || response?.data;
      console.log("✅ Chapter created successfully:", result);

      return {
        success: true,
        id: result?.id || result?._id,
      };
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to create chapter");
      console.error("❌ Failed to create chapter:", error);
      setError(error);
      return { success: false };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createChapter,
    isCreating,
    error,
  };
}

export function useCreateMultipleChapters() {
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const createMultipleChapters = async (
    storyId: string,
    chapters: any[]
  ): Promise<{ success: boolean; count?: number }> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await storiesControllerCreateMultipleChapters({
        body: {
          storyId,
          chapters: chapters.map((ch, index) => ({
            storyId,
            title: ch.title,
            content: ch.body || ch.content,
            chapterNumber: index + 1,
          })),
        },
      });

      const result = (response?.data as any)?.data || response?.data;
      console.log("✅ Multiple chapters created successfully:", result);

      return {
        success: true,
        count: chapters.length,
      };
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to create multiple chapters");
      console.error("❌ Failed to create multiple chapters:", error);
      setError(error);
      return { success: false };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createMultipleChapters,
    isCreating,
    error,
  };
}

export function useCreateEpisode() {
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const createEpisode = async (
    storyId: string,
    chapterId: string, // Kept for backward compatibility if needed, but might be unused for direct episodes
    episodeData: any
  ): Promise<{ success: boolean; id?: string }> => {
    setIsCreating(true);
    setError(null);

    try {
      // Check if we need chapterId or not based on previous findings
      // For now, passing what we have, but if episodes are direct children, chapterId might be ignored or optional
      const body: any = {
        storyId,
        ...episodeData,
      };
      if (chapterId) {
        body.chapterId = chapterId;
      }

      const response = await storiesControllerCreateEpisode({
        body,
      });

      const result = (response?.data as any)?.data || response?.data;
      console.log("✅ Episode created successfully:", result);

      return {
        success: true,
        id: result?.id || result?._id,
      };
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to create episode");
      console.error("❌ Failed to create episode:", error);
      setError(error);
      return { success: false };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createEpisode,
    isCreating,
    error,
  };
}

export function useCreateMultipleEpisodes() {
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const createMultipleEpisodes = async (
    storyId: string,
    episodes: any[]
  ): Promise<{ success: boolean; count?: number }> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await storiesControllerCreateMultipleEpisodes({
        body: {
          storyId,
          episodes: episodes.map((ep, index) => ({
            storyId,
            title: ep.title,
            content: ep.body || ep.content,
            episodeNumber: index + 1,
          })),
        },
      });

      const result = (response?.data as any)?.data || response?.data;
      console.log("✅ Multiple episodes created successfully:", result);

      return {
        success: true,
        count: episodes.length,
      };
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to create multiple episodes");
      console.error("❌ Failed to create multiple episodes:", error);
      setError(error);
      return { success: false };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createMultipleEpisodes,
    isCreating,
    error,
  };
}
