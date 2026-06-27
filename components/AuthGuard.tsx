"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  hydrateAuthFromCookies,
  prepareAuthSession,
} from "@/src/lib/authSession";

/**
 * Silently restores auth session from cookies on navigation.
 * Does not show the login modal - that is handled by story views when needed.
 */
export const AuthGuard = () => {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      hydrateAuthFromCookies();
      await prepareAuthSession();
      if (cancelled) return;
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
};
