import Cookies from "js-cookie";
import { getAuthToken } from "@/src/stores/useAuthStore";

export type SupportedCurrency = "NGN" | "USD" | "GHS" | "ZAR" | "KES";

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  durationDays: number;
  amount: number;
  currency: SupportedCurrency;
  formattedPrice: string;
  isPopular: boolean;
}

export interface PremiumStatus {
  isPremium: boolean;
  expiresAt: string | null;
  preferredCurrency: SupportedCurrency;
  activeSubscription: {
    id: string;
    planCode: string;
    planName: string;
    status: string;
    currency: string;
    amountPaid: string;
    startsAt: string | null;
    expiresAt: string | null;
  } | null;
}

export interface InitializePaymentResult {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amount: number;
  currency: SupportedCurrency;
  formattedAmount: string;
  publicKey: string;
  plan: {
    code: string;
    name: string;
    durationDays: number;
  };
}

export interface VerifyPaymentResult {
  reference: string;
  status: string;
  paidAt: string | null;
  amount: string;
  currency: string;
  formattedAmount: string;
  isPremium: boolean;
  plan: { code: string; name: string; durationDays: number } | null;
  subscription: { status: string; expiresAt: string | null } | null;
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_PROXY === "true"
    ? "/api/proxy"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
}

function unwrapData<T>(payload: unknown): T {
  if (!payload || typeof payload !== "object") {
    return payload as T;
  }
  const record = payload as Record<string, unknown>;
  if ("data" in record && record.data && typeof record.data === "object") {
    const nested = record.data as Record<string, unknown>;
    if ("data" in nested) {
      return nested.data as T;
    }
    return nested as T;
  }
  return record as T;
}

async function subscriptionFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token =
    (typeof getAuthToken === "function" ? getAuthToken() : undefined) ||
    Cookies.get("authToken");

  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set(
      "Authorization",
      token.startsWith("Bearer") ? token : `Bearer ${token}`,
    );
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (json as { message?: string })?.message ||
      (json as { data?: { message?: string } })?.data?.message ||
      response.statusText;
    throw new Error(message || "Subscription request failed");
  }

  return unwrapData<T>(json);
}

export async function fetchSubscriptionPlans(
  currency?: SupportedCurrency,
  country?: string | null,
) {
  const params = new URLSearchParams();
  if (currency) params.set("currency", currency);
  if (country) params.set("country", country);
  const query = params.toString();
  return subscriptionFetch<{
    plans: SubscriptionPlan[];
    currency: string;
    isInternationalDefault?: boolean;
  }>(`/subscriptions/plans${query ? `?${query}` : ""}`);
}

export async function fetchDefaultCurrency(country?: string | null) {
  const query = country ? `?country=${encodeURIComponent(country)}` : "";
  return subscriptionFetch<{
    currency: SupportedCurrency;
    country: string | null;
    isInternationalDefault: boolean;
  }>(`/subscriptions/currency-default${query}`);
}

export async function cancelSubscription() {
  return subscriptionFetch<{
    cancelled: boolean;
    message: string;
    expiresAt: string | null;
    isPremium: boolean;
    planCode: string | null;
  }>("/subscriptions/cancel", { method: "POST" });
}

export async function reactivateSubscription() {
  return subscriptionFetch<{
    reactivated: boolean;
    message: string;
    expiresAt: string | null;
    planCode: string | null;
  }>("/subscriptions/reactivate", { method: "POST" });
}

export async function fetchPremiumStatus() {
  return subscriptionFetch<PremiumStatus>("/subscriptions/status");
}

export interface PaymentHistoryItem {
  id: string;
  reference: string;
  status: string;
  amount: string;
  currency: string;
  formattedAmount: string;
  planCode?: string;
  planName?: string;
  channel?: string | null;
  paidAt: string | null;
  createdAt: string;
}

export async function fetchPaymentHistory() {
  return subscriptionFetch<{ payments: PaymentHistoryItem[] }>(
    "/subscriptions/history",
  );
}

export async function initializeSubscription(
  planCode: string,
  currency: SupportedCurrency,
) {
  return subscriptionFetch<InitializePaymentResult>(
    "/subscriptions/initialize",
    {
      method: "POST",
      body: JSON.stringify({ planCode, currency }),
    },
  );
}

export async function verifySubscription(reference: string) {
  return subscriptionFetch<VerifyPaymentResult>(
    `/subscriptions/verify/${encodeURIComponent(reference)}`,
  );
}

export const CURRENCY_OPTIONS: Array<{
  code: SupportedCurrency;
  label: string;
}> = [
  { code: "NGN", label: "Naira (₦)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "GHS", label: "Ghana Cedi (GH₵)" },
  { code: "ZAR", label: "South African Rand (R)" },
  { code: "KES", label: "Kenyan Shilling (KSh)" },
];
