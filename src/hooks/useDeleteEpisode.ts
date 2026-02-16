import { useState, useCallback } from "react";
import { storiesControllerSoftDeleteEpisode } from "@/src/client";

interface UseDeleteEpisodeReturn {
  deleteEpisode: (episodeId: string) => Promise<boolean>;
  isDeleting: boolean;
  error: Error | null;
}

/**
 * Hook for deleting a single episode
 */
export function useDeleteEpisode(): UseDeleteEpisodeReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteEpisode = useCallback(
    async (episodeId: string): Promise<boolean> => {
      setIsDeleting(true);
      setError(null);

      try {
        const response = await storiesControllerSoftDeleteEpisode({
          path: { episodeId },
        });

        if (response.data) {
          console.log(
            `[useDeleteEpisode] Episode ${episodeId} deleted successfully`,
          );
          return true;
        }

        return false;
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to delete episode";
        console.error(
          `[useDeleteEpisode] Error deleting episode ${episodeId}:`,
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
    deleteEpisode,
    isDeleting,
    error,
  };
}

/**
 * Hook for deleting multiple episodes
 */
export function useDeleteMultipleEpisodes() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteMultipleEpisodes = useCallback(
    async (
      episodeUuids: string[],
    ): Promise<{ success: boolean; deleted: number; failed: number }> => {
      setIsDeleting(true);
      setError(null);

      let deleted = 0;
      let failed = 0;

      try {
        // Delete each episode sequentially to avoid overwhelming the API
        for (const uuid of episodeUuids) {
          try {
            const response = await storiesControllerSoftDeleteEpisode({
              path: { episodeId: uuid },
            });

            if (response.data) {
              deleted++;
              console.log(
                `[useDeleteMultipleEpisodes] Episode ${uuid} deleted`,
              );
            } else {
              failed++;
            }
          } catch (episodeError) {
            console.error(
              `[useDeleteMultipleEpisodes] Failed to delete episode ${uuid}:`,
              episodeError,
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
        const errorMessage = err?.message || "Failed to delete episodes";
        console.error("[useDeleteMultipleEpisodes] Error:", err);
        setError(new Error(errorMessage));
        setIsDeleting(false);

        return {
          success: false,
          deleted,
          failed: episodeUuids.length - deleted,
        };
      }
    },
    [],
  );

  return {
    deleteMultipleEpisodes,
    isDeleting,
    error,
  };
}
