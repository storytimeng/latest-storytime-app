"use client";

/**
 * PlayBillingPlans — plan cards for the Play Billing flow. This is the
 * "Approach 1" branch that activates when the backend (or the build-time
 * reveal date) flips billing mode to "playbilling".
 *
 * For now this is a stub that renders a "coming soon" notice. Wiring the
 * actual `@capacitor-community/in-app-purchases` plugin, Google Play
 * product SKUs, and the receipt-verification webhook is a separate
 * task — the toggle architecture is in place; only the payment
 * provider call inside the Subscribe button needs to be swapped in.
 */

import { CreditCard, Lock } from "lucide-react";

export function PlayBillingPlans() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-accent-shade-1 to-background">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">Go Premium</h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Plans and in-app purchase are coming soon to this device. We&apos;ll
            let you know as soon as subscriptions are available here.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-muted/40 px-4 py-3 text-left text-xs text-muted-foreground">
          <Lock className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
          <p>
            Subscriptions on this device are billed through Google Play and will
            follow Play Store pricing.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PlayBillingPlans;
