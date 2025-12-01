"use client";

import React, { useState, useEffect } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { showToast } from "@/lib/showNotification";

interface PWAProviderProps {
  children: React.ReactNode;
}

export const PWAProvider = ({ children }: PWAProviderProps) => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    // Only show splash in PWA mode or first visit
    const hasSeenSplash = sessionStorage.getItem("splash-shown");

    if (!isPWA && hasSeenSplash) {
      setShowSplash(false);
      setIsAppReady(true);
    }

    // Register service worker update handler
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New content is available
                showToast({type:"info",message:"New version available! Refresh to update.", 
                  duration: 5000,
                });
              }
            });
          }
        });
      });

      // Handle controller change (when new SW takes over)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!isAppReady) return;

        showToast({message:"App updated successfully!", type:"info"});
      });
    }

    // Track PWA install
    window.addEventListener("appinstalled", () => {
      showToast({type:"success",message:"App installed! You can now use it offline.", 
        duration: 5000,
      });
    });

    return () => {
      window.removeEventListener("appinstalled", () => {});
    };
  }, [isAppReady]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setIsAppReady(true);
    sessionStorage.setItem("splash-shown", "true");
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {children}
    </>
  );
};
