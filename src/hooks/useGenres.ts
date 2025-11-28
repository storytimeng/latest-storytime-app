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
      // API returns nested structure: { data: { genres: string[] } }
      // Need to access response.data.data.genres or response.data.genres
      const genres = (response.data as any)?.data?.genres || response.data?.genres || [];
      console.log("Genres API response:", response.data);
      console.log("Extracted genres:", genres);
      return genres;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      // Preload on mount
      revalidateOnMount: true,
    }
  );

  return {
    genres: data,
    isLoading,
    error,
  };
}
