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

  const toggleLike = async () => {
    if (!storyId || isLiking) return;

    setIsLiking(true);
    const previousLiked = isLiked;

    // Optimistic update
    setIsLiked(!isLiked);

    try {
      if (isLiked) {
        await storiesControllerUnlikeStory({
          path: { id: storyId },
        });
      } else {
        await storiesControllerLikeStory({
          path: { id: storyId },
        });
      }

      // Revalidate data
      await Promise.all([mutateLikeCount(), mutateUserLike()]);
    } catch (error) {
      // Revert on error
      setIsLiked(previousLiked);
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  return {
    likeCount: (likeCountData as any)?.count || 0,
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

  const createComment = async (content: string) => {
    if (!storyId || !content.trim()) return;

    try {
      await storiesControllerCreateComment({
        body: {
          storyId,
          content: content.trim(),
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
      const { storiesControllerGetStoryChapters } = await import(
        "@/src/client"
      );
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
      const { storiesControllerGetStoryEpisodes } = await import(
        "@/src/client"
      );
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
