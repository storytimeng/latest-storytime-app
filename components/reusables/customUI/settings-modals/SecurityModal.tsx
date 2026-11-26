"use client";

import React, { useEffect, useState } from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Switch } from "@heroui/switch";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { ensureValidToken } from "@/src/lib/tokenManager";
import { getApiBaseUrl } from "@/src/lib/apiBase";
import { showToast } from "@/lib/showNotification";

const SecurityModal = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotificationsEnabled, setLoginNotificationsEnabled] =
    useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await ensureValidToken();
        if (!token) return;
        const res = await fetch(`${getApiBaseUrl()}/users/preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const prefs = json?.data ?? json;
        if (!cancelled && prefs) {
          setTwoFactorEnabled(Boolean(prefs.twoFactorEnabled));
          setLoginNotificationsEnabled(
            prefs.loginNotificationsEnabled !== false,
          );
        }
      } catch {
        // Keep defaults on error
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updatePreference = async (
    patch: Partial<{
      twoFactorEnabled: boolean;
      loginNotificationsEnabled: boolean;
    }>,
  ) => {
    setIsSaving(true);
    try {
      const token = await ensureValidToken();
      if (!token) throw new Error("Please log in again");
      const res = await fetch(`${getApiBaseUrl()}/users/preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        throw new Error("Failed to update security preferences");
      }
      const json = await res.json();
      const prefs = json?.data ?? json;
      setTwoFactorEnabled(Boolean(prefs.twoFactorEnabled));
      setLoginNotificationsEnabled(prefs.loginNotificationsEnabled !== false);
      showToast({ type: "success", message: "Security settings updated" });
    } catch (err: any) {
      showToast({
        type: "error",
        message: err?.message || "Could not update security settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <ModalHeader>
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>Security</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-4">
          <p className={`text-grey-2 ${Magnetik_Regular.className}`}>
            Manage your security settings and privacy preferences.
          </p>
          <div className="flex justify-between items-center gap-4">
            <div>
              <span className={`block ${Magnetik_Medium.className}`}>
                Two-Factor Authentication (Email OTP)
              </span>
              <span className={`text-xs text-grey-2 ${Magnetik_Regular.className}`}>
                Require a 6-digit code sent to your email when logging in
              </span>
            </div>
            <Switch
              size="sm"
              color="warning"
              isDisabled={isLoading || isSaving}
              isSelected={twoFactorEnabled}
              onValueChange={(val) => {
                setTwoFactorEnabled(val);
                void updatePreference({ twoFactorEnabled: val });
              }}
            />
          </div>
          <div className="flex justify-between items-center gap-4">
            <div>
              <span className={`block ${Magnetik_Medium.className}`}>
                Login Notifications
              </span>
              <span className={`text-xs text-grey-2 ${Magnetik_Regular.className}`}>
                Get notified via email & push on new device logins
              </span>
            </div>
            <Switch
              size="sm"
              color="warning"
              isDisabled={isLoading || isSaving}
              isSelected={loginNotificationsEnabled}
              onValueChange={(val) => {
                setLoginNotificationsEnabled(val);
                void updatePreference({ loginNotificationsEnabled: val });
              }}
            />
          </div>
        </div>
      </ModalBody>
    </>
  );
};

export default SecurityModal;
