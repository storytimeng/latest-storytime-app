import { useEffect } from 'react';
import { usersControllerGetReadingHistory } from '@/src/client/sdk.gen';
import { useReadingHistoryStore } from '@/src/stores/useReadingHistoryStore';

export function useReadingHistory(page: number = 1, limit: number = 20) {
  const { history, total, totalPages, setHistory } = useReadingHistoryStore();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await usersControllerGetReadingHistory({
          query: { page, limit },
        });

        if (response.error) {
          console.error('Error fetching reading history:', response.error);
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
          const newItems = readingHistory.filter((item: any) => !existingIds.has(item.id));
          
          setHistory({
            history: [...history, ...newItems],
            total: totalCount,
            page: currentPage,
            limit: pageLimit,
            totalPages: pages,
          });
        } else {
          // Replace: fresh fetch for page 1
          setHistory({
            history: readingHistory,
            total: totalCount,
            page: currentPage,
            limit: pageLimit,
            totalPages: pages,
          });
        }
      } catch (error) {
        console.error('Error fetching reading history:', error);
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
