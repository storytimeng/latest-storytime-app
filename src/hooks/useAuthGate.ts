"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";

/**
 * Blocks all pointer / touch / key interactions on the screen until the
 * user is authenticated. If an unauthenticated user taps anywhere, we
 * prevent the underlying action and open the auth modal. The user can
 * dismiss the modal, but the screen stays gated: the next tap will
 * re-open it. This is intentionally aggressive on pen / library /
 * notification / profile screens.
 */
export function useAuthGate(enabled: boolean = true) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openModal = useAuthModalStore((s) => s.openModal);
  const modalOpenRef = useRef(false);

  // Track modal open/close state without causing re-renders.
  useEffect(() => {
    return useAuthModalStore.subscribe((state) => {
      modalOpenRef.current = state.isOpen;
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (isAuthenticated()) return; // already logged in — gate is open

    const blockAndPrompt = (e: Event) => {
      // Don't block interactions on the auth modal itself
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-auth-modal]")) return;
      // Don't block the close button on the modal (it has data-auth-allow)
      if (target?.closest?.("[data-auth-allow]")) return;

      // Block the underlying event
      e.preventDefault();
      e.stopPropagation();
      if (typeof (e as any).stopImmediatePropagation === "function") {
        (e as any).stopImmediatePropagation();
      }

      // Open the modal (no-op if it's already open)
      if (!modalOpenRef.current) {
        openModal("signup");
      }
    };

    // Capture phase so we win against any handler that calls stopPropagation
    // later in the bubble phase.
    const events: (keyof WindowEventMap)[] = [
      "click",
      "pointerdown",
      "keydown",
      "submit",
    ];
    events.forEach((evt) => {
      window.addEventListener(evt, blockAndPrompt, { capture: true });
    });

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, blockAndPrompt, { capture: true } as any);
      });
    };
  }, [enabled, isAuthenticated, openModal]);
}
