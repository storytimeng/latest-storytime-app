"use client";

import React from "react";
import { WifiOff } from "lucide-react";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";

export function OfflineIndicator() {
  const router = useRouter();

  const handleGoToDownloads = () => {
    router.push("/library?tab=downloads");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Offline Icon */}
      <div className="w-20 h-20 bg-accent-colour rounded-full flex items-center justify-center mb-6">
        <WifiOff className="w-10 h-10 text-primary-shade-3" />
      </div>

      {/* Title */}
      <h2
        className={`text-xl text-primary-colour text-center mb-2 ${Magnetik_Bold.className}`}
      >
        You're Offline
      </h2>

      {/* Description */}
      <p
        className={`text-sm text-primary-shade-3 text-center mb-8 max-w-sm ${Magnetik_Regular.className}`}
      >
        No internet connection detected. You can still access your downloaded
        stories and continue reading offline.
      </p>

      {/* Action Button */}
      <Button
        onClick={handleGoToDownloads}
        className={`bg-complimentary-colour text-white px-8 py-3 rounded-full hover:opacity-90 transition-opacity ${Magnetik_Bold.className}`}
      >
        View My Downloads
      </Button>

      {/* Additional Info */}
      <p
        className={`text-xs text-primary-shade-4 text-center mt-6 ${Magnetik_Regular.className}`}
      >
        Your connection will be restored automatically when you're back online
      </p>
    </div>
  );
}
