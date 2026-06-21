"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  getAmbassadorRoutes,
  type AmbassadorRouteHelpers,
  type AmbassadorShell,
} from "@/lib/ambassadorRoutes";
import { storytimeShellFromPathname } from "@/config/desktopRoutes";

const AmbassadorRoutesContext = createContext<AmbassadorRouteHelpers | null>(
  null,
);

type AmbassadorRoutesProviderProps = {
  shell?: AmbassadorShell;
  children: ReactNode;
};

export function AmbassadorRoutesProvider({
  shell = "mobile",
  children,
}: AmbassadorRoutesProviderProps) {
  const routes = useMemo(() => getAmbassadorRoutes(shell), [shell]);

  return (
    <AmbassadorRoutesContext.Provider value={routes}>
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

  const pathnameRoutes = useMemo(
    () => getAmbassadorRoutes(ambassadorShellFromPathname(pathname ?? "/")),
    [pathname],
  );

  return context ?? pathnameRoutes;
}
