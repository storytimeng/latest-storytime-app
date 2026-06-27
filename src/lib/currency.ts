import type { SupportedCurrency } from "@/src/lib/subscriptions";

export const DEFAULT_CURRENCY: SupportedCurrency = "NGN";

/** Active billing currency - Paystack merchant is NGN-only for now */
export const BILLING_CURRENCY: SupportedCurrency = "NGN";

const COUNTRY_CURRENCY_MAP: Record<string, SupportedCurrency> = {
  NG: "NGN",
  GH: "GHS",
  ZA: "ZAR",
  KE: "KES",
  US: "USD",
};

export function resolveCurrencyFromCountry(
  countryCode?: string | null,
): SupportedCurrency {
  void countryCode;
  return BILLING_CURRENCY;
}

/** Detect user country from browser locale / timezone */
export function detectUserCountryCode(): string | null {
  if (typeof window === "undefined") return null;

  const locale = navigator.language || "";
  const regionFromLocale = locale.split("-")[1]?.toUpperCase();
  if (regionFromLocale) return regionFromLocale;

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const tzCountryHints: Record<string, string> = {
      Lagos: "NG",
      Accra: "GH",
      Johannesburg: "ZA",
      Nairobi: "KE",
    };
    for (const [city, code] of Object.entries(tzCountryHints)) {
      if (tz.includes(city)) return code;
    }
  } catch {
    // ignore
  }

  return null;
}

export function getDefaultCurrencyForUser(): SupportedCurrency {
  const country = detectUserCountryCode();
  return resolveCurrencyFromCountry(country);
}
