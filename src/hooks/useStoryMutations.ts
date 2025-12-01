import React from "react";
import {
  storiesControllerRemove,
  storiesControllerCreate,
  storiesControllerUpdate,
  storiesControllerFindOne,
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
