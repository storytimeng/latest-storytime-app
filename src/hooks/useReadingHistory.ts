import { useEffect, useState } from "react";
import useSWR from "swr";
import { usersControllerGetReadingHistory } from "@/src/client/sdk.gen";
import { useReadingHistoryStore } from "@/src/stores/useReadingHistoryStore";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { getCachedValue, dataStateCache } from "@/src/stores/useDataStateCache";
import { APP_CACHE_KEYS } from "@/src/stores/dataCacheKeys";

const READING_HISTORY_CACHE_KEY = APP_CACHE_KEYS.readingHistory;

interface ReadingHistoryCache {
  history: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useReadingHistory(page: number = 1, limit: number = 20) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)();
  const { history, total, totalPages, setHistory } = useReadingHistoryStore();
  const [didWarmStart, setDidWarmStart] = useState(false);

  useEffect(() => {
    if (didWarmStart) return;
    if (history.length > 0) {
      setDidWarmStart(true);
      return;
    }
    if (isAuthenticated) {
      const cached = getCachedValue<ReadingHistoryCache>(
        READING_HISTORY_CACHE_KEY,
      );
      if (cached && cached.history?.length) {
        setHistory(cached);
      }
    }
    setDidWarmStart(true);
  }, [didWarmStart, history.length, isAuthenticated, setHistory]);

  const { data, isLoading } = useSWR(
    isAuthenticated
      ? `/users/reading-history?page=${page}&limit=${limit}`
      : null,
    async () => {
      const response = await usersControllerGetReadingHistory({
        query: { page, limit },
      });
      if (response.error) {
        throw response.error;
      }
      const responseData = response.data as any;
      return {
        history: responseData?.data?.readingHistory || [],
        total: responseData?.data?.total || 0,
        page: responseData?.data?.page || page,
        limit: responseData?.data?.limit || limit,
        totalPages: responseData?.data?.totalPages || 0,
      } satisfies ReadingHistoryCache;
    },
    {
      fallbackData:
        page === 1 && isAuthenticated
          ? (getCachedValue<ReadingHistoryCache>(READING_HISTORY_CACHE_KEY) ??
            undefined)
          : undefined,
    },
  );

  useEffect(() => {
    if (!data) return;
    if (data.page > 1) {
      const existingIds = new Set(history.map((item: any) => item.id));
      const newItems = data.history.filter(
        (item: any) => !existingIds.has(item.id),
      );
      setHistory({
        ...data,
        history: [...history, ...newItems],
      });
    } else {
      setHistory(data);
      if (data.history.length > 0) {
        dataStateCache.set(READING_HISTORY_CACHE_KEY, data);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, setHistory]);

  return {
    history,
    total,
    page,
    limit,
    totalPages,
    isLoading: isLoading && history.length === 0 && total === 0,
  };
}
