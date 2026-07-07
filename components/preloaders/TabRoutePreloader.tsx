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
    if (!IS_ANDROID) return;

    for (const route of TAB_ROUTES) {
      try {
        router.prefetch(route);
      } catch {
        // Some paths may not exist in the static export — skip silently.
      }
    }

    // Warm the lazy-loaded tab view bundles in parallel.
    void import("@/views").catch(() => {});
  }, [router]);

  return null;
}
