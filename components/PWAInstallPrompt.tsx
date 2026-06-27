"use client";

import React, { useEffect, useState } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetik_Bold } from "@/lib/font";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// iOS detection helpers (skill: SKILL.md → Install Prompt Handling)
const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !(window as any).MSStream;

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true);

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      return; // Already installed, don't show anything.
    }

    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed =
        (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 5000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // iOS path: no beforeinstallprompt; show manual-instructions banner.
    if (isIOS()) {
      setTimeout(() => setShowIOSBanner(true), 3000);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
      localStorage.setItem("pwa-install-dismissed", new Date().toISOString());
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", new Date().toISOString());
  };

  const handleIOSDismiss = () => {
    setShowIOSBanner(false);
    localStorage.setItem("pwa-install-dismissed", new Date().toISOString());
  };

  // Android / Chrome / Edge with native install prompt.
  if (showPrompt && deferredPrompt) {
    return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9998] animate-slide-up">
      <div className="bg-universal-white rounded-lg shadow-2xl border border-light-grey-2 p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-grey-2 hover:text-primary-colour"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="w-12 h-12 bg-complimentary-colour rounded-lg flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "text-primary-colour text-sm font-bold mb-1",
                Magnetik_Bold.className
              )}
            >
              Install Storytime App
            </h3>
            <p className="text-grey-2 text-xs mb-3">
              Install our app for quick access and offline reading
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleInstall}
                className="bg-complimentary-colour text-white hover:bg-complimentary-colour/90 flex-1"
              >
                Install
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-grey-2"
              >
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  }

  // iOS Safari / WebKit: no native prompt, show manual-instructions banner.
  if (showIOSBanner) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9998] animate-slide-up">
        <div className="bg-universal-white rounded-lg shadow-2xl border border-light-grey-2 p-4">
          <button
            onClick={handleIOSDismiss}
            className="absolute top-2 right-2 text-grey-2 hover:text-primary-colour"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="w-12 h-12 bg-complimentary-colour rounded-lg flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "text-primary-colour text-sm font-bold mb-1",
                  Magnetik_Bold.className
                )}
              >
                Install Storytime App
              </h3>
              <p className="text-grey-2 text-xs mb-2">
                Tap the <strong>Share</strong> button below, then choose{" "}
                <strong>Add to Home Screen</strong>.
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleIOSDismiss}
                className="text-grey-2"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
