"use client";

import { useState, useEffect } from "react";
import { getDB, STORES, CachedProfile } from "@/lib/offline/db";
import { useOnlineStatus } from "./useOnlineStatus";

const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

/**
 * Hook to fetch and cache user profile with offline support
 */
export function useProfileCache(userId: string | null) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);

        // Try to get from cache first
        const db = await getDB();
        if (db) {
          const cached = await db.get(STORES.PROFILE, userId);

          // If we have cached data and it's not expired, use it (especially when offline)
          if (
            cached &&
            (!isOnline || Date.now() - cached.cachedAt < CACHE_DURATION)
          ) {
            setProfile(cached.profile);
            setIsLoading(false);
            return;
          }
        }

        // If online, try to fetch fresh data
        if (isOnline) {
          // Import the API call dynamically to avoid circular dependencies
          const { usersControllerGetProfile } = await import(
            "@/src/client/sdk.gen"
          );

          const response = await usersControllerGetProfile();

          if (!response.error && response.data) {
            const profileData = response.data;
            setProfile(profileData);

            // Cache the fresh data if db is available
            if (db) {
              const cacheEntry: CachedProfile = {
                id: userId,
                userId,
                profile: profileData,
                cachedAt: Date.now(),
                expiresAt: Date.now() + CACHE_DURATION,
              };
              await db.put(STORES.PROFILE, cacheEntry);
            }
          }
        } else {
          // Offline - check if we have cached data
          const db = await getDB();
          if (db) {
            const cached = await db.get(STORES.PROFILE, userId);
            if (cached) {
              setProfile(cached.profile);
            }
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, isOnline]);

  return { profile, isLoading, error, isOnline };
}
