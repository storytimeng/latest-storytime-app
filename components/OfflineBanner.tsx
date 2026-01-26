/**
 * Global Offline Banner Component
 * Displays sync status and offline notification
 */

"use client";

import React from "react";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";
import { useOfflineQueue } from "@/src/hooks/useOfflineQueue";
import { CloudOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const OfflineBanner = () => {
  const isOnline = useOnlineStatus();
  const { queuedCount, isSyncing } = useOfflineQueue();

  if (isOnline && queuedCount === 0) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] px-4 py-2 flex items-center justify-between transition-all duration-300 animate-in slide-in-from-top",
        isOnline ? "bg-green-500" : "bg-orange-500"
      )}
    >
      <div className="flex items-center gap-3 text-white">
        {!isOnline ? (
          <CloudOff className="w-4 h-4" />
        ) : (
          <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
        )}
        <span className="text-xs font-medium">
          {!isOnline 
            ? `Offline - ${queuedCount > 0 ? `${queuedCount} changes pending` : "Reading only"}`
            : isSyncing 
              ? "Synchronizing your changes..." 
              : "Connection restored - Syncing..."}
        </span>
      </div>

      {isSyncing && (
        <div className="flex items-center gap-2 text-white/80">
          <RefreshCw className="w-3 h-3 animate-spin" />
        </div>
      )}
      
      {isOnline && !isSyncing && queuedCount === 0 && (
         <div className="flex items-center gap-2 text-white">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-medium">Synced!</span>
         </div>
      )}
    </div>
  );
};
