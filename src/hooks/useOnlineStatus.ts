"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect online/offline status
 * Returns true when online, false when offline
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    // Handler for when connection comes back
    const handleOnline = () => {
      setIsOnline(true);
      console.log("🟢 Network connection restored");
    };

    // Handler for when connection is lost
    const handleOffline = () => {
      setIsOnline(false);
      console.log("🔴 Network connection lost");
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
