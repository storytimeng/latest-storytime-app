"use client";

import React, { useEffect, useState } from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";
import { showToast } from "@/lib/showNotification";

interface UpdateInfo {
  kind: "loading" | "not-native" | "up-to-date" | "available" | "blocked" | "error";
  currentVersion?: string;
  latestVersion?: string;
  message?: string;
  downloadUrl?: string;
}

export const CheckUpdateModal: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    kind: "loading",
  });
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    checkForUpdate();
  }, []);

  const checkForUpdate = async () => {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    if (!cap?.isNativePlatform?.()) {
      setUpdateInfo({
        kind: "not-native",
        message: "Check for updates is only available in the mobile app.",
      });
      return;
    }

    try {
      const { CapacitorUpdater } = await import("@capgo/capacitor-updater");
      const current = await CapacitorUpdater.current();
      const latest = await CapacitorUpdater.getLatest();

      if (latest.kind === "up_to_date" || !latest.url) {
        setUpdateInfo({
          kind: "up-to-date",
          currentVersion: current.bundle.version,
          message: latest.message || "You're on the latest version!",
        });
      } else if (latest.kind === "blocked") {
        setUpdateInfo({
          kind: "blocked",
          currentVersion: current.bundle.version,
          latestVersion: latest.version,
          message:
            latest.message || "A breaking update is available. Please update from the app store.",
        });
      } else {
        setUpdateInfo({
          kind: "available",
          currentVersion: current.bundle.version,
          latestVersion: latest.version,
          downloadUrl: latest.url,
          message: latest.comment || "",
        });
      }
    } catch (err) {
      setUpdateInfo({
        kind: "error",
        message: "Failed to check for updates. Please try again later.",
      });
    }
  };

  const handleDownload = async () => {
    if (!updateInfo.downloadUrl || !updateInfo.latestVersion) return;

    setDownloading(true);
    try {
      const { CapacitorUpdater } = await import("@capgo/capacitor-updater");
      const bundle = await CapacitorUpdater.download({
        url: updateInfo.downloadUrl,
        version: updateInfo.latestVersion,
      });
      await CapacitorUpdater.set(bundle);
      // App will reload automatically
    } catch {
      showToast({
        type: "error",
        message: "❌ Download failed. Please try again.",
        duration: 3000,
      });
      setDownloading(false);
    }
  };

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>Check for Updates</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="py-6 text-center">
          {updateInfo.kind === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary-colour border-t-transparent rounded-full animate-spin" />
              <p className={`text-grey-3 ${Magnetik_Regular.className}`}>
                Checking for updates…
              </p>
            </div>
          )}

          {updateInfo.kind === "not-native" && (
            <div className="flex flex-col items-center gap-3">
              <span className="text-5xl">📱</span>
              <p className={`text-grey-3 ${Magnetik_Regular.className}`}>
                {updateInfo.message}
              </p>
            </div>
          )}

          {updateInfo.kind === "up-to-date" && (
            <div className="flex flex-col items-center gap-3">
              <span className="text-5xl">✅</span>
              <p className={`text-lg ${Magnetik_Bold.className} text-primary-colour`}>
                You&apos;re up to date!
              </p>
              {updateInfo.currentVersion && (
                <p className={`text-sm text-grey-3 ${Magnetik_Regular.className}`}>
                  Version {updateInfo.currentVersion}
                </p>
              )}
              <p className={`text-sm text-grey-3 mt-1 ${Magnetik_Regular.className}`}>
                {updateInfo.message}
              </p>
            </div>
          )}

          {updateInfo.kind === "available" && (
            <div className="flex flex-col items-center gap-3">
              <span className="text-5xl">📦</span>
              <p className={`text-lg ${Magnetik_Bold.className} text-primary-colour`}>
                Update Available
              </p>
              <div className="space-y-1">
                <p className={`text-sm text-grey-3 ${Magnetik_Regular.className}`}>
                  Current: v{updateInfo.currentVersion}
                </p>
                <p className={`text-sm font-semibold text-primary-colour ${Magnetik_Regular.className}`}>
                  Latest: v{updateInfo.latestVersion}
                </p>
              </div>
              {updateInfo.message && (
                <p className={`text-sm text-grey-3 ${Magnetik_Regular.className}`}>
                  {updateInfo.message}
                </p>
              )}
              <Button
                color="primary"
                className="mt-2 px-6"
                isLoading={downloading}
                onPress={handleDownload}
              >
                {downloading ? "Downloading…" : "Download & Install"}
              </Button>
            </div>
          )}

          {updateInfo.kind === "blocked" && (
            <div className="flex flex-col items-center gap-3">
              <span className="text-5xl">🚧</span>
              <p className={`text-lg ${Magnetik_Bold.className} text-primary-colour`}>
                Major Update Required
              </p>
              {updateInfo.latestVersion && (
                <p className={`text-sm text-grey-3 ${Magnetik_Regular.className}`}>
                  v{updateInfo.latestVersion} is available
                </p>
              )}
              <p className={`text-sm text-grey-3 ${Magnetik_Regular.className}`}>
                {updateInfo.message}
              </p>
            </div>
          )}

          {updateInfo.kind === "error" && (
            <div className="flex flex-col items-center gap-3">
              <span className="text-5xl">❌</span>
              <p className={`text-grey-3 ${Magnetik_Regular.className}`}>
                {updateInfo.message}
              </p>
              <Button
                color="primary"
                variant="light"
                className="mt-2"
                onPress={checkForUpdate}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </ModalBody>
    </>
  );
};
