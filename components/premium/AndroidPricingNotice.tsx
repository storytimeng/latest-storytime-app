"use client";

/**
 * AndroidPricingNotice — the Google Play "Reader App" compliant pricing
 * screen. Per Play policy, an app that doesn't use Google Play Billing
 * must NOT show in-app prices or "Subscribe" buttons that lead outside
 * the app. Instead, we tell the user the subscription is available on
 * the web, and provide a copyable URL they can paste in a browser.
 *
 * Strict rules this component follows:
 *   - No price numbers, no plan tier list, no "Subscribe" button
 *   - No tappable link that opens a URL from inside the app
 *   - URL is shown as selectable/copyable text with a "Copy link" button
 *   - mailto: link is acceptable
 *   - Logged-in users with an existing web subscription still see their
 *     premium content via the server-side gate on `PremiumExclusiveReadGate`,
 *     so this screen does not block them.
 */

import {
  Mail,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { showToast } from "@/lib/showNotification";

const WEB_PRICING_URL = "https://storytime.ng/pricing";
const SUPPORT_EMAIL = "support@storytime.ng";

export function AndroidPricingNotice() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(WEB_PRICING_URL);
      setCopied(true);
      showToast({
        type: "success",
        message:
          "Link copied. Open it in your phone or computer browser to subscribe.",
        duration: 3500,
      });
      // Reset the icon after a moment so the button can be re-used.
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({
        type: "error",
        message:
          "Couldn't copy automatically. Long-press the link above to copy it.",
        duration: 4000,
      });
    }
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
            Premium subscriptions are managed on our website. Copy the link
            below, open it in your phone or computer browser to view plans
            and subscribe — once you do, your account will unlock premium
            stories in this app automatically.
          </p>
        </div>

        {/* Copyable URL block — text is selectable, plus an explicit
            "Copy link" button for one-tap copy. NO anchor with href, NO
            button that opens the URL inside the app (Play policy). */}
        <div className="rounded-xl border border-border bg-background px-4 py-3 text-left">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            Subscription website
          </p>
          <p
            // user-select: text — long-press works in WebView
            className="text-sm font-mono break-all select-text"
          >
            {WEB_PRICING_URL}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-medium px-4 py-2.5 text-sm hover:opacity-90 active:scale-[0.99] transition"
            aria-label="Copy subscription link"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy link
              </>
            )}
          </button>
        </div>

        <div className="space-y-3">
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
            Already subscribed on the web? Sign in with the same email —
            premium content will unlock in this app right away.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AndroidPricingNotice;
