"use client";

import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";
import { useOfflineQueue } from "@/src/hooks/useOfflineQueue";
import { CloudOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

/**
 * Global, layout-level status banner.
 *
 * Mounted once by <OfflineManager /> inside the root layout so it does not
 * appear "inside" any specific page or cover page content. The banner is
 * intentionally:
 *   - Thinline (~28px) and pinned to the very top of the viewport.
 *   - `pointer-events-none` on the wrapper so it never intercepts taps; the
 *     inner pill re-enables pointer events so it stays dismissible.
 *   - Hidden entirely when the network is up and the queue is empty.
 *
 * Two states surface a banner:
 *   1. Offline (orange) — shows count of pending offline actions if any.
 *   2. Reconnecting / syncing (green) — until the queue drains.
 */
export const OfflineBanner = React.memo(() => {
  const isOnline = useOnlineStatus();
  const { queuedCount, isSyncing } = useOfflineQueue();

  if (isOnline && queuedCount === 0 && !isSyncing) return null;

  const variant = !isOnline ? "offline" : isSyncing ? "syncing" : "synced";

  const bg = {
    offline: "bg-orange-500",
    syncing: "bg-blue-500",
    synced: "bg-green-500",
  }[variant];

  const label = !isOnline
    ? queuedCount > 0
      ? `Offline · ${queuedCount} pending`
      : "Offline"
    : isSyncing
      ? "Syncing offline changes…"
      : "Synced";

  const Icon = !isOnline ? CloudOff : isSyncing ? RefreshCw : CheckCircle2;

  return (
    <div
      role="status"
      aria-live="polite"
      // Outer wrapper: pass clicks through to the page below.
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center px-2 pt-1"
    >
      <div
        className={cn(
          // Inner pill: stop clicks from falling through so the banner is
          // still discoverable but doesn't block content beneath it.
          "pointer-events-auto inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium text-white shadow-md",
          bg,
        )}
      >
        <Icon
          className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")}
          aria-hidden
        />
        <span className="leading-none">{label}</span>
      </div>
    </div>
  );
});

OfflineBanner.displayName = "OfflineBanner";
