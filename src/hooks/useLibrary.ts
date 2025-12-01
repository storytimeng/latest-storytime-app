import useSWR from "swr";
import { storiesControllerGetMyLibrary } from "@/src/client";

export function useLibrary() {
  const { data, error, isLoading, mutate } = useSWR(
    "/stories/my-library",
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
