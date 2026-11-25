"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { IS_ANDROID } from "@/lib/platform";

const TAB_ROUTES = ["/home", "/library", "/pen", "/notification", "/profile"];

/**
 * Eagerly prefetch all main tab routes and their lazy view chunks so
 * Capacitor tab switches feel instant instead of waiting on first tap.
 */
export function TabRoutePreloader() {
  const router = useRouter();

  useEffect(() => {
    const prefetchTabs = () => {
      for (const route of TAB_ROUTES) {
        try {
          router.prefetch(route);
        } catch {
          // Some paths may not exist in static export — skip silently.
        }
      }
      // Warm the lazy-loaded tab view bundles in parallel.
      void import("@/views").catch(() => {});
    };

    if (IS_ANDROID) {
      prefetchTabs();
      return;
    }

    // On web/PWA, defer slightly until idle so initial paint isn't delayed,
    // then pre-warm all primary nav routes.
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(prefetchTabs, {
        timeout: 1500,
      });
      return () => (window as any).cancelIdleCallback?.(id);
    }

    const timer = setTimeout(prefetchTabs, 400);
    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
