"use client";

import { useCallback } from "react";
import { useUserStore } from "@/src/stores/useUserStore";

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
}

/**
 * Hook for checking premium feature access
 *
 * TODO: Connect to premium API endpoint when available
 * Current implementation returns isPremium: true as a stub
 */
export const usePremiumFeatures = (): UsePremiumFeaturesReturn => {
  const { user } = useUserStore();

  // TODO: Replace with actual API call when premium endpoint is available
  // Example:
  // const { data, isLoading } = useSWR(
  //   user ? '/api/premium/status' : null,
  //   fetcher
  // );

  // Stub implementation - default to premium for all users
  const isPremium = true; // Change to false to test non-premium experience
  const isLoading = false;

  // Define which features require premium
  const features: PremiumFeatures = {
    ttsEnabled: true, // Basic TTS is free
    advancedVoices: isPremium, // Premium voices require subscription
    playbackSpeedControl: isPremium, // Speed control is premium
    pitchControl: isPremium, // Pitch adjustment is premium
    volumeControl: true, // Volume is always free
    playFromHere: isPremium, // Jump-to feature is premium
  };

  const checkFeature = useCallback(
    (feature: keyof PremiumFeatures): boolean => {
      return features[feature];
    },
    [features]
  );

  return {
    isPremium,
    features,
    isLoading,
    checkFeature,
  };
};
