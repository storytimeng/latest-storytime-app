"use client";

import { useState } from "react";
import {
  initializeSubscription,
  BILLING_CURRENCY,
} from "@/src/lib/subscriptions";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";

export function useSubscriptionCheckout() {
  const { isAuthenticated } = useAuthStore();
  const openAuthModal = useAuthModalStore((state) => state.openModal);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const checkout = async (planCode: string) => {
    setCheckoutError(null);

    if (!isAuthenticated()) {
      openAuthModal("login");
      return false;
    }

    setIsCheckingOut(true);
    try {
      const result = await initializeSubscription(planCode, BILLING_CURRENCY);
      window.location.href = result.authorizationUrl;
      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to start checkout";
      setCheckoutError(message);
      setIsCheckingOut(false);
      return false;
    }
  };

  return {
    checkout,
    isCheckingOut,
    checkoutError,
    setCheckoutError,
  };
}
