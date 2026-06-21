"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import {
  getAmbassadorRoutes,
  type AmbassadorRouteHelpers,
  type AmbassadorShell,
} from "@/lib/ambassadorRoutes";

const AmbassadorRoutesContext = createContext<AmbassadorRouteHelpers>(
  getAmbassadorRoutes("mobile"),
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

export function useAmbassadorRoutes(): AmbassadorRouteHelpers {
  return useContext(AmbassadorRoutesContext);
}
