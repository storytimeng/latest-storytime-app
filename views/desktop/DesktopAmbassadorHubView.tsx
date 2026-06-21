"use client";

import AmbassadorIntroView from "@/views/ambassador/ambassadorIntroView";
import { DesktopAmbassadorShell } from "./DesktopAmbassadorShell";

export function DesktopAmbassadorHubView() {
  return (
    <DesktopAmbassadorShell showNav={false}>
      <AmbassadorIntroView />
    </DesktopAmbassadorShell>
  );
}
