"use client";

import { Skeleton } from "@heroui/skeleton";
import { useBillingMode } from "@/hooks/useBillingMode";
import { AndroidPricingNotice } from "@/components/premium/AndroidPricingNotice";
import { PlayBillingPlans } from "@/components/premium/PlayBillingPlans";

/**
 * /pricing — the route used by the Android tab bar.
 *
 * On Android in Reader App mode, the Play Store does not allow in-app
 * pricing UI. We swap the body out for `AndroidPricingNotice` which
 * directs users to subscribe on the web. On web (and once Play Billing
 * is enabled), we render the full plan UI.
 *
 * The web build of this page (in `/app/pricing`) keeps the static SEO
 * metadata — this client component just takes over the body.
 */
export default function PricingPageBody() {
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

  return <AndroidPricingNotice />;
}
