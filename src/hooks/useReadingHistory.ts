import { useEffect, useState } from "react";
import { usersControllerGetReadingHistory } from "@/src/client/sdk.gen";
import { useReadingHistoryStore } from "@/src/stores/useReadingHistoryStore";
import { getCachedValue, dataStateCache } from "@/src/stores/useDataStateCache";
import { APP_CACHE_KEYS } from "@/src/stores/dataCacheKeys";

// Cache key shared with the library view's state-cache layer so the
// hook and the view agree on where to find the warm-start value.
const READING_HISTORY_CACHE_KEY = APP_CACHE_KEYS.readingHistory;

export function useReadingHistory(page: number = 1, limit: number = 20) {
  const { history, total, totalPages, setHistory } = useReadingHistoryStore();

  // Warm-start: if the state cache already has reading history from a
  // prior session and the Zustand store is empty (cold mount), seed
  // the store from the cache so the first render has data. We only
  // do this once per mount — subsequent updates come from the live
  // fetch.
  const [didWarmStart, setDidWarmStart] = useState(false);
  useEffect(() => {
    if (didWarmStart) return;
    if (history.length > 0) {
      setDidWarmStart(true);
      return;
    }
    const cached = getCachedValue<{
      history: any[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(READING_HISTORY_CACHE_KEY);
    if (cached && cached.history?.length) {
      setHistory(cached);
    }
    setDidWarmStart(true);
  }, [didWarmStart, history.length, setHistory]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await usersControllerGetReadingHistory({
          query: { page, limit },
        });

        if (response.error) {
          console.error("Error fetching reading history:", response.error);
          return;
        }

        // @ts-ignore - The API response structure is data.readingHistory
        const responseData = response.data as any;
        const readingHistory = responseData?.data?.readingHistory || [];
        const totalCount = responseData?.data?.total || 0;
        const currentPage = responseData?.data?.page || 1;
        const pageLimit = responseData?.data?.limit || 20;
        const pages = responseData?.data?.totalPages || 0;

        // If page > 1, accumulate results, otherwise replace
        if (currentPage > 1) {
          // Accumulate: merge new items with existing ones
          const existingIds = new Set(history.map((item: any) => item.id));
          const newItems = readingHistory.filter(
            (item: any) => !existingIds.has(item.id),
          );

          setHistory({
            history: [...history, ...newItems],
            total: totalCount,
            page: currentPage,
            limit: pageLimit,
            totalPages: pages,
          });
        } else {
          // Replace: fresh fetch for page 1
          const next = {
            history: readingHistory,
            total: totalCount,
            page: currentPage,
            limit: pageLimit,
            totalPages: pages,
          };
          setHistory(next);
          // Mirror into the cross-session state cache so a hard
          // reload / cold start still has something to render.
          if (next.history.length > 0) {
            dataStateCache.set(READING_HISTORY_CACHE_KEY, next);
          }
        }
      } catch (error) {
        console.error("Error fetching reading history:", error);
      }
    };

    fetchHistory();
  }, [page, limit]); // Removed setHistory from deps to avoid infinite loop

  return {
    history,
    total,
    page,
    limit,
    totalPages,
    isLoading: history.length === 0 && total === 0,
  };
}
