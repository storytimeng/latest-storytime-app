"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAmbassadorOverview } from "@/src/hooks/useAmbassador";

function getRedirectPath(
  overview: NonNullable<ReturnType<typeof useAmbassadorOverview>["overview"]>,
): string {
  if (overview.application?.status === "pending") {
    return "/ambassador/status";
  }
  if (overview.application?.status === "declined") {
    return "/ambassador/declined";
  }
  return "/ambassador";
}

export function useRequireAmbassador() {
  const router = useRouter();
  const { overview, isLoading, error } = useAmbassadorOverview();

  useEffect(() => {
    if (isLoading) return;
    if (overview?.isAmbassador) return;
    router.replace(overview ? getRedirectPath(overview) : "/ambassador");
  }, [isLoading, overview, router]);

  return {
    isLoading,
    isAmbassador: overview?.isAmbassador ?? false,
    error,
  };
}
