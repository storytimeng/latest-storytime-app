"use client";

/**
 * Android override for /r/[slug]
 *
 * The web version makes a server-side API call to resolve the referral slug,
 * then issues a server redirect. For the Android static export this cannot
 * work because there is no Node.js server at runtime.
 *
 * This client version calls the same API endpoint from the browser and
 * redirects with the Next.js router – identical behaviour, fully static.
 */

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Spinner } from "@heroui/spinner";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:3001";

export function generateStaticParams() {
  return [];
}

export default function ReferralRedirectPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) {
      router.replace("/auth/signup");
      return;
    }

    const resolve = async () => {
      try {
        const res = await fetch(
          `${API_BASE.replace(/\/$/, "")}/ambassadors/referrals/resolve/${encodeURIComponent(slug)}`,
        );

        if (res.ok) {
          const json = await res.json();
          const data = json?.data ?? json;
          const referralCode = data?.referralCode?.trim();

          if (referralCode) {
            router.replace(`/auth/signup?ref=${encodeURIComponent(referralCode)}`);
            return;
          }
        }
      } catch {
        setError(true);
      }

      router.replace("/auth/signup");
    };

    resolve();
  }, [slug, router]);

  if (error) return null;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
