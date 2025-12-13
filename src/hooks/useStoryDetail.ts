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
} from "@/src/client";

// Hook to fetch a single story by ID
export function useStory(storyId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    storyId ? `/stories/${storyId}` : null,
    async () => {
      if (!storyId) return null;
      const response = await storiesControllerFindOne({
        path: { id: storyId },
      });
      // Unwrap the actual story object from the response
      if (
        response &&
        typeof response.data === "object" &&
        response.data !== null &&
        "data" in response.data
      ) {
        return (response.data as any).data;
      }
      return response.data;
    },
    {
      revalidateOnFocus: false,
    }
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

  // Fetch like count
  const { data: likeCountData, mutate: mutateLikeCount } = useSWR(
    storyId ? `/stories/${storyId}/likes/count` : null,
    async () => {
      if (!storyId) return null;
      const response = await storiesControllerGetStoryLikeCount({
        path: { id: storyId },
      });
      return response.data;
    }
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
        return response.data;
      } catch (error) {
        // User not authenticated or hasn't liked
        return { hasLiked: false };
      }
    }
  );

  React.useEffect(() => {
    if (userLikeData) {
      setIsLiked((userLikeData as any)?.hasLiked || false);
    }
  }, [userLikeData]);

  const [likeCount, setLikeCount] = React.useState(0);

  React.useEffect(() => {
    if (likeCountData) {
      setLikeCount((likeCountData as any)?.count || 0);
    }
  }, [likeCountData]);

  const toggleLike = async () => {
    if (!storyId) return;

    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likeCount;
    
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      if (isLiked) {
        await storiesControllerUnlikeStory({ path: { id: storyId } });
      } else {
        await storiesControllerLikeStory({ path: { id: storyId } });
      }

      // Revalidate to get accurate counts
      await Promise.all([mutateLikeCount(), mutateUserLike()]);
    } catch (error) {
      // Rollback on error
      console.error("Failed to toggle like:", error);
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
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
    // Unwrap the data array from the response
    if (
      response &&
      typeof response.data === "object" &&
      response.data !== null &&
      "data" in response.data
    ) {
      return (response.data as any).data;
    }
    return response.data;
  });

  const { data: commentCountData, mutate: mutateCommentCount } = useSWR(
    storyId ? `/stories/${storyId}/comments/count` : null,
    async () => {
      if (!storyId) return null;
      const response = await storiesControllerGetStoryCommentCount({
        path: { id: storyId },
      });
      return response.data;
    }
  );

  const createComment = async (content: string, parentCommentId?: string) => {
    if (!storyId || !content.trim()) return;

    try {
      await storiesControllerCreateComment({
        body: {
          storyId,
          content: content.trim(),
          parentCommentId,
        },
      });

      // Revalidate comments and count
      await Promise.all([mutate(), mutateCommentCount()]);
    } catch (error) {
      console.error("Failed to create comment:", error);
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
      return response.data;
    }
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
      return response.data;
    }
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
      // Unwrap response if needed
      if (
        response &&
        typeof response.data === "object" &&
        response.data !== null &&
        "data" in response.data
      ) {
        return (response.data as any).data;
      }
      return response.data;
    }
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
      // Unwrap response if needed
      if (
        response &&
        typeof response.data === "object" &&
        response.data !== null &&
        "data" in response.data
      ) {
        return (response.data as any).data;
      }
      return response.data;
    }
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
      // Unwrap the data array from the response if needed
      if (
        response &&
        typeof response.data === "object" &&
        response.data !== null &&
        "data" in response.data
      ) {
        return (response.data as any).data;
      }
      return response.data;
    }
  );

  const createComment = async (content: string, parentCommentId?: string) => {
    if (!chapterId || !content.trim()) return;

    try {
      await storiesControllerCreateChapterComment({
        path: { chapterId },
        body: { content, parentCommentId } as any,
      });

      // Revalidate comments
      await mutate();
    } catch (error) {
      console.error("Failed to create chapter comment:", error);
      throw error;
    }
  };

  return {
    comments: Array.isArray(commentsData) ? commentsData : [],
    isLoading,
    error,
    mutate,
    createComment,
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
      if (
        response &&
        typeof response.data === "object" &&
        response.data !== null &&
        "data" in response.data
      ) {
        return (response.data as any).data;
      }
      return response.data;
    }
  );

  const createComment = async (content: string, parentCommentId?: string) => {
    if (!episodeId || !content.trim()) return;

    try {
      await storiesControllerCreateEpisodeComment({
        path: { episodeId },
        body: { content, parentCommentId } as any,
      });

      await mutate();
    } catch (error) {
      console.error("Failed to create episode comment:", error);
      throw error;
    }
  };

  return {
    comments: Array.isArray(commentsData) ? commentsData : [],
    isLoading,
    error,
    mutate,
    createComment,
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
          if (progressData.percentageRead && typeof progressData.percentageRead === "string") {
            progressData.percentageRead = parseFloat(progressData.percentageRead);
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
    }
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
  chapterId: string | undefined
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
          if (progressData.percentageRead && typeof progressData.percentageRead === "string") {
            progressData.percentageRead = parseFloat(progressData.percentageRead);
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
    }
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
  episodeId: string | undefined
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
          if (progressData.percentageRead && typeof progressData.percentageRead === "string") {
            progressData.percentageRead = parseFloat(progressData.percentageRead);
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
    }
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
          const data = response.data as any;
          // Convert percentageRead strings to numbers in storyProgress
          if (data.storyProgress?.percentageRead && typeof data.storyProgress.percentageRead === "string") {
            data.storyProgress.percentageRead = parseFloat(data.storyProgress.percentageRead);
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
    }
  );

  return {
    aggregatedData: data,
    isLoading,
    error,
    mutate,
  };
}
