import useSWR from "swr";
import { fetchAmbassadorOverview } from "@/src/lib/ambassadors";

export function useAmbassadorOverview() {
  const { data, error, isLoading, mutate } = useSWR(
    "ambassador-overview",
    fetchAmbassadorOverview,
    { revalidateOnFocus: true },
  );

  return {
    overview: data,
    isLoading,
    error,
    mutate,
  };
}
