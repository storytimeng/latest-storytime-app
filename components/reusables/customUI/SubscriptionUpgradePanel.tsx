"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import SubscriptionPlanPicker from "@/components/reusables/customUI/SubscriptionPlanPicker";
import { useSubscriptionPlans } from "@/src/hooks/useSubscriptionPlans";
import { useSubscriptionCheckout } from "@/src/hooks/useSubscriptionCheckout";
import { planDurationLabel } from "@/src/lib/subscription-ui";

interface SubscriptionUpgradePanelProps {
  currentPlanCode?: string | null;
  compact?: boolean;
  showHeading?: boolean;
  variant?: "new" | "upgrade";
}

const PLAN_ORDER = ["1month", "6months", "1year"];

function isHigherTier(currentCode: string, selectedCode: string): boolean {
  const currentIndex = PLAN_ORDER.indexOf(currentCode);
  const selectedIndex = PLAN_ORDER.indexOf(selectedCode);
  if (currentIndex < 0 || selectedIndex < 0) return false;
  return selectedIndex > currentIndex;
}

const SubscriptionUpgradePanel: React.FC<SubscriptionUpgradePanelProps> = ({
  currentPlanCode = null,
  compact = false,
  showHeading = true,
  variant = currentPlanCode ? "upgrade" : "new",
}) => {
  const {
    plans,
    plansLoading,
    plansReady,
    selectedPlan,
    selectedPlanData,
    selectPlan,
  } = useSubscriptionPlans({
    enabled: true,
    currentPlanCode,
  });

  const { checkout, isCheckingOut, checkoutError } = useSubscriptionCheckout();

  const handleCheckout = async () => {
    if (!selectedPlanData) return;
    await checkout(selectedPlanData.code);
  };

  const isExtending =
    Boolean(currentPlanCode) && selectedPlan === currentPlanCode;
  const isUpgrade =
    Boolean(currentPlanCode) &&
    selectedPlan !== currentPlanCode &&
    isHigherTier(currentPlanCode!, selectedPlan);

  const helperText = (() => {
    if (!selectedPlanData) return null;

    if (variant === "new") {
      return `Full access for ${selectedPlanData.durationDays} days after payment.`;
    }

    if (isExtending) {
      return `Adds ${selectedPlanData.durationDays} more days to your current membership.`;
    }

    if (isUpgrade) {
      return `Upgrades you to ${planDurationLabel(selectedPlan)} billing. New time is added from your current end date.`;
    }

    return `Switches you to ${planDurationLabel(selectedPlan)}. New time is added from your current end date.`;
  })();

  return (
    <div className="space-y-4">
      {showHeading && (
        <div className="space-y-1 text-center">
          <p
            className={`text-primary-colour text-[14px] ${Magnetik_Medium.className}`}
          >
            {variant === "upgrade"
              ? "Change or extend your plan"
              : "Choose your plan"}
          </p>
          {variant === "upgrade" && (
            <p
              className={`text-xs text-primary-shade-4 leading-relaxed ${Magnetik_Regular.className}`}
            >
              Switch between monthly, 6-month, or yearly. Payment adds time to
              your existing membership.
            </p>
          )}
        </div>
      )}

      <SubscriptionPlanPicker
        plans={plans}
        selectedPlan={selectedPlan}
        onSelectPlan={selectPlan}
        currentPlanCode={currentPlanCode}
        isLoading={plansLoading}
        compact={compact}
      />

      {checkoutError && (
        <p
          className={`text-sm text-red-600 text-center ${Magnetik_Regular.className}`}
        >
          {checkoutError}
        </p>
      )}

      {helperText && plansReady && (
        <p
          className={`text-xs text-primary-shade-4 text-center leading-relaxed ${Magnetik_Regular.className}`}
        >
          {helperText}
        </p>
      )}

      <Button
        className={`w-full bg-primary-shade-6 text-universal-white py-4 text-lg ${Magnetik_Medium.className}`}
        size="lg"
        onPress={handleCheckout}
        isDisabled={isCheckingOut || !plansReady || !selectedPlanData}
        isLoading={isCheckingOut}
      >
        {isCheckingOut ? "Processing..." : "Pay"}
      </Button>
    </div>
  );
};

export default SubscriptionUpgradePanel;
