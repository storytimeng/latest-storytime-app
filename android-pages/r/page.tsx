import { Suspense } from "react";
import ReferralClient from "./[slug]/client";
import { useSearchParams } from "next/navigation";

export default function ReferralEntryPage() {
  return (
    <Suspense fallback={null}>
      <ReferralClientWrapper />
    </Suspense>
  );
}

function ReferralClientWrapper() {
  "use client";

  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? "";

  return <ReferralClient slug={slug} />;
}
