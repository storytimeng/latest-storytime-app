import type { SubscriptionPlan } from "@/src/lib/subscriptions";

export function formatPlanDuration(name: string, durationDays: number): string {
  if (durationDays >= 365) return "One (1)\nYear";
  if (durationDays >= 180) return "Six (6)\nMonths";
  if (durationDays >= 30) return "One (1)\nMonth";
  return name.replace(" ", "\n");
}

const PLAN_ORDER = ["1month", "6months", "1year"] as const;

export function suggestUpgradePlanCode(
  currentPlanCode: string | null | undefined,
  plans: SubscriptionPlan[],
): string {
  const available = PLAN_ORDER.filter((code) =>
    plans.some((plan) => plan.code === code),
  );

  if (available.length === 0) {
    return plans.find((plan) => plan.isPopular)?.code ?? plans[0]?.code ?? "6months";
  }

  if (!currentPlanCode || !available.includes(currentPlanCode as (typeof PLAN_ORDER)[number])) {
    return plans.find((plan) => plan.isPopular)?.code ?? available[0];
  }

  const currentIndex = available.indexOf(
    currentPlanCode as (typeof PLAN_ORDER)[number],
  );
  if (currentIndex >= 0 && currentIndex < available.length - 1) {
    return available[currentIndex + 1];
  }

  return currentPlanCode;
}

export function planDurationLabel(code: string): string {
  switch (code) {
    case "1month":
      return "monthly";
    case "6months":
      return "6-month";
    case "1year":
      return "yearly";
    default:
      return code;
  }
}
