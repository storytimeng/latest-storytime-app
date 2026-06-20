import { redirect } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:3001";

async function resolveReferralSlug(slug: string) {
  const response = await fetch(
    `${API_BASE.replace(/\/$/, "")}/ambassadors/referrals/resolve/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    shareUrl?: string | null;
  };

  return data.shareUrl ?? null;
}

export default async function ReferralRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shareUrl = await resolveReferralSlug(slug);

  if (shareUrl) {
    redirect(shareUrl);
  }

  redirect("/auth/signup");
}
