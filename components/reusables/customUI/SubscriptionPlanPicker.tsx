"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";
import type { SubscriptionPlan } from "@/src/lib/subscriptions";
import { formatPlanDuration } from "@/src/lib/subscription-ui";

interface SubscriptionPlanPickerProps {
  plans: SubscriptionPlan[];
  selectedPlan: string;
  onSelectPlan: (code: string) => void;
  currentPlanCode?: string | null;
  isLoading?: boolean;
  compact?: boolean;
}

const SubscriptionPlanPicker: React.FC<SubscriptionPlanPickerProps> = ({
  plans,
  selectedPlan,
  onSelectPlan,
  currentPlanCode = null,
  isLoading = false,
  compact = false,
}) => {
  if (isLoading) {
    return (
      <div className={`flex justify-center ${compact ? "py-4" : "py-8"}`}>
        <Loader2 className="w-6 h-6 animate-spin text-primary-colour" />
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-3 ${compact ? "gap-2" : "gap-3"}`}>
      {plans.map((plan) => {
        const isSelected = selectedPlan === plan.code;
        const isCurrent = currentPlanCode === plan.code;

        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => onSelectPlan(plan.code)}
            className={`relative border-2 transition-all duration-200 ${
              compact ? "rounded-xl p-2.5" : "rounded-2xl p-4"
            } ${
              isSelected
                ? "border-complimentary-colour bg-complimentary-colour text-universal-white"
                : plan.isPopular
                  ? "border-complimentary-colour/30 bg-complimentary-colour/5 text-primary-colour"
                  : "border-light-grey-2 bg-universal-white text-primary-colour"
            } ${plan.isPopular && !isSelected ? "shadow-md" : ""}`}
          >
            {isCurrent && (
              <span
                className={`absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary-colour px-2 py-0.5 text-[9px] text-universal-white ${Magnetik_Regular.className}`}
              >
                Current
              </span>
            )}
            <div
              className={`text-center ${compact ? "space-y-1.5" : "space-y-3"}`}
            >
              <div
                className={`leading-tight ${
                  compact ? "text-[10px]" : "text-[12px]"
                } ${
                  isSelected ? "text-universal-white" : "text-primary-shade-4"
                } ${Magnetik_Regular.className}`}
              >
                {formatPlanDuration(plan.name, plan.durationDays)
                  .split("\n")
                  .map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
              </div>
              <div
                className={`font-bold text-center ${
                  compact ? "text-sm" : "text-md"
                } ${
                  isSelected ? "text-universal-white" : "text-primary-colour"
                } ${Magnetik_Bold.className}`}
              >
                {plan.formattedPrice}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SubscriptionPlanPicker;
