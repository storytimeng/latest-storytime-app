"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAmbassadorOverview } from "@/src/hooks/useAmbassador";
import { useAmbassadorRoutes } from "@/components/ambassador/AmbassadorRoutesProvider";
import type { AmbassadorOverview } from "@/src/lib/ambassadors";

function getRedirectPath(
  overview: AmbassadorOverview,
  routes: ReturnType<typeof useAmbassadorRoutes>,
): string {
  if (overview.application?.status === "pending") {
    return routes.status;
  }
  if (overview.application?.status === "declined") {
    return routes.declined;
  }
  return routes.hub;
}

export function useRequireAmbassador() {
  const router = useRouter();
  const routes = useAmbassadorRoutes();
  const { overview, isLoading, error } = useAmbassadorOverview();

  useEffect(() => {
    if (isLoading) return;
    if (overview?.isAmbassador) return;
    router.replace(overview ? getRedirectPath(overview, routes) : routes.hub);
  }, [isLoading, overview, router, routes]);

  return {
    isLoading,
    isAmbassador: overview?.isAmbassador ?? false,
    error,
  };
}
