import useSWR from "swr";
import { storiesControllerGetMyLibrary } from "@/src/client/sdk.gen";
import { useAuthStore } from "@/src/stores/useAuthStore";

interface Story {
  id: string;
  title: string;
  description?: string;
  genres?: string[];
  storyStatus?: string;
  likeCount?: number;
  commentCount?: number;
  chapter?: boolean;
  episodes?: boolean;
  author?: {
    id?: string | null;
  };
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Hook to fetch stories by the current user (author)
 * Uses the /library endpoint which already filters by current user
 */
export function useUserStories() {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data, error, isLoading, mutate } = useSWR(
    token || isAuthenticated() ? "/stories/my-library" : null,
    async () => {
      const response = await storiesControllerGetMyLibrary();
      const result = (response?.data as any)?.data || response?.data;

      console.log("✅ User stories fetched successfully:", result);
      return result?.stories || [];
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    stories: (data || []) as Story[],
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to get user statistics
 */
export function useUserStats() {
  const { stories, isLoading } = useUserStories();

  const stats = {
    totalStories: stories.length,
    publishedStories: stories.filter((s) => s.storyStatus === "Published").length,
    draftStories: stories.filter((s) => s.storyStatus === "Draft").length,
    totalLikes: stories.reduce((sum, s) => sum + (s.likeCount || 0), 0),
    totalComments: stories.reduce((sum, s) => sum + (s.commentCount || 0), 0),
  };

  return {
    stats,
    isLoading,
  };
}
