"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AllGenresView, CategoryView } from "@/views";

export default function AllGenresIndexClient() {
  const searchParams = useSearchParams();
  const id = useMemo(() => searchParams.get("id"), [searchParams]);

  if (id?.trim()) {
    const raw = decodeURIComponent(id);
    return <CategoryView categorySlug={raw} type="genre" />;
  }

  return <AllGenresView />;
}
