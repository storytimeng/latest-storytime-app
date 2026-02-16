import { useState, useCallback } from "react";
import { storiesControllerUpdateEpisode } from "@/src/client";
import { showToast } from "@/lib/showNotification";

interface UpdateEpisodePayload {
  title?: string;
  content?: string;
  episodeNumber?: number;
}

interface UseUpdateEpisodeReturn {
  updateEpisode: (
    episodeId: string,
    payload: UpdateEpisodePayload,
  ) => Promise<boolean>;
  isUpdating: boolean;
  error: Error | null;
}

/**
 * Hook for updating a single episode
 */
export function useUpdateEpisode(): UseUpdateEpisodeReturn {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateEpisode = useCallback(
    async (
      episodeId: string,
      payload: UpdateEpisodePayload,
    ): Promise<boolean> => {
      setIsUpdating(true);
      setError(null);

      try {
        const response = await storiesControllerUpdateEpisode({
          path: { episodeId },
          body: payload,
        });

        if (response.data) {
          console.log(
            `[useUpdateEpisode] Episode ${episodeId} updated successfully`,
          );
          return true;
        }

        return false;
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to update episode";
        console.error(
          `[useUpdateEpisode] Error updating episode ${episodeId}:`,
          err,
        );
        setError(new Error(errorMessage));
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [],
  );

  return {
    updateEpisode,
    isUpdating,
    error,
  };
}

/**
 * Hook for updating multiple episodes
 */
export function useUpdateMultipleEpisodes() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateMultipleEpisodes = useCallback(
    async (
      episodes: Array<{
        uuid: string;
        title?: string;
        body?: string;
        episodeNumber?: number;
      }>,
    ): Promise<{ success: boolean; updated: number; failed: number }> => {
      setIsUpdating(true);
      setError(null);

      let updated = 0;
      let failed = 0;

      try {
        // Update each episode sequentially to avoid overwhelming the API
        for (const episode of episodes) {
          try {
            const payload: UpdateEpisodePayload = {};
            if (episode.title !== undefined) payload.title = episode.title;
            if (episode.body !== undefined) payload.content = episode.body;
            if (episode.episodeNumber !== undefined)
              payload.episodeNumber = episode.episodeNumber;

            const response = await storiesControllerUpdateEpisode({
              path: { episodeId: episode.uuid },
              body: payload,
            });

            if (response.data) {
              updated++;
              console.log(
                `[useUpdateMultipleEpisodes] Episode ${episode.uuid} updated`,
              );
            } else {
              failed++;
            }
          } catch (episodeError) {
            console.error(
              `[useUpdateMultipleEpisodes] Failed to update episode ${episode.uuid}:`,
              episodeError,
            );
            failed++;
          }
        }

        return { success: failed === 0, updated, failed };
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to update episodes";
        console.error("[useUpdateMultipleEpisodes] Error:", err);
        setError(new Error(errorMessage));
        return { success: false, updated, failed: episodes.length - updated };
      } finally {
        setIsUpdating(false);
      }
    },
    [],
  );

  return {
    updateMultipleEpisodes,
    isUpdating,
    error,
  };
}
