"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";

/**
 * Routes that require authentication. The home view and the navbar use
 * the same list to block tab navigation; each protected view uses the
 * gate itself to block in-page taps and bounce the user back home if
 * they reach the route by other means (e.g. typing the URL).
 */
export const AUTH_RESTRICTED_PATHS: readonly string[] = [
  "/pen",
  "/library",
  "/notification",
  "/profile",
  "/new-story",
  "/edit-story",
  "/my-stories",
  "/downloads",
  "/premium",
  "/pricing",
  "/ambassador",
];

export function isAuthRestrictedPath(pathname: string): boolean {
  return AUTH_RESTRICTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

interface UseAuthGateOptions {
  /** Restrict a custom set of paths. Defaults to AUTH_RESTRICTED_PATHS. */
  restrictedPaths?: readonly string[];
  /**
   * Where to send the user when they dismiss the auth modal on a
   * restricted route. Defaults to `/home`. Pass `null` to keep them
   * on the current route after dismiss.
   */
  fallbackOnDismiss?: string | null;
}

/**
 * Protects one or more routes from unauthenticated access.
 *
 *  - On a protected route: blocks in-page taps/keys, opens the auth
 *    modal, and bounces the user to `fallbackOnDismiss` when they
 *    dismiss the modal.
 *  - On any other route (e.g. /home): blocks clicks on links whose
 *    `href` resolves to a restricted path, so the tab bar can't
 *    navigate the user to a protected screen before the gate is
 *    unlocked.
 */
export function useAuthGate(
  optionsOrEnabled: boolean | UseAuthGateOptions = true,
) {
  const opts: UseAuthGateOptions =
    typeof optionsOrEnabled === "boolean" ? {} : optionsOrEnabled;
  const enabled = typeof optionsOrEnabled === "boolean"
    ? optionsOrEnabled
    : true;

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openModal = useAuthModalStore((s) => s.openModal);
  const closeModal = useAuthModalStore((s) => s.closeModal);
  const modalIsOpen = useAuthModalStore((s) => s.isOpen);
  const pathname = usePathname();
  const router = useRouter();

  const modalOpenRef = useRef(modalIsOpen);
  const pathnameRef = useRef(pathname);
  const fallbackRef = useRef(opts.fallbackOnDismiss ?? "/home");
  const restrictedRef = useRef(opts.restrictedPaths ?? AUTH_RESTRICTED_PATHS);

  useEffect(() => {
    modalOpenRef.current = modalIsOpen;
  }, [modalIsOpen]);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);
  useEffect(() => {
    fallbackRef.current = opts.fallbackOnDismiss ?? "/home";
    restrictedRef.current = opts.restrictedPaths ?? AUTH_RESTRICTED_PATHS;
  }, [opts.fallbackOnDismiss, opts.restrictedPaths]);

  // Subscribe to modal state so the global click blocker sees the
  // current value without re-attaching its listener.
  useEffect(() => {
    return useAuthModalStore.subscribe((state) => {
      modalOpenRef.current = state.isOpen;
    });
  }, []);

  const restricted = opts.restrictedPaths ?? AUTH_RESTRICTED_PATHS;
  const fallback = opts.fallbackOnDismiss ?? "/home";

  // If the user lands on a restricted route while logged out, push
  // them back to the fallback and open the modal.
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (isAuthenticated()) return;
    if (!isAuthRestrictedPath(pathname)) return;
    if (modalIsOpen) return;

    openModal("signup");
    if (fallback) {
      router.replace(fallback);
    }
  }, [enabled, isAuthenticated, pathname, modalIsOpen, openModal, router, fallback]);

  // Global click blocker: intercept clicks on links that would navigate
  // to a restricted route while logged out. Captures phase so we win
  // against any handler that calls stopPropagation in the bubble phase.
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (isAuthenticated()) return;

    const isRestrictedHref = (href: string) => {
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return false;
        return restricted.some(
          (p) => url.pathname === p || url.pathname.startsWith(`${p}/`),
        );
      } catch {
        return false;
      }
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      // Don't block the auth modal itself
      if (target?.closest?.("[data-auth-modal]")) return;
      if (target?.closest?.("[data-auth-allow]")) return;

      const anchor = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#")) return;
      if (href.startsWith("javascript:")) return;

      if (isRestrictedHref(href)) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof (e as any).stopImmediatePropagation === "function") {
          (e as any).stopImmediatePropagation();
        }
        if (!modalOpenRef.current) {
          openModal("signup");
        }
      }
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true } as any);
    };
  }, [enabled, isAuthenticated, openModal, restricted]);

  // When the user dismisses the modal on a restricted route, bounce
  // them to the fallback path. The check is "modal just closed AND
  // current path is restricted".
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (isAuthenticated()) return;
    if (!fallback) return;
    if (modalIsOpen) return;
    if (!isAuthRestrictedPath(pathnameRef.current)) return;
    router.replace(fallback);
  }, [enabled, isAuthenticated, modalIsOpen, router, fallback, closeModal]);
}
