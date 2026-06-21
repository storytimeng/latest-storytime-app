"use client";

import { AmbassadorWelcomeView } from "@/views/ambassador";
import { DesktopAmbassadorShell } from "./DesktopAmbassadorShell";

export function DesktopAmbassadorWelcomeView() {
  return (
    <DesktopAmbassadorShell showNav={false}>
      <AmbassadorWelcomeView />
    </DesktopAmbassadorShell>
  );
}
