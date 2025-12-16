import useSWR from "swr";
import { useEffect } from "react";
import { usersControllerGetProfile } from "../client/sdk.gen";
import { useUserStore, type UserProfile } from "../stores/useUserStore";
import { useAuthStore } from "../stores/useAuthStore";

export function useUserProfile() {
  const { isAuthenticated } = useAuthStore();
  const { setUser } = useUserStore();
  const isLoggedIn = isAuthenticated();

  const { data, error, isLoading, mutate } = useSWR(
    isLoggedIn ? "profile" : null,
    async () => {
      const response = await usersControllerGetProfile();
      if (response.error) {
        throw response.error;
      }
      // Unwrap nested payload: { data: { user: {...} } }
      const payload = response?.data as any;
      const user =  payload?.data?.user ?? payload?.user ;
      console.log("useUserProfile: unwrapped user:", user);
      return user as UserProfile;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  // Sync SWR data with Zustand store
  useEffect(() => {
    if (data) {
      console.log("useUserProfile: setting store user:", data);
      setUser(data);
    }
  }, [data, setUser]);

  // Clear user store on error (e.g. 401)
  useEffect(() => {
    if (error) {
      // Optional: Check if error is 401 and logout?
      // For now, just keeping the store in sync might be enough,
      // but usually we don't clear the user immediately on a transient error.
      // However, if we get a 401, useAuth handles logout usually.
    }
  }, [error]);

  return {
    user: data,
    isLoading,
    error,
    mutate,
  };
}
