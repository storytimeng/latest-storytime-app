import React from "react";
import { WifiOff } from "lucide-react";
import { Magnetik_Medium } from "@/lib/font";

export const OfflineBanner = React.memo(() => {
  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-yellow-500/90 backdrop-blur-sm px-4 py-2 z-50 flex items-center justify-center gap-2">
      <WifiOff size={16} className="text-white" />
      <p className={`text-white text-xs ${Magnetik_Medium.className}`}>
        Reading Offline
      </p>
    </div>
  );
});

OfflineBanner.displayName = "OfflineBanner";
