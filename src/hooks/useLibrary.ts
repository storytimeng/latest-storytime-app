import useSWR from "swr";
import { storiesControllerGetMyLibrary } from "@/src/client";
import { useAuthStore } from "@/src/stores/useAuthStore";

export function useLibrary() {
  // Subscribe to `token` (not the isAuthenticated function) so the component
  // re-renders when hydrateAuthFromCookies() sets the token after first render.
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data, error, isLoading, mutate } = useSWR(
    token || isAuthenticated() ? "/stories/my-library" : null,
    async () => {
      const response = await storiesControllerGetMyLibrary();
      const result = (response?.data as any)?.data || response?.data;

      console.log("✅ Library fetched successfully:", result);
      return result;
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    stories: data?.stories || [],
    isLoading,
    error,
    mutate,
  };
}
