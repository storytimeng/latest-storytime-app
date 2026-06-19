"use client";

import { useCallback, useEffect } from "react";
import useSWR from "swr";
import { useUserStore } from "@/src/stores/useUserStore";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { fetchPremiumStatus } from "@/src/lib/subscriptions";
import { useTTSStore } from "@/src/stores/useTTSStore";

export interface PremiumFeatures {
  ttsEnabled: boolean;
  advancedVoices: boolean;
  playbackSpeedControl: boolean;
  pitchControl: boolean;
  volumeControl: boolean;
  playFromHere: boolean;
}

export interface UsePremiumFeaturesReturn {
  isPremium: boolean;
  features: PremiumFeatures;
  isLoading: boolean;
  checkFeature: (feature: keyof PremiumFeatures) => boolean;
  premiumExpiresAt: string | null;
  isSubscriptionCancelled: boolean;
  currentPlanCode: string | null;
  currentPlanName: string | null;
  refreshPremiumStatus: () => void;
}

export const usePremiumFeatures = (): UsePremiumFeaturesReturn => {
  const { user } = useUserStore();
  const { isAuthenticated } = useAuthStore();
  const setIsPremium = useTTSStore((state) => state.setIsPremium);
  const isLoggedIn = isAuthenticated();

  const { data, error, isLoading, mutate } = useSWR(
    isLoggedIn ? "premium-status" : null,
    async () => fetchPremiumStatus(),
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    },
  );

  const isPremium = data?.isPremium ?? user?.isPremium ?? false;
  const isSubscriptionCancelled =
    data?.activeSubscription?.status === "cancelled";

  useEffect(() => {
    setIsPremium(isPremium);
  }, [isPremium, setIsPremium]);

  const features: PremiumFeatures = {
    ttsEnabled: true,
    advancedVoices: isPremium,
    playbackSpeedControl: isPremium,
    pitchControl: isPremium,
    volumeControl: true,
    playFromHere: isPremium,
  };

  const checkFeature = useCallback(
    (feature: keyof PremiumFeatures): boolean => features[feature],
    [features],
  );

  const refreshPremiumStatus = useCallback(() => {
    void mutate();
  }, [mutate]);

  return {
    isPremium,
    features,
    isLoading: isLoggedIn ? isLoading && !data && !error : false,
    checkFeature,
    premiumExpiresAt: data?.expiresAt ?? null,
    isSubscriptionCancelled,
    currentPlanCode: data?.activeSubscription?.planCode ?? null,
    currentPlanName: data?.activeSubscription?.planName ?? null,
    refreshPremiumStatus,
  };
};
