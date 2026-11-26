export const IS_ANDROID = process.env.NEXT_PUBLIC_PLATFORM === "android";

/**
 * Runtime + build-time Android detection.
 * Ensures Capacitor Android builds never expose external Paystack checkout
 * even on new devices or if NEXT_PUBLIC_PLATFORM wasn't set at build time.
 */
export function isNativeAndroid(): boolean {
  if (IS_ANDROID) return true;
  if (typeof window !== "undefined") {
    const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } })
      .Capacitor;
    if (cap?.getPlatform?.() === "android") return true;
  }
  return false;
}
