"use client";

import { Skeleton } from "@heroui/skeleton";
import { useBillingMode } from "@/hooks/useBillingMode";
import { AndroidPricingNotice } from "@/components/premium/AndroidPricingNotice";
import { PlayBillingPlans } from "@/components/premium/PlayBillingPlans";
import { PremiumView } from "@/views";

/**
 * /premium — the route used by the Android tab bar.
 *
 * Web users (and Android users once Play Billing is enabled) get the
 * full `PremiumView` (Stripe checkout). Android users in Reader App
 * mode get `AndroidPricingNotice` so the app stays Play-policy
 * compliant — no in-app prices, no in-app subscribe button.
 */
export default function PremiumPageBody() {
  const { mode, ready, revealPassed } = useBillingMode();

  if (!ready) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="w-full h-24 rounded-xl" />
        <Skeleton className="w-full h-12 rounded-xl" />
        <Skeleton className="w-full h-12 rounded-xl" />
      </div>
    );
  }

  if (mode === "playbilling" && revealPassed) {
    return <PlayBillingPlans />;
  }

  // On web (IS_ANDROID=false), the hook returns mode=playbilling with
  // revealPassed=true, so we fall through to the full PremiumView.
  if (mode === "playbilling") {
    return <PremiumView />;
  }

  return <AndroidPricingNotice />;
}
