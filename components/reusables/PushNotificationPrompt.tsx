"use client";

import React, { useEffect, useState } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@heroui/button";
import { usePushSubscription } from "@/src/hooks/usePushSubscription";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { getPermissionState } from "@/lib/push/client";
import { ensureValidToken } from "@/src/lib/tokenManager";
import { getApiBaseUrl } from "@/src/lib/apiBase";
import { showToast } from "@/lib/showNotification";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";

const SNOOZE_KEY = "storytime_push_prompt_snooze_until";
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

interface PushNotificationPromptProps {
  /** Always show (e.g. inside Notifications tab or after saving reading/writing time). */
  forceShow?: boolean;
  /** Custom title/message for contextual prompts. */
  title?: string;
  description?: string;
  className?: string;
}

export const PushNotificationPrompt: React.FC<PushNotificationPromptProps> = ({
  forceShow = false,
  title = "Stay updated with notifications",
  description = "Get notified about story updates, replies, and your daily reading & writing reminders.",
  className = "",
}) => {
  const { isAuthenticated } = useAuthStore();
  const { permission, isSubscribed, isLoading, subscribe } =
    usePushSubscription();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!forceShow && typeof window !== "undefined") {
      try {
        const snoozeUntil = Number(localStorage.getItem(SNOOZE_KEY) || 0);
        if (snoozeUntil > Date.now()) {
          setDismissed(true);
        }
      } catch {
        // Ignore storage errors
      }
    }
  }, [forceShow]);

  if (!mounted || !isAuthenticated()) return null;
  if (permission === "unsupported") return null;
  if (permission === "granted" && isSubscribed) return null;
  if (!forceShow && (dismissed || permission === "denied")) return null;

  const handleEnable = async () => {
    await subscribe();
    const currentPerm = getPermissionState();
    if (currentPerm === "granted") {
      try {
        const token = await ensureValidToken();
        if (token) {
          await fetch(`${getApiBaseUrl()}/users/preferences`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ pushNotificationsEnabled: true }),
          });
        }
      } catch {
        // Non-fatal preference sync failure
      }
      showToast({
        type: "success",
        message: "Notifications enabled!",
      });
      setDismissed(true);
    } else if (currentPerm === "denied") {
      showToast({
        type: "error",
        message:
          "Notifications are blocked by your browser. Please allow them in site settings.",
      });
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    } catch {
      // Ignore storage errors
    }
    setDismissed(true);
  };

  if (permission === "denied") {
    return (
      <div
        className={`flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 ${className}`}
      >
        <BellOff className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-xs text-amber-800 leading-relaxed">
          <p className={Magnetik_Bold.className}>Notifications are blocked</p>
          <p className={Magnetik_Regular.className}>
            Allow notifications for this site in your browser settings to
            receive reminders and story alerts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-complimentary-colour/30 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3 pr-6 sm:pr-0">
        <div className="w-9 h-9 rounded-full bg-complimentary-colour/15 flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-complimentary-colour" />
        </div>
        <div>
          <h4
            className={`text-sm text-primary-colour ${Magnetik_Bold.className}`}
          >
            {title}
          </h4>
          <p
            className={`text-xs text-primary-shade-3 mt-0.5 leading-relaxed ${Magnetik_Regular.className}`}
          >
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {!forceShow && (
          <Button
            size="sm"
            variant="light"
            onPress={handleDismiss}
            className={`text-xs text-primary-shade-3 ${Magnetik_Medium.className}`}
          >
            Later
          </Button>
        )}
        <Button
          size="sm"
          isLoading={isLoading}
          onPress={handleEnable}
          className={`bg-complimentary-colour text-white text-xs px-4 ${Magnetik_Medium.className}`}
        >
          Enable
        </Button>
      </div>

      {!forceShow && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss notification prompt"
          className="sm:hidden absolute top-2.5 right-2.5 text-primary-shade-3 hover:text-primary-colour p-1"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
