"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@heroui/modal";

/**
 * Custom hook for managing modal state via URL parameters
 * Allows modals to be opened/closed using URL query params
 * Supports browser back/forward navigation
 */
export const useModalNavigation = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Get search params from window.location (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setActiveModal(params.get("modal"));
    }
    // Prefetch common routes that might be accessed via modals
    router.prefetch("/settings");
  }, [router]);

  // Handle modal state based on URL params
  useEffect(() => {
    if (activeModal) {
      onOpen();
    } else {
      onClose();
    }
  }, [activeModal, onOpen, onClose]);

  // Listen for URL changes (browser back/forward)
  useEffect(() => {
    const handleUrlChange = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        setActiveModal(params.get("modal"));
      }
    };

    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  const openModal = (modalId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("modal", modalId);
    router.push(`?${params.toString()}`);
    setActiveModal(modalId);
  };

  const closeModal = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("modal");
    router.push(`?${params.toString()}`);
    setActiveModal(null);
  };

  return {
    isOpen,
    activeModal,
    openModal,
    closeModal,
  };
};
