"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  getAmbassadorRoutes,
  type AmbassadorRouteHelpers,
  type AmbassadorShell,
} from "@/lib/ambassadorRoutes";
import { storytimeShellFromPathname } from "@/config/desktopRoutes";

type AmbassadorRoutesContextValue = {
  shell: AmbassadorShell;
  routes: AmbassadorRouteHelpers;
};

const AmbassadorRoutesContext =
  createContext<AmbassadorRoutesContextValue | null>(null);

type AmbassadorRoutesProviderProps = {
  shell?: AmbassadorShell;
  children: ReactNode;
};

export function AmbassadorRoutesProvider({
  shell = "mobile",
  children,
}: AmbassadorRoutesProviderProps) {
  const value = useMemo(
    () => ({
      shell,
      routes: getAmbassadorRoutes(shell),
    }),
    [shell],
  );

  return (
    <AmbassadorRoutesContext.Provider value={value}>
      {children}
    </AmbassadorRoutesContext.Provider>
  );
}

function ambassadorShellFromPathname(pathname: string): AmbassadorShell {
  return storytimeShellFromPathname(pathname) === "desktop"
    ? "desktop"
    : "mobile";
}

export function useAmbassadorRoutes(): AmbassadorRouteHelpers {
  const context = useContext(AmbassadorRoutesContext);
  const pathname = usePathname();

  // Pathname fallback only applies when no provider context is mounted.
  const pathnameRoutes = useMemo(() => {
    if (!pathname) return null;
    return getAmbassadorRoutes(ambassadorShellFromPathname(pathname));
  }, [pathname]);

  if (context) return context.routes;
  if (pathnameRoutes) return pathnameRoutes;

  return getAmbassadorRoutes("mobile");
}
