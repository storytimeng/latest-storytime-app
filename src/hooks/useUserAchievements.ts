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

// Helper to transform certificate IDs into display objects
const transformCertificate = (certId: string): Certificate => {
  // Parse certificate ID like "1_stories_written"
  const parts = certId.split('_');
  const count = parts[0];
  const achievement = parts.slice(1).join(' ');
  
  return {
    id: certId,
    name: `${count} ${achievement.replace(/_/g, ' ')}`.replace(/\b\w/g, l => l.toUpperCase()),
    description: `Awarded for ${achievement.replace(/_/g, ' ')}`,
    issuedAt: new Date().toISOString(), // API doesn't provide this yet
    type: 'achievement'
  };
};

// Helper to transform badge IDs into display objects
const transformBadge = (badgeId: string): Badge => {
  return {
    id: badgeId,
    name: badgeId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    icon: '⭐',
    earnedAt: new Date().toISOString(),
    category: 'general'
  };
};

/**
 * Hook to fetch user badges and certificates
 */
export function useUserAchievements() {
  const { data, error, isLoading, mutate } = useSWR(
    "/users/achievements",
    async () => {
      const response = await usersControllerGetShareableAchievements();
      // Extract from nested structure: response.data.data.shareableData
      const result = (response?.data as any)?.data?.shareableData || (response?.data as any)?.data || response?.data;
      
      console.log("✅ User achievements fetched:", result);
      
      // Transform string arrays into proper objects
      const badges: Badge[] = (result?.badges || []).map(transformBadge);
      const certificates: Certificate[] = (result?.certificates || []).map(transformCertificate);
      
      return {
        badges,
        certificates,
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
