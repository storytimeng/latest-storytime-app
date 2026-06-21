"use client";

import AmbassadorLeaderboardView from "@/views/ambassador/ambassadorLeaderboardView";
import { DesktopAmbassadorShell } from "./DesktopAmbassadorShell";

export function DesktopAmbassadorLeaderboardView() {
  return (
    <DesktopAmbassadorShell>
      <div className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
        <AmbassadorLeaderboardView variant="desktop" />
      </div>
    </DesktopAmbassadorShell>
  );
}
