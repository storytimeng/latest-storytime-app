/**
 * Custom hook for setup flow
 * Handles all business logic, state management, and API integration
 * Following the pattern established in useAuth.ts
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWRMutation from "swr/mutation";

import {
  usersControllerCheckPenNameAvailability,
  usersControllerSetupProfile,
} from "../client/sdk.gen";
import { SETUP_CONFIG } from "@/config/setup";
import type {
  TimeValue,
  AnimationDirection,
  PenNameStatus,
  DayPreset,
  SetupFormData,
} from "@/components/setup/types";
import { showToast } from "@/lib/showNotification";

/**
 * Format TimeValue to API-compatible string (e.g., "06:45 AM")
 */
function formatTime(t: TimeValue): string {
  const mm = t.minute.toString().padStart(2, "0");
  return `${t.hour}:${mm} ${t.period}`;
}

/**
 * Format reminder based on daily flag and selected days
 */
function formatReminder(writeDaily: boolean, writeDays: string[]): string {
  if (writeDaily) {
    return "daily";
  }
  
  // Check if it's Mon-Fri
  if (
    writeDays.length === 5 &&
    writeDays.includes("Monday") &&
    writeDays.includes("Tuesday") &&
    writeDays.includes("Wednesday") &&
    writeDays.includes("Thursday") &&
    writeDays.includes("Friday")
  ) {
    return "mon-fri";
  }
  
  // Custom days - return comma-separated lowercase
  return writeDays.map((d) => d.toLowerCase()).join(",");
}

export function useSetup() {
  const router = useRouter();

  // Step navigation
  const [step, setStep] = useState<number>(1);
  const [direction, setDirection] = useState<AnimationDirection>("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Form data
  const [penName, setPenName] = useState("");
  const [penStatus, setPenStatus] = useState<PenNameStatus>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeUploadTrigger, setActiveUploadTrigger] = useState<(() => Promise<string | null>) | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [readTime, setReadTime] = useState<TimeValue>({
    hour: 6,
    minute: 45,
    period: "AM",
  });
  const [writeTime, setWriteTime] = useState<TimeValue>({
    hour: 6,
    minute: 45,
    period: "AM",
  });
  const [writeDaily, setWriteDaily] = useState(false);
  const [writeDays, setWriteDays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ]);
  const [dayPreset, setDayPreset] = useState<DayPreset>("Mon to Fri");

  // Time picker options (memoized)
  const timeOptions = useMemo(
    () => ({
      hours: Array.from({ length: 12 }, (_, i) => i + 1),
      minutes: Array.from({ length: 60 }, (_, i) => i),
      periods: ["AM", "PM"] as const,
    }),
    []
  );

  /**
   * Check pen name availability
   * Uses SWR mutation for proper loading/error states
   */
  const { trigger: triggerCheckPenName, isMutating: isCheckingPenName } = useSWRMutation(
    "check-pen-name",
    async (_key: string, { arg }: { arg: string }) => {
      const response = await usersControllerCheckPenNameAvailability({
        query: { penName: arg },
      });

      if (response.error) {
        throw response.error;
      }

      return response.data;
    }
  );

  const checkPenName = useCallback(async () => {
    const name = penName.trim();
    if (!name) return false;

    setPenStatus("checking");

    try {
      const data = await triggerCheckPenName(name);
      
      // Handle potential nested data structure from API
      // The API might return { data: { available: true } } instead of just { available: true }
      const result = (data as any).data || data;
      console.log("Pen name check response:", data, "Parsed result:", result);

      if (result?.available) {
        setPenStatus("available");
        return true;
      } else {
        setPenStatus("taken");
        return false;
      }
    } catch (error) {
      console.error("Error checking pen name:", error);
      setPenStatus("idle");
      return false;
    }
  }, [penName, triggerCheckPenName]);

  // Debounced pen name checking
  useEffect(() => {
    if (penName.trim().length >= SETUP_CONFIG.validation.minPenNameLength) {
      const timeoutId = setTimeout(() => {
        checkPenName();
      }, SETUP_CONFIG.validation.penNameDebounceMs);

      return () => clearTimeout(timeoutId);
    } else {
      setPenStatus("idle");
    }
  }, [penName, checkPenName]);

  /**
   * Submit profile setup
   * Uses SWR mutation for proper loading/error states
   */
  const submitSetupMutation = useSWRMutation(
    "submit-setup",
    async () => {
      let finalProfilePicture = imagePreview;

      // Check if we have a pending upload trigger
      if (activeUploadTrigger) {
          try {
              const uploadedUrl = await activeUploadTrigger();
              if (uploadedUrl) {
                  finalProfilePicture = uploadedUrl;
              }
          } catch (error) {
              console.error("Failed to upload profile picture during setup:", error);
              // We could throw here or continue with the preview URL (which might fail on backend if it expects a remote URL)
              // For now, let's assume we proceed and let backend handle validation or it just won't update the pic
          }
      }

      const reminder = formatReminder(writeDaily, writeDays);

      const response = await usersControllerSetupProfile({
        body: {
          penName: penName.trim(),
          profilePicture: finalProfilePicture || undefined,
          genres: selectedGenres,
          timeToRead: formatTime(readTime),
          timeToWrite: formatTime(writeTime),
          reminder: reminder,
        },
      });

      if (response.error) {
        throw response.error;
      }

      return response.data;
    }
  );

  /**
   * Validation logic for each step
   */
  const canContinue = useCallback(() => {
    switch (step) {
      case 1:
        return (
          penName.trim().length >= SETUP_CONFIG.validation.minPenNameLength &&
          (penStatus === "available" || penStatus === "idle")
        );
      case 2:
        return true; // optional image
      case 3:
        return selectedGenres.length >= SETUP_CONFIG.validation.minGenres;
      case 4:
        return true; // any valid time
      case 5:
        return writeDaily || writeDays.length > 0;
      case 6:
        return true; // preview
      default:
        return true;
    }
  }, [step, penName, penStatus, selectedGenres, writeDaily, writeDays]);

  /**
   * Navigate to next step
   */
  const goNext = useCallback(async () => {
    // Step 1: Validate pen name
    if (step === 1) {
      if (
        penStatus === "idle" &&
        penName.trim().length >= SETUP_CONFIG.validation.minPenNameLength
      ) {
        const isAvailable = await checkPenName();
        if (!isAvailable) return;
      }
      if (penStatus === "taken") return;
    }

    // Step 6: Submit setup
    if (step === 6) {
      try {
        await submitSetupMutation.trigger();
        // Move to completion step
        setDirection("forward");
        setIsTransitioning(true);
        await new Promise((resolve) => setTimeout(resolve, 150));
        setStep(7);
        setIsTransitioning(false);
      } catch (error) {
        console.error("Error submitting setup:", error);
        showToast({
          type: "error",
          message: "Failed to setup profile. Please try again.",
          duration: 3000,
        });
        setIsTransitioning(false);
      }
      return;
    }

    // Normal step progression
    setDirection("forward");
    setIsTransitioning(true);
    await new Promise((resolve) => setTimeout(resolve, 150));
    if (step < 6) setStep(step + 1);
    setIsTransitioning(false);
  }, [step, penName, penStatus, checkPenName, submitSetupMutation]);

  /**
   * Navigate to previous step
   */
  const goBack = useCallback(async () => {
    if (step > 1) {
      setDirection("backward");
      setIsTransitioning(true);
      await new Promise((resolve) => setTimeout(resolve, 150));
      setStep(step - 1);
      setIsTransitioning(false);
    }
  }, [step]);

  /**
   * Skip current step (for optional steps)
   */
  const skipStep = useCallback(async () => {
    setDirection("forward");
    setIsTransitioning(true);
    await new Promise((resolve) => setTimeout(resolve, 150));
    if (step < 6) setStep(step + 1);
    setIsTransitioning(false);
  }, [step]);

  /**
   * Complete setup and navigate to home
   */
  const completeSetup = useCallback(() => {
    router.push(SETUP_CONFIG.routes.onComplete);
  }, [router]);

  /**
   * Keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && canContinue()) {
        goNext();
      } else if (e.key === "Escape" && step > 1) {
        goBack();
      }
    },
    [canContinue, goNext, goBack, step]
  );

  /**
   * Genre toggle
   */
  const toggleGenre = useCallback((genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }, []);

  /**
   * Day toggle
   */
  const toggleDay = useCallback((day: string) => {
    setWriteDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }, []);

  /**
   * Apply day preset
   */
  const applyDayPreset = useCallback((preset: DayPreset) => {
    setDayPreset(preset);
    if (preset === "Mon to Fri") {
      setWriteDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    }
  }, []);

  return {
    // Step navigation
    step,
    direction,
    isTransitioning,
    goNext,
    goBack,
    skipStep,
    completeSetup,
    canContinue: canContinue(),
    handleKeyDown,

    // Form data
    penName,
    setPenName,
    penStatus,
    checkPenName,
    imagePreview,
    setImagePreview,
    selectedGenres,
    toggleGenre,
    readTime,
    setReadTime,
    writeTime,
    setWriteTime,
    writeDaily,
    setWriteDaily,
    writeDays,
    setWriteDays,
    toggleDay,
    dayPreset,
    applyDayPreset,

    // Utilities
    timeOptions,
    
    // Loading states
    isCheckingPenName: isCheckingPenName,
    isSubmitting: submitSetupMutation.isMutating,

    // Upload support
    setUploadTrigger: setActiveUploadTrigger,
  };
}
