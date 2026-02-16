import { useState, useCallback } from "react";
import { storiesControllerUpdateChapter } from "@/src/client";
import { showToast } from "@/lib/showNotification";

interface UpdateChapterPayload {
  title?: string;
  content?: string;
  chapterNumber?: number;
}

interface UseUpdateChapterReturn {
  updateChapter: (
    chapterId: string,
    payload: UpdateChapterPayload
  ) => Promise<boolean>;
  isUpdating: boolean;
  error: Error | null;
}

/**
 * Hook for updating a single chapter
 */
export function useUpdateChapter(): UseUpdateChapterReturn {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateChapter = useCallback(
    async (chapterId: string, payload: UpdateChapterPayload): Promise<boolean> => {
      setIsUpdating(true);
      setError(null);

      try {
        const response = await storiesControllerUpdateChapter({
          path: { chapterId },
          body: payload,
        });

        if (response.data) {
          console.log(`[useUpdateChapter] Chapter ${chapterId} updated successfully`);
          return true;
        }

        return false;
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to update chapter";
        console.error(`[useUpdateChapter] Error updating chapter ${chapterId}:`, err);
        setError(new Error(errorMessage));
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return {
    updateChapter,
    isUpdating,
    error,
  };
}

/**
 * Hook for updating multiple chapters
 */
export function useUpdateMultipleChapters() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateMultipleChapters = useCallback(
    async (
      chapters: Array<{ uuid: string; title?: string; body?: string }>
    ): Promise<{ success: boolean; updated: number; failed: number }> => {
      setIsUpdating(true);
      setError(null);

      let updated = 0;
      let failed = 0;

      try {
        // Update each chapter sequentially to avoid overwhelming the API
        for (const chapter of chapters) {
          try {
            const payload: UpdateChapterPayload = {};
            if (chapter.title !== undefined) payload.title = chapter.title;
            if (chapter.body !== undefined) payload.content = chapter.body;

            const response = await storiesControllerUpdateChapter({
              path: { chapterId: chapter.uuid },
              body: payload,
            });

            if (response.data) {
              updated++;
              console.log(`[useUpdateMultipleChapters] Chapter ${chapter.uuid} updated`);
            } else {
              failed++;
            }
          } catch (chapterError) {
            console.error(`[useUpdateMultipleChapters] Failed to update chapter ${chapter.uuid}:`, chapterError);
            failed++;
          }
        }

        return { success: failed === 0, updated, failed };
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to update chapters";
        console.error("[useUpdateMultipleChapters] Error:", err);
        setError(new Error(errorMessage));
        return { success: false, updated, failed: chapters.length - updated };
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return {
    updateMultipleChapters,
    isUpdating,
    error,
  };
}
