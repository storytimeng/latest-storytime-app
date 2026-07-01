"use client";

import ReferralClient from "./[slug]/client";
import { useSearchParams } from "next/navigation";

export default function ReferralEntryPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? "";

  return <ReferralClient slug={slug} />;
}
