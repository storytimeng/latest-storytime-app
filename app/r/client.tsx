"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:3001";

export default function ReferralClient({ slug }: { slug: string }) {
  const router = useRouter();
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
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
}
