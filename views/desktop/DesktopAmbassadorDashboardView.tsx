"use client";

import AmbassadorDashboardView from "@/views/ambassador/ambassadorDashboardView";
import { DesktopAmbassadorShell } from "./DesktopAmbassadorShell";

export function DesktopAmbassadorDashboardView() {
  return (
    <DesktopAmbassadorShell>
      <AmbassadorDashboardView variant="desktop" />
    </DesktopAmbassadorShell>
  );
}
