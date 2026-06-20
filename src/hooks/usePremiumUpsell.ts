"use client";

import { useCallback, useState } from "react";
import { usePremiumFeatures, type PremiumFeatures } from "@/src/hooks/usePremiumFeatures";
import type { PremiumUpsellReason } from "@/src/lib/premiumUpsell";
import { PREMIUM_UPSELL_CONTENT } from "@/src/lib/premiumUpsell";

export function usePremiumUpsell() {
  const { checkFeature } = usePremiumFeatures();
  const [upsellReason, setUpsellReason] = useState<PremiumUpsellReason | null>(
    null,
  );

  const closeUpsell = useCallback(() => {
    setUpsellReason(null);
  }, []);

  const requireFeature = useCallback(
    (reason: PremiumUpsellReason): boolean => {
      const feature = PREMIUM_UPSELL_CONTENT[reason].feature;
      if (checkFeature(feature)) {
        return true;
      }
      setUpsellReason(reason);
      return false;
    },
    [checkFeature],
  );

  const requirePremiumFeature = useCallback(
    (feature: keyof PremiumFeatures, reason: PremiumUpsellReason): boolean => {
      if (checkFeature(feature)) {
        return true;
      }
      setUpsellReason(reason);
      return false;
    },
    [checkFeature],
  );

  return {
    upsellReason,
    closeUpsell,
    requireFeature,
    requirePremiumFeature,
    isUpsellOpen: upsellReason !== null,
  };
}
