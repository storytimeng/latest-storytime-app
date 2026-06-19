"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  fetchDefaultCurrency,
  fetchSubscriptionPlans,
  SubscriptionPlan,
  SupportedCurrency,
} from "@/src/lib/subscriptions";
import {
  detectUserCountryCode,
  getDefaultCurrencyForUser,
} from "@/src/lib/currency";
import { suggestUpgradePlanCode } from "@/src/lib/subscription-ui";

interface UseSubscriptionPlansOptions {
  enabled?: boolean;
  currentPlanCode?: string | null;
}

export function useSubscriptionPlans({
  enabled = true,
  currentPlanCode = null,
}: UseSubscriptionPlansOptions = {}) {
  const [currency, setCurrency] = useState<SupportedCurrency | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("6months");
  const [userPickedPlan, setUserPickedPlan] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const resolveCurrency = async () => {
      const country = detectUserCountryCode();
      try {
        const result = await fetchDefaultCurrency(country);
        if (!cancelled) setCurrency(result.currency);
      } catch {
        if (!cancelled) setCurrency(getDefaultCurrencyForUser());
      }
    };

    void resolveCurrency();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const { data: plansData, isLoading: plansLoading } = useSWR(
    enabled && currency ? ["subscription-plans", currency] : null,
    () => fetchSubscriptionPlans(currency!),
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
    plansLoading: enabled && (!currency || plansLoading),
    plansReady: enabled && Boolean(currency) && !plansLoading && plans.length > 0,
    selectedPlan,
    selectedPlanData,
    selectPlan,
  };
}
