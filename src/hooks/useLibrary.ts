import useSWR from "swr";
import { storiesControllerGetMyLibrary } from "@/src/client";
import { useAuthStore } from "@/src/stores/useAuthStore";

export function useLibrary() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data, error, isLoading, mutate } = useSWR(
    isAuthenticated() ? "/stories/my-library" : null,
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
