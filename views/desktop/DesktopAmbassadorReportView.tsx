"use client";

import { AmbassadorReportView } from "@/views/ambassador";
import { DesktopAmbassadorShell } from "./DesktopAmbassadorShell";

export function DesktopAmbassadorReportView() {
  return (
    <DesktopAmbassadorShell>
      <div className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
        <AmbassadorReportView />
      </div>
    </DesktopAmbassadorShell>
  );
}
