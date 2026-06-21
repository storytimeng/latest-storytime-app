"use client";

import { AmbassadorStatusView } from "@/views/ambassador";
import { DesktopAmbassadorShell } from "./DesktopAmbassadorShell";

export function DesktopAmbassadorStatusView() {
  return (
    <DesktopAmbassadorShell showNav={false}>
      <AmbassadorStatusView />
    </DesktopAmbassadorShell>
  );
}
