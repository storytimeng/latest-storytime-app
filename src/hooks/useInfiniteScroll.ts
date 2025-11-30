import { useEffect, useRef, RefObject } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number; // 0-1, where 1 is 100%
  enabled?: boolean;
}

/**
 * Hook to detect when user has scrolled a certain percentage through a horizontal scrollable container
 * @param containerRef - Ref to the scrollable container
 * @param onLoadMore - Callback to trigger when threshold is reached
 * @param options - Configuration options
 */
export function useInfiniteScroll(
  containerRef: RefObject<HTMLElement>,
  onLoadMore: () => void,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 0.7, enabled = true } = options;
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    const handleScroll = () => {
      if (loadingRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      const scrollPercentage = (scrollLeft + clientWidth) / scrollWidth;

      // Trigger load more when scrolled past threshold
      if (scrollPercentage >= threshold) {
        loadingRef.current = true;
        onLoadMore();
        
        // Reset loading flag after a delay to prevent rapid firing
        setTimeout(() => {
          loadingRef.current = false;
        }, 1000);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [containerRef, onLoadMore, threshold, enabled]);
}
