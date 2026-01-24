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
import { SETUP_CONFIG, SETUP_STEPS } from "@/config/setup";
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

  // Hash management
  const getStepFromHash = useCallback(() => {
    if (typeof window === "undefined") return 1;
    const hash = window.location.hash.slice(1);
    const foundStep = SETUP_STEPS.find((s) => s.hashId === hash);
    return foundStep ? foundStep.id : 1;
  }, []);

  const updateHash = useCallback((stepId: number) => {
    const s = SETUP_STEPS.find((s) => s.id === stepId);
    if (s && typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${s.hashId}`);
    }
  }, []);


  // Sync with hash on mount and on hash change
  useEffect(() => {
    const s = getStepFromHash();
    if (s !== step) {
      setStep(s);
    }
    // Set initial hash if empty
    if (typeof window !== "undefined" && !window.location.hash) {
      updateHash(1);
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const newStep = getStepFromHash();
      if (newStep !== step) {
        setDirection(newStep > step ? "forward" : "backward");
        setStep(newStep);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [step, getStepFromHash]);

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
      // If we have a preview URL that's a blob, it shouldn't be sent to the backend
      let finalProfilePicture = imagePreview?.startsWith("blob:") ? undefined : imagePreview;

      // Check if we have a pending upload trigger
      if (activeUploadTrigger) {
          try {
              const uploadedUrl = await activeUploadTrigger();
              if (uploadedUrl) {
                  finalProfilePicture = uploadedUrl;
              }
          } catch (error) {
              console.error("Failed to upload profile picture during setup:", error);
              // If upload fails and we don't have a previous remote URL, we should probably not send the blob
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

    // Step navigation (modified to sync hash)
    const nextStepFunc = async () => {
      setDirection("forward");
      setIsTransitioning(true);
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (step < 6) {
        const nextStep = step + 1;
        setStep(nextStep);
        updateHash(nextStep);
      }
      setIsTransitioning(false);
    };

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
    await nextStepFunc();
  }, [step, penName, penStatus, checkPenName, submitSetupMutation, updateHash]);

  /**
   * Navigate to previous step
   */
  const goBack = useCallback(async () => {
    if (step > 1) {
      setDirection("backward");
      setIsTransitioning(true);
      await new Promise((resolve) => setTimeout(resolve, 150));
      const prevStep = step - 1;
      setStep(prevStep);
      updateHash(prevStep);
      setIsTransitioning(false);
    }
  }, [step, updateHash]);

  /**
   * Skip current step (for optional steps)
   */
  const skipStep = useCallback(async () => {
    setDirection("forward");
    setIsTransitioning(true);
    await new Promise((resolve) => setTimeout(resolve, 150));
    if (step < 6) {
      const nextStep = step + 1;
      setStep(nextStep);
      updateHash(nextStep);
    }
    setIsTransitioning(false);
  }, [step, updateHash]);

  const goToStep = useCallback(
    async (stepId: number) => {
      // Only allow going back or to next step if current step is validated
      // For now, let's keep it simple and allow going back freely
      if (stepId === step) return;
      if (stepId > step && !canContinue()) return;

      setDirection(stepId > step ? "forward" : "backward");
      setIsTransitioning(true);
      await new Promise((resolve) => setTimeout(resolve, 150));
      setStep(stepId);
      updateHash(stepId);
      setIsTransitioning(false);
    },
    [step, updateHash, canContinue]
  );

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
    goToStep,
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
