"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  BILLING_CURRENCY,
  fetchSubscriptionPlans,
  SubscriptionPlan,
} from "@/src/lib/subscriptions";
import { suggestUpgradePlanCode } from "@/src/lib/subscription-ui";

interface UseSubscriptionPlansOptions {
  enabled?: boolean;
  currentPlanCode?: string | null;
}

export function useSubscriptionPlans({
  enabled = true,
  currentPlanCode = null,
}: UseSubscriptionPlansOptions = {}) {
  const currency = BILLING_CURRENCY;
  const [selectedPlan, setSelectedPlan] = useState("6months");
  const [userPickedPlan, setUserPickedPlan] = useState(false);

  const { data: plansData, isLoading: plansLoading } = useSWR(
    enabled ? ["subscription-plans", currency] : null,
    () => fetchSubscriptionPlans(currency),
    { revalidateOnFocus: false },
  );

  const plans: SubscriptionPlan[] = plansData?.plans ?? [];

  useEffect(() => {
    if (!enabled || plans.length === 0 || userPickedPlan) return;
    setSelectedPlan(suggestUpgradePlanCode(currentPlanCode, plans));
  }, [enabled, plans, currentPlanCode, userPickedPlan]);

  const selectedPlanData = useMemo(
    () => plans.find((plan) => plan.code === selectedPlan),
    [plans, selectedPlan],
  );

  const selectPlan = (code: string) => {
    setUserPickedPlan(true);
    setSelectedPlan(code);
  };

  return {
    currency,
    plans,
    plansLoading: enabled && plansLoading,
    plansReady: enabled && !plansLoading && plans.length > 0,
    selectedPlan,
    selectedPlanData,
    selectPlan,
  };
}
