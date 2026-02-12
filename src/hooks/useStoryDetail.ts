import React from "react";
import useSWR from "swr";
import {
  storiesControllerFindOne,
  storiesControllerGetStoryLikeCount,
  storiesControllerCheckUserLike,
  storiesControllerLikeStory,
  storiesControllerUnlikeStory,
  storiesControllerGetStoryComments,
  storiesControllerGetStoryCommentCount,
  storiesControllerCreateComment,
  storiesControllerGetChapterComments,
  storiesControllerCreateChapterComment,
  storiesControllerGetEpisodeComments,
  storiesControllerCreateEpisodeComment,
  storiesControllerUpdateComment,
  storiesControllerDeleteComment,
  storiesControllerUpdateChapterComment,
  storiesControllerDeleteChapterComment,
  storiesControllerUpdateEpisodeComment,
  storiesControllerDeleteEpisodeComment,
  storiesControllerGetChapterById,
  storiesControllerGetEpisodeById,
  storiesControllerGetStoryChapters,
  storiesControllerGetStoryEpisodes,
  usersControllerGetReadingProgress,
  usersControllerUpdateReadingProgress,
  usersControllerGetChapterProgress,
  usersControllerUpdateChapterProgress,
  usersControllerGetEpisodeProgress,
  usersControllerUpdateEpisodeProgress,
  usersControllerGetAggregatedStoryProgress,
  usersControllerMarkStoryAsRead,
} from "@/src/client";

// Helper to unwrap API response
const unwrap = (response: any) => {
  if (
    response &&
    typeof response.data === "object" &&
    response.data !== null &&
    "data" in response.data
  ) {
    return (response.data as any).data;
  }
  return response.data;
};

// Hook to fetch a single story by ID
export function useStory(storyId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    storyId ? `/stories/${storyId}` : null,
    async () => {
      if (!storyId) return null;
      const response = await storiesControllerFindOne({
        path: { id: storyId },
      });
      return unwrap(response);
    },
    {
      revalidateOnFocus: false,
    },
  );

  return {
    story: data,
    isLoading,
    error,
    mutate,
  };
}

// Hook to manage story likes
export function useStoryLikes(storyId: string | undefined) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [isLiking, setIsLiking] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(0);

  // Fetch like count
  const { data: likeCountData, mutate: mutateLikeCount } = useSWR(
    storyId ? `/stories/${storyId}/likes/count` : null,
    async () => {
      if (!storyId) return null;
      const response = await storiesControllerGetStoryLikeCount({
        path: { id: storyId },
      });
      return unwrap(response);
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  // Check if user has liked
  const { data: userLikeData, mutate: mutateUserLike } = useSWR(
    storyId ? `/stories/${storyId}/likes/check` : null,
    async () => {
      if (!storyId) return null;
      try {
        const response = await storiesControllerCheckUserLike({
          path: { id: storyId },
        });
        return unwrap(response);
      } catch (error) {
        // User not authenticated or hasn't liked
        return { hasLiked: false };
      }
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  // Sync liked state when data loads
  React.useEffect(() => {
    if (userLikeData !== undefined) {
      setIsLiked((userLikeData as any)?.hasLiked || false);
    }
  }, [userLikeData]);

  // Sync like count when data loads
  React.useEffect(() => {
    if (likeCountData !== undefined) {
      setLikeCount((likeCountData as any)?.count || 0);
    }
  }, [likeCountData]);

  const toggleLike = async () => {
    if (!storyId || isLiking) return; // Prevent spam clicking

    // Save current state for potential rollback
    const previousLiked = isLiked;
    const previousCount = likeCount;
    const targetState = !isLiked; // What we're trying to achieve

    // Optimistic update
    setIsLiking(true);
    setIsLiked(targetState);
    setLikeCount((prev) => (targetState ? prev + 1 : prev - 1));

    try {
      if (targetState) {
        // User wants to like
        await storiesControllerLikeStory({ path: { id: storyId } });
      } else {
        // User wants to unlike
        await storiesControllerUnlikeStory({ path: { id: storyId } });
      }

      // Revalidate to get accurate counts from server
      await Promise.all([mutateLikeCount(), mutateUserLike()]);
    } catch (error: any) {
      console.error("Failed to toggle like:", error);

      // Check if error is due to already being in desired state
      const errorMessage = error?.message || error?.toString() || "";
      const isAlreadyInDesiredState =
        errorMessage.toLowerCase().includes("already liked") ||
        errorMessage.toLowerCase().includes("already unliked") ||
        errorMessage.toLowerCase().includes("duplicate") ||
        error?.response?.status === 409; // Conflict status

      if (isAlreadyInDesiredState) {
        // Don't rollback - just sync with server to be sure
        try {
          await Promise.all([mutateLikeCount(), mutateUserLike()]);
        } catch (syncError) {
          console.error("Failed to sync like state:", syncError);
        }
      } else {
        // Real error - rollback optimistic update
        setIsLiked(previousLiked);
        setLikeCount(previousCount);
      }
    } finally {
      setIsLiking(false);
    }
  };

  return {
    likeCount,
    isLiked,
    isLiking,
    toggleLike,
  };
}

// Hook to fetch and manage story comments
export function useStoryComments(storyId: string | undefined) {
  const {
    data: commentsData,
    error,
    isLoading,
    mutate,
  } = useSWR(storyId ? `/stories/${storyId}/comments` : null, async () => {
    if (!storyId) return null;
    const response = await storiesControllerGetStoryComments({
      path: { id: storyId },
    });
    return unwrap(response);
  });

  const { data: commentCountData, mutate: mutateCommentCount } = useSWR(
    storyId ? `/stories/${storyId}/comments/count` : null,
    async () => {
      if (!storyId) return null;
      const response = await storiesControllerGetStoryCommentCount({
        path: { id: storyId },
      });
      return unwrap(response);
    },
  );

  const createComment = async (content: string, parentCommentId?: string) => {
    if (!storyId || !content.trim()) return;

    try {
      const response = await storiesControllerCreateComment({
        body: {
          storyId,
          content: content.trim(),
          parentCommentId,
        },
      });

      // Revalidate comments and count
      await Promise.all([mutate(), mutateCommentCount()]);

      // Return the new comment data
      return (response.data as any)?.data || response.data;
    } catch (error) {
      console.error("Failed to create comment:", error);
      throw error;
    }
  };

  const updateComment = async (id: string, content: string) => {
    if (!content.trim()) return;
    try {
      await storiesControllerUpdateComment({
        path: { id },
        body: { content: content.trim() },
      });
      await mutate();
    } catch (error) {
      console.error("Failed to update comment:", error);
      throw error;
    }
  };

  const deleteComment = async (id: string) => {
    try {
      await storiesControllerDeleteComment({
        path: { id },
      });
      await Promise.all([mutate(), mutateCommentCount()]);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      throw error;
    }
  };

  return {
    comments: Array.isArray(commentsData) ? commentsData : [],
    commentCount: (commentCountData as any)?.count || 0,
    isLoading,
    error,
    mutate,
    createComment,
    updateComment,
    deleteComment,
  };
}

// Hook to fetch story chapters
export function useStoryChapters(storyId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    storyId ? `/stories/${storyId}/chapters` : null,
    async () => {
      if (!storyId) return null;
      const response = await storiesControllerGetStoryChapters({
        path: { id: storyId },
      });
      return unwrap(response);
    },
  );

  return {
    chapters: (data as any) || [],
    isLoading,
    error,
  };
}

// Hook to fetch story episodes
export function useStoryEpisodes(storyId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    storyId ? `/stories/${storyId}/episodes` : null,
    async () => {
      if (!storyId) return null;
      const response = await storiesControllerGetStoryEpisodes({
        path: { id: storyId },
      });
      return unwrap(response);
    },
  );

  return {
    episodes: (data as any) || [],
    isLoading,
    error,
  };
}

// Hook to fetch a single chapter by ID
export function useChapter(chapterId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    chapterId ? `/stories/chapters/${chapterId}` : null,
    async () => {
      if (!chapterId) return null;
      const response = await storiesControllerGetChapterById({
        path: { chapterId },
      });
      return unwrap(response);
    },
  );

  return {
    chapter: data,
    comments: (data as any)?.comments || [],
    isLoading,
    error,
    mutate,
  };
}

// Hook to fetch a single episode by ID
export function useEpisode(episodeId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    episodeId ? `/stories/episodes/${episodeId}` : null,
    async () => {
      if (!episodeId) return null;
      const response = await storiesControllerGetEpisodeById({
        path: { episodeId },
      });
      return unwrap(response);
    },
  );

  return {
    episode: data,
    comments: (data as any)?.comments || [],
    isLoading,
    error,
    mutate,
  };
}

// Hook to fetch and manage chapter comments
export function useChapterComments(chapterId: string | undefined) {
  const {
    data: commentsData,
    error,
    isLoading,
    mutate,
  } = useSWR(
    chapterId ? `/stories/chapters/${chapterId}/comments` : null,
    async () => {
      if (!chapterId) return null;
      const response = await storiesControllerGetChapterComments({
        path: { chapterId },
      });
      return unwrap(response);
    },
  );

  const createComment = async (content: string, parentCommentId?: string) => {
    if (!chapterId || !content.trim()) return;

    try {
      const response = await storiesControllerCreateChapterComment({
        path: { chapterId },
        body: { content, parentCommentId } as any,
      });

      // Revalidate comments
      await mutate();

      // Return the new comment data
      return (response.data as any)?.data || response.data;
    } catch (error) {
      console.error("Failed to create chapter comment:", error);
      throw error;
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    if (!content.trim()) return;
    try {
      await storiesControllerUpdateChapterComment({
        path: { commentId },
        body: { content: content.trim() } as any,
      });
      await mutate();
    } catch (error) {
      console.error("Failed to update chapter comment:", error);
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await storiesControllerDeleteChapterComment({
        path: { commentId },
      });
      await mutate();
    } catch (error) {
      console.error("Failed to delete chapter comment:", error);
      throw error;
    }
  };

  return {
    comments: Array.isArray(commentsData) ? commentsData : [],
    isLoading,
    error,
    mutate,
    createComment,
    updateComment,
    deleteComment,
  };
}

// Hook to fetch and manage episode comments
export function useEpisodeComments(episodeId: string | undefined) {
  const {
    data: commentsData,
    error,
    isLoading,
    mutate,
  } = useSWR(
    episodeId ? `/stories/episodes/${episodeId}/comments` : null,
    async () => {
      if (!episodeId) return null;
      const response = await storiesControllerGetEpisodeComments({
        path: { episodeId },
      });
      return unwrap(response);
    },
  );

  const createComment = async (content: string, parentCommentId?: string) => {
    if (!episodeId || !content.trim()) return;

    try {
      const response = await storiesControllerCreateEpisodeComment({
        path: { episodeId },
        body: { content, parentCommentId } as any,
      });

      await mutate();

      // Return the new comment data
      return (response.data as any)?.data || response.data;
    } catch (error) {
      console.error("Failed to create episode comment:", error);
      throw error;
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    if (!content.trim()) return;
    try {
      await storiesControllerUpdateEpisodeComment({
        path: { commentId },
        body: { content: content.trim() } as any,
      });
      await mutate();
    } catch (error) {
      console.error("Failed to update episode comment:", error);
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await storiesControllerDeleteEpisodeComment({
        path: { commentId },
      });
      await mutate();
    } catch (error) {
      console.error("Failed to delete episode comment:", error);
      throw error;
    }
  };

  return {
    comments: Array.isArray(commentsData) ? commentsData : [],
    isLoading,
    error,
    mutate,
    createComment,
    updateComment,
    deleteComment,
  };
}

// Hook to get and update reading progress for a story
export function useReadingProgress(storyId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    storyId ? `/users/stories/${storyId}/progress` : null,
    async () => {
      if (!storyId) return null;
      try {
        const response = await usersControllerGetReadingProgress({
          path: { id: storyId },
        });
        if (
          response &&
          typeof response.data === "object" &&
          response.data !== null
        ) {
          // Extract progress from nested data.progress
          const progressData = (response.data as any).progress || response.data;
          // Convert percentageRead from string to number if needed
          if (
            progressData.percentageRead &&
            typeof progressData.percentageRead === "string"
          ) {
            progressData.percentageRead = parseFloat(
              progressData.percentageRead,
            );
          }
          return progressData;
        }
        return null;
      } catch (error) {
        // Return null for 404 errors (no progress yet)
        return null;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 600000, // Refetch every 10 minutes
    },
  );

  const updateProgress = async (progressData: {
    percentageRead?: number;
    wordsRead?: number;
    totalWords?: number;
    lastReadChapter?: number;
    lastReadEpisode?: number;
    readingTimeSeconds?: number;
  }) => {
    if (!storyId) return;

    try {
      const response = await usersControllerUpdateReadingProgress({
        path: { id: storyId },
        body: progressData,
      });

      // Optimistically update local cache
      await mutate();

      return response.data;
    } catch (error) {
      console.error("Failed to update reading progress:", error);
      throw error;
    }
  };

  return {
    progress: data,
    isLoading,
    error,
    mutate,
    updateProgress,
  };
}

// Hook to get and update reading progress for a chapter
export function useChapterProgress(
  storyId: string | undefined,
  chapterId: string | undefined,
) {
  const { data, error, isLoading, mutate } = useSWR(
    storyId && chapterId
      ? `/users/stories/${storyId}/chapters/${chapterId}/progress`
      : null,
    async () => {
      if (!storyId || !chapterId) return null;
      try {
        const response = await usersControllerGetChapterProgress({
          path: { storyId, chapterId },
        });
        if (
          response &&
          typeof response.data === "object" &&
          response.data !== null
        ) {
          // Extract progress from nested data.progress
          const progressData = (response.data as any).progress || response.data;
          // Convert percentageRead from string to number if needed
          if (
            progressData.percentageRead &&
            typeof progressData.percentageRead === "string"
          ) {
            progressData.percentageRead = parseFloat(
              progressData.percentageRead,
            );
          }
          return progressData;
        }
        return null;
      } catch (error) {
        return null;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 600000, // Refetch every 10 minutes
    },
  );

  const updateProgress = async (progressData: {
    percentageRead?: number;
    wordsRead?: number;
    totalWords?: number;
    readingTimeSeconds?: number;
  }) => {
    if (!storyId || !chapterId) return;

    try {
      const response = await usersControllerUpdateChapterProgress({
        path: { storyId, chapterId },
        body: progressData,
      });

      await mutate();
      return response.data;
    } catch (error) {
      console.error("Failed to update chapter progress:", error);
      throw error;
    }
  };

  return {
    progress: data,
    isLoading,
    error,
    mutate,
    updateProgress,
  };
}

// Hook to get and update reading progress for an episode
export function useEpisodeProgress(
  storyId: string | undefined,
  episodeId: string | undefined,
) {
  const { data, error, isLoading, mutate } = useSWR(
    storyId && episodeId
      ? `/users/stories/${storyId}/episodes/${episodeId}/progress`
      : null,
    async () => {
      if (!storyId || !episodeId) return null;
      try {
        const response = await usersControllerGetEpisodeProgress({
          path: { storyId, episodeId },
        });
        if (
          response &&
          typeof response.data === "object" &&
          response.data !== null
        ) {
          // Extract progress from nested data.progress
          const progressData = (response.data as any).progress || response.data;
          // Convert percentageRead from string to number if needed
          if (
            progressData.percentageRead &&
            typeof progressData.percentageRead === "string"
          ) {
            progressData.percentageRead = parseFloat(
              progressData.percentageRead,
            );
          }
          return progressData;
        }
        return null;
      } catch (error) {
        return null;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 600000, // Refetch every 10 minutes
    },
  );

  const updateProgress = async (progressData: {
    percentageRead?: number;
    wordsRead?: number;
    totalWords?: number;
    readingTimeSeconds?: number;
  }) => {
    if (!storyId || !episodeId) return;

    try {
      const response = await usersControllerUpdateEpisodeProgress({
        path: { storyId, episodeId },
        body: progressData,
      });

      await mutate();
      return response.data;
    } catch (error) {
      console.error("Failed to update episode progress:", error);
      throw error;
    }
  };

  return {
    progress: data,
    isLoading,
    error,
    mutate,
    updateProgress,
  };
}

// Hook to get aggregated reading progress for a story (all chapters/episodes)
export function useAggregatedProgress(storyId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    storyId ? `/users/stories/${storyId}/reading-progress` : null,
    async () => {
      if (!storyId) return null;
      try {
        const response = await usersControllerGetAggregatedStoryProgress({
          path: { id: storyId },
        });
        if (
          response &&
          typeof response.data === "object" &&
          response.data !== null
        ) {
          // Unwrap the data property if it exists (standard API envelope)
          const responseData = (response.data as any).data || response.data;

          const data = responseData as any;
          // Convert percentageRead strings to numbers in storyProgress
          if (
            data.storyProgress?.percentageRead &&
            typeof data.storyProgress.percentageRead === "string"
          ) {
            data.storyProgress.percentageRead = parseFloat(
              data.storyProgress.percentageRead,
            );
          }
          // Convert percentageRead in episode/chapter progress arrays
          data.episodeProgress?.forEach((ep: any) => {
            if (ep.percentageRead && typeof ep.percentageRead === "string") {
              ep.percentageRead = parseFloat(ep.percentageRead);
            }
          });
          data.chapterProgress?.forEach((ch: any) => {
            if (ch.percentageRead && typeof ch.percentageRead === "string") {
              ch.percentageRead = parseFloat(ch.percentageRead);
            }
          });
          return data;
        }
        return null;
      } catch (error) {
        return null;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 600000, // Refetch every 10 minutes
    },
  );

  return {
    aggregatedData: data,
    isLoading,
    error,
    mutate,
  };
}
// Hook to mark a story as read
export function useMarkStoryAsRead() {
  const markAsRead = async (storyId: string) => {
    if (!storyId) return;
    try {
      const response = await usersControllerMarkStoryAsRead({
        path: { id: storyId },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to mark story as read:", error);
      // We don't throw here to avoid disrupting the UI for a background tracking task
    }
  };

  return {
    markAsRead,
  };
}
