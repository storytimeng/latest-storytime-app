import useSWR from "swr";
import { storiesControllerGetGenres } from "../client/sdk.gen";

export function useGenres() {
  const { data, error, isLoading } = useSWR(
    "genres",
    async () => {
      const response = await storiesControllerGetGenres();
      if (response.error) {
        throw response.error;
      }
      const genres =
        (response.data as any)?.data?.genres || response.data?.genres || [];
      return genres;
    },
    {
      revalidateOnMount: true,
      revalidateOnFocus: true,      // Refresh when user returns to the tab
      refreshInterval: 5 * 60 * 1000, // Poll every 5 minutes
      shouldRetryOnError: false,
    },
  );

  return {
    genres: data,
    isLoading,
    error,
  };
}
