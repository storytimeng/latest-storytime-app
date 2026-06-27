"use client";

import { useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushSubscription } from "@/src/hooks/usePushSubscription";
import { showToast } from "@/lib/showNotification";
import { cn } from "@/lib/utils";

interface EnableNotificationsProps {
  /** Optional userId to associate the subscription with on the backend. */
  userId?: string | null;
  /** Override the default API base (defaults to "/api"). */
  apiBase?: string;
  className?: string;
  /** Render as a small inline toggle (used in settings rows) vs. a full-width CTA. */
  variant?: "row" | "cta";
}

/**
 * UI for opting the user into Web Push notifications.
 *
 * - If the browser doesn't support push, the component renders nothing.
 * - If the user has denied permission, we show an explanatory row.
 * - Otherwise, a single button toggles the subscription.
 */
export const EnableNotifications = ({
  userId,
  apiBase,
  className,
  variant = "row",
}: EnableNotificationsProps) => {
  const { permission, isSubscribed, isLoading, error, subscribe, unsubscribe } =
    usePushSubscription({ apiBase, userId });

  // Surface errors via toast when they change.
  useEffect(() => {
    if (error) {
      showToast({ type: "error", message: error, duration: 4000 });
    }
  }, [error]);

  if (permission === "unsupported") return null;

  if (permission === "denied") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 text-grey-2 text-sm",
          variant === "cta" && "flex-col items-start gap-2",
          className,
        )}
      >
        <BellOff className="w-4 h-4 shrink-0" />
        <span>
          Notifications are blocked. Enable them in your browser&apos;s site
          settings to receive updates.
        </span>
      </div>
    );
  }

  const Icon = isSubscribed ? Bell : BellOff;
  const label = isLoading
    ? "Working..."
    : isSubscribed
      ? "Disable Notifications"
      : "Enable Notifications";

  return (
    <Button
      variant={variant === "cta" ? "primary" : "bordered"}
      onClick={() => (isSubscribed ? unsubscribe() : subscribe())}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2",
        variant === "cta" && "w-full justify-center",
        className,
      )}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      {label}
    </Button>
  );
};