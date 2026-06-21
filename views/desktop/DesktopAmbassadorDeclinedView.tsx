"use client";

import { AmbassadorDeclinedView } from "@/views/ambassador";
import { DesktopAmbassadorShell } from "./DesktopAmbassadorShell";

export function DesktopAmbassadorDeclinedView() {
  return (
    <DesktopAmbassadorShell showNav={false}>
      <AmbassadorDeclinedView />
    </DesktopAmbassadorShell>
  );
}
