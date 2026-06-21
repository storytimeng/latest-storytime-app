"use client";

import { AmbassadorApplicationView } from "@/views/ambassador";
import { DesktopAmbassadorShell } from "./DesktopAmbassadorShell";

export function DesktopAmbassadorApplicationView() {
  return (
    <DesktopAmbassadorShell showNav={false}>
      <AmbassadorApplicationView />
    </DesktopAmbassadorShell>
  );
}
