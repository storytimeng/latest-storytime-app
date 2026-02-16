import { useState, useCallback } from "react";
import { storiesControllerSoftDeleteChapter } from "@/src/client";

interface UseDeleteChapterReturn {
  deleteChapter: (chapterId: string) => Promise<boolean>;
  isDeleting: boolean;
  error: Error | null;
}

/**
 * Hook for deleting a single chapter
 */
export function useDeleteChapter(): UseDeleteChapterReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteChapter = useCallback(
    async (chapterId: string): Promise<boolean> => {
      setIsDeleting(true);
      setError(null);

      try {
        const response = await storiesControllerSoftDeleteChapter({
          path: { chapterId },
        });

        if (response.data) {
          console.log(
            `[useDeleteChapter] Chapter ${chapterId} deleted successfully`,
          );
          return true;
        }

        return false;
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to delete chapter";
        console.error(
          `[useDeleteChapter] Error deleting chapter ${chapterId}:`,
          err,
        );
        setError(new Error(errorMessage));
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [],
  );

  return {
    deleteChapter,
    isDeleting,
    error,
  };
}

/**
 * Hook for deleting multiple chapters
 */
export function useDeleteMultipleChapters() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteMultipleChapters = useCallback(
    async (
      chapterUuids: string[],
    ): Promise<{ success: boolean; deleted: number; failed: number }> => {
      setIsDeleting(true);
      setError(null);

      let deleted = 0;
      let failed = 0;

      try {
        // Delete each chapter sequentially to avoid overwhelming the API
        for (const uuid of chapterUuids) {
          try {
            const response = await storiesControllerSoftDeleteChapter({
              path: { chapterId: uuid },
            });

            if (response.data) {
              deleted++;
              console.log(
                `[useDeleteMultipleChapters] Chapter ${uuid} deleted`,
              );
            } else {
              failed++;
            }
          } catch (chapterError) {
            console.error(
              `[useDeleteMultipleChapters] Failed to delete chapter ${uuid}:`,
              chapterError,
            );
            failed++;
          }
        }

        setIsDeleting(false);

        return {
          success: failed === 0,
          deleted,
          failed,
        };
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to delete chapters";
        console.error("[useDeleteMultipleChapters] Error:", err);
        setError(new Error(errorMessage));
        setIsDeleting(false);

        return {
          success: false,
          deleted,
          failed: chapterUuids.length - deleted,
        };
      }
    },
    [],
  );

  return {
    deleteMultipleChapters,
    isDeleting,
    error,
  };
}
