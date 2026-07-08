"use client";

import ReferralClient from "./client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ReferralEntryInner() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? "";

  return <ReferralClient slug={slug} />;
}

export default function ReferralEntryPage() {
  return (
    <Suspense fallback={null}>
      <ReferralEntryInner />
    </Suspense>
  );
}
