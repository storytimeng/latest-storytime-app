import useSWR from "swr";
import { usersControllerGetShareableAchievements } from "@/src/client/sdk.gen";

interface Badge {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  earnedAt?: string;
  category?: string;
}

interface Certificate {
  id: string;
  name: string;
  description?: string;
  issuedAt?: string;
  type?: string;
}

interface Achievements {
  badges: Badge[];
  certificates: Certificate[];
}

/**
 * Hook to fetch user badges and certificates
 */
export function useUserAchievements() {
  const { data, error, isLoading, mutate } = useSWR(
    "/users/achievements",
    async () => {
      const response = await usersControllerGetShareableAchievements();
      const result = (response?.data as any)?.data || response?.data;
      
      console.log("✅ User achievements fetched:", result);
      
      // Handle different response structures
      return {
        badges: result?.badges || [],
        certificates: result?.certificates || [],
      } as Achievements;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    badges: data?.badges || [],
    certificates: data?.certificates || [],
    isLoading,
    error,
    mutate,
  };
}
