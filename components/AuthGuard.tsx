"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";
import { usePathname } from "next/navigation";

/**
 * AuthGuard component that monitors authentication state
 * and displays the auth modal when user is logged out
 */
export const AuthGuard = () => {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openModal, isOpen } = useAuthModalStore();

  useEffect(() => {
    // Skip auth check for auth-related pages
    const isAuthPage = pathname?.startsWith("/auth");

    // If user is not authenticated and not on an auth page, show modal
    if (!isAuthenticated() && !isAuthPage && !isOpen) {
      openModal("login");
    }
  }, [isAuthenticated, pathname, openModal, isOpen]);

  return null;
};
