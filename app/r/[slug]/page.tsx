import { redirect } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:3001";

type ResolveReferralPayload = {
  referralCode?: string | null;
  shareUrl?: string | null;
};

function unwrapResolvePayload(payload: unknown): ResolveReferralPayload | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const nested =
    "data" in record && record.data && typeof record.data === "object"
      ? (record.data as ResolveReferralPayload)
      : (record as ResolveReferralPayload);

  const referralCode = nested.referralCode?.trim();
  if (!referralCode) {
    return null;
  }

  return { referralCode, shareUrl: nested.shareUrl ?? null };
}

async function resolveReferralSlug(slug: string) {
  const response = await fetch(
    `${API_BASE.replace(/\/$/, "")}/ambassadors/referrals/resolve/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    return null;
  }

  return unwrapResolvePayload(await response.json());
}

export default async function ReferralRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = await resolveReferralSlug(slug);

  if (resolved?.referralCode) {
    redirect(`/auth/signup?ref=${encodeURIComponent(resolved.referralCode)}`);
  }

  redirect("/auth/signup");
}

export function generateStaticParams() {
  return [];
}
