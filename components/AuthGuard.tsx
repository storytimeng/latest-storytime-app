"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";
import {
  hasAuthSession,
  hydrateAuthFromCookies,
  isAuthExemptPath,
  prepareAuthSession,
} from "@/src/lib/authSession";

/**
 * Monitors authentication on protected routes and shows the login modal when needed.
 * Payment return URLs are exempt so Paystack redirects are not interrupted.
 */
export const AuthGuard = () => {
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const { openModal, isOpen } = useAuthModalStore();
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      hydrateAuthFromCookies();
      await prepareAuthSession();
      if (!cancelled) setSessionReady(true);
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!sessionReady || isAuthExemptPath(pathname) || isOpen) return;

    if (!hasAuthSession()) {
      openModal("login");
    }
  }, [sessionReady, pathname, token, openModal, isOpen]);

  return null;
};
