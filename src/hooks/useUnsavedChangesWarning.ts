import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/showNotification";

interface UseUnsavedChangesWarningOptions {
  hasUnsavedChanges: boolean;
  onSave?: () => void;
  message?: string;
}

/**
 * Hook to warn users about unsaved changes when navigating away
 * - Shows browser warning on tab close/refresh
 * - Interrupts navigation within the app
 * - Caches data before allowing navigation
 */
export function useUnsavedChangesWarning({
  hasUnsavedChanges,
  onSave,
  message = "You have unsaved changes. Your work will be saved to cache, but you may lose some progress. Are you sure you want to leave?",
}: UseUnsavedChangesWarningOptions) {
  const router = useRouter();
  const isNavigatingRef = useRef(false);

  // Browser beforeunload event (tab close/refresh)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Cache data before page unload
        if (onSave) {
          onSave();
        }

        // Standard way to trigger browser warning
        e.preventDefault();
        e.returnValue = message; // Most browsers will show a generic message
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, onSave, message]);

  // Navigation interception for in-app navigation
  const confirmNavigation = useCallback(() => {
    if (!hasUnsavedChanges || isNavigatingRef.current) {
      return true;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(message);

    if (confirmed && onSave) {
      // Cache data before navigation
      onSave();
      showToast({
        type: "success",
        message: "Your changes have been saved to cache",
      });
      isNavigatingRef.current = true;
      return true;
    }

    return confirmed;
  }, [hasUnsavedChanges, message, onSave]);

  return { confirmNavigation };
}
