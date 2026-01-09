import useSWR from "swr";
import { usersControllerGetShareableAchievements } from "@/src/client/sdk.gen";

interface Badge {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  earnedAt?: string;
  category?: string;
  imageUrl?: string;
}

interface Certificate {
  id: string;
  name: string;
  description?: string;
  issuedAt?: string;
  type?: string;
  imageUrl?: string;
}

interface Achievements {
  badges: Badge[];
  certificates: Certificate[];
}

// Helper to transform certificate IDs into display objects
const transformCertificate = (certId: string, url?: string): Certificate => {
  // Clean IDs like "{1_stories_written" or "20_stories_read}"
  const cleanId = certId.replace(/[{}]/g, '');
  const parts = cleanId.split('_');
  const count = parts[0];
  const achievement = parts.slice(1).join(' ');
  
  return {
    id: cleanId,
    name: `${count} ${achievement.replace(/_/g, ' ')}`.replace(/\b\w/g, l => l.toUpperCase()),
    description: `Awarded for ${achievement.replace(/_/g, ' ')}`,
    issuedAt: new Date().toISOString(),
    type: 'achievement',
    imageUrl: url
  };
};

// Helper to transform badge IDs into display objects
const transformBadge = (badgeId: string, url?: string): Badge => {
  // Clean IDs like "{1_stories_read" or "20_stories_read}"
  const cleanId = badgeId.replace(/[{}]/g, '');
  return {
    id: cleanId,
    name: cleanId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    icon: '⭐',
    earnedAt: new Date().toISOString(),
    category: 'general',
    imageUrl: url
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
      const result = (response?.data as any)?.data?.shareableData || (response?.data as any)?.data || response?.data;
      
      console.log("✅ User achievements fetched:", result);
      
      const badgeIds = result?.badges || [];
      const badgeUrls = result?.badgeUrls || [];
      const certIds = result?.certificates || [];
      const certUrls = result?.certificateUrls || [];

      // Transform arrays into proper objects with URLs
      const badges: Badge[] = badgeIds.map((id: string, index: number) => 
        transformBadge(id, badgeUrls[index])
      );
      
      const certificates: Certificate[] = certIds.map((id: string, index: number) => 
        transformCertificate(id, certUrls[index])
      );
      
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
