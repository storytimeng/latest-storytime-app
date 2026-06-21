"use client";

import { AmbassadorBreakdownView } from "@/views/ambassador";
import { DesktopAmbassadorShell } from "./DesktopAmbassadorShell";

export function DesktopAmbassadorBreakdownView() {
  return (
    <DesktopAmbassadorShell>
      <div className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
        <AmbassadorBreakdownView />
      </div>
    </DesktopAmbassadorShell>
  );
}
