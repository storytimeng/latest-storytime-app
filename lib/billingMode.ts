/**
 * Billing mode resolution for the mobile app.
 *
 * Decision precedence (top wins, all errors fall through to "reader"):
 *
 *   1. If `IS_ANDROID` is false (web / PWA), the app is on the open web.
 *      Show the full in-app pricing UI — Google Play policy doesn't apply.
 *
 *   2. If the SWR fetch from the backend succeeds and returns
 *      `{ force: true, mode: ... }`, use that mode verbatim.
 *
 *   3. Else, fall back to the build-time clock: if
 *      `Date.now() >= NEXT_PUBLIC_BILLING_REVEAL_AT`, show Play Billing;
 *      otherwise stay in Reader App mode.
 *
 *   4. On any network error, parse error, missing env var, or backend
 *      returning a malformed payload: stay in "reader". This is the
 *      security-safe default — the same posture a Reader App requires to
 *      stay Play-Store-compliant.
 */
import { IS_ANDROID } from "@/lib/platform";
import type { AppBillingMode, AppConfigDto } from "@/src/appConfigClient";

export interface ResolvedBilling {
  mode: AppBillingMode;
  source:
    | "web"
    | "backend-force"
    | "backend-build-time"
    | "build-time"
    | "default-reader";
  /** True if the build-time reveal date has been reached. */
  revealPassed: boolean;
  /** Raw backend payload, if any. */
  remote?: AppConfigDto;
}

const READER_FALLBACK: ResolvedBilling = {
  mode: "reader",
  source: "default-reader",
  revealPassed: false,
};

/** Build-time clock. Returns true if the reveal date has been reached. */
export function isRevealDatePassed(): boolean {
  const revealAt = process.env.NEXT_PUBLIC_BILLING_REVEAL_AT;
  if (!revealAt) return false;
  const ts = new Date(revealAt).getTime();
  if (Number.isNaN(ts)) return false;
  return Date.now() >= ts;
}

/**
 * Pure function. Given a possibly-undefined backend payload, returns the
 * resolved billing decision. All inputs are validated; any invalid input
 * returns the reader fallback.
 */
export function resolveBillingMode(
  remote: AppConfigDto | null | undefined,
): ResolvedBilling {
  // 1. Non-Android = always show full pricing.
  if (!IS_ANDROID) {
    return {
      mode: "playbilling",
      source: "web",
      revealPassed: true,
      remote: remote ?? undefined,
    };
  }

  // 2. Backend forced override.
  if (
    remote &&
    typeof remote === "object" &&
    typeof remote.force === "boolean" &&
    (remote.mode === "reader" || remote.mode === "playbilling") &&
    remote.force === true
  ) {
    return {
      mode: remote.mode,
      source: "backend-force",
      revealPassed: true,
      remote,
    };
  }

  // 3. Build-time clock.
  if (isRevealDatePassed()) {
    return {
      mode: "playbilling",
      source: remote ? "backend-build-time" : "build-time",
      revealPassed: true,
      remote: remote ?? undefined,
    };
  }

  // 4. Default — stay in Reader App mode.
  return {
    mode: "reader",
    source: "default-reader",
    revealPassed: false,
    remote: remote ?? undefined,
  };
}

/** Catch-all for catching resolver bugs. Never throws. */
export function safeResolveBillingMode(
  remote: AppConfigDto | null | undefined,
): ResolvedBilling {
  try {
    return resolveBillingMode(remote);
  } catch {
    return READER_FALLBACK;
  }
}
