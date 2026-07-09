"use client";

/**
 * AndroidPricingNotice — the Google Play "Reader App" compliant pricing
 * screen. Per Play policy, an app that doesn't use Google Play Billing
 * must NOT show in-app prices or "Subscribe" buttons that lead outside
 * the app. Instead, we tell the user the subscription is available on
 * the web, and provide a "contact support" affordance.
 *
 * Strict rules this component follows:
 *   - No price numbers, no plan tier list, no "Subscribe" button
 *   - Links to the web pricing page open in the system browser
 *     (Capacitor Browser), NOT in the in-app WebView
 *   - mailto: link is acceptable
 *   - Logged-in users with an existing web subscription still see their
 *     premium content via the server-side gate on `PremiumExclusiveReadGate`,
 *     so this screen does not block them.
 */

import { Mail, ExternalLink, ShieldCheck, Smartphone } from "lucide-react";

const WEB_PRICING_URL = "https://storytime.ng/pricing";
const SUPPORT_EMAIL = "support@storytime.ng";

export function AndroidPricingNotice() {
  const openExternal = (url: string) => {
    if (typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-accent-shade-1 to-background">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">
            StoryTime Premium
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Premium subscriptions are managed on our website. Open the link
            below on your phone or computer to view plans and subscribe — once
            you do, your account will unlock premium stories in this app
            automatically.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => openExternal(WEB_PRICING_URL)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-medium px-5 py-3.5 text-base hover:opacity-90 active:scale-[0.99] transition"
          >
            <ExternalLink className="w-4 h-4" />
            Open StoryTime Premium
          </button>

          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=StoryTime%20Premium%20access`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background text-foreground font-medium px-5 py-3 text-base hover:bg-accent transition"
          >
            <Mail className="w-4 h-4" />
            Contact support
          </a>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-muted/40 px-4 py-3 text-left text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
          <p>
            Already subscribed on the web? Sign in with the same email — premium
            content will unlock in this app right away.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AndroidPricingNotice;
