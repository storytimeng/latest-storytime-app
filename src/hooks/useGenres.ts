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
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 10 * 60 * 1000, // 10-min dedup — genres rarely change
      shouldRetryOnError: false,
    },
  );

  return {
    genres: data,
    isLoading,
    error,
  };
}
