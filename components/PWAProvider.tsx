"use client";

import React, { useState, useEffect } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { showToast } from "@/lib/showNotification";
import { requestPersistentStorage } from "@/lib/backgroundSync";
import { IS_ANDROID } from "@/lib/platform";
interface PWAProviderProps {
  children: React.ReactNode;
}

export const PWAProvider = ({ children }: PWAProviderProps) => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [minSplashTimePassed, setMinSplashTimePassed] = useState(false);
  const minDisplayTime = 1200; // ms, can adjust as needed
  // Add to PWAProvider.tsx, inside the component, as a new useEffect:

  useEffect(() => {
    if (!IS_ANDROID) return;

    let backButtonListener: any;

    const setupBackButton = async () => {
      const { App } = await import("@capacitor/app");

      backButtonListener = await App.addListener(
        "backButton",
        ({ canGoBack }) => {
          // canGoBack reflects Capacitor's own WebView history check.
          // Since navigation now uses window.location.assign/replace (real
          // document loads), browser history is populated normally, so
          // history.back() correctly moves to the previous real page.
          if (canGoBack || window.history.length > 1) {
            window.history.back();
          } else {
            App.exitApp();
          }
        },
      );
    };

    void setupBackButton();

    return () => {
      backButtonListener?.remove();
    };
  }, []);
  // Hide splash when both app is ready and min time passed
  useEffect(() => {
    if (isAppReady && minSplashTimePassed) {
      setShowSplash(false);
      sessionStorage.setItem("splash-shown", "true");
    }
  }, [isAppReady, minSplashTimePassed]);

  // Mark app as ready after hydration + wire up update toasts.
  // (Service worker registration itself is handled by <SerwistProvider>
  // in app/layout.tsx - it serves /serwist/sw.js.)
  useEffect(() => {
    // Check if running as PWA
    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    const hasSeenSplash = sessionStorage.getItem("splash-shown");
    if (hasSeenSplash) {
      setShowSplash(false);
      setIsAppReady(true);
      setMinSplashTimePassed(true);
      return;
    }

    // Mark app as ready after hydration (next tick)
    setIsAppReady(true);

    // Request persistent storage to reduce data eviction risk.
    requestPersistentStorage();

    // Listen for SW updates so we can prompt the user.
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!isAppReady) return;
        showToast({ message: "App updated successfully!", type: "info" });
      });

      navigator.serviceWorker.getRegistration().then((registration) => {
        if (!registration) return;
        const onUpdateFound = () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              showToast({
                type: "info",
                message: "New version available! Refresh to update.",
                duration: 5000,
              });
            }
          });
        };
        registration.addEventListener("updatefound", onUpdateFound);
      });
    }

    // Track PWA install
    const onAppInstalled = () => {
      showToast({
        type: "success",
        message: "App installed! You can now use it offline.",
        duration: 5000,
      });
    };
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  // Minimum splash time
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinSplashTimePassed(true);
    }, minDisplayTime);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen minDisplayTime={0} />}{" "}
      {/* minDisplayTime handled here */}
      {children}
    </>
  );
};
