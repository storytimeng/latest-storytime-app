"use client";

import { AmbassadorShareView } from "@/views/ambassador";
import { DesktopAmbassadorShell } from "./DesktopAmbassadorShell";

export function DesktopAmbassadorShareView() {
  return (
    <DesktopAmbassadorShell>
      <div className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
        <AmbassadorShareView />
      </div>
    </DesktopAmbassadorShell>
  );
}
