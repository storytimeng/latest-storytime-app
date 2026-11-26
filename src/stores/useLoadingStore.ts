import { create } from "zustand";

interface LoadingState {
  isVisible: boolean;
  message: string;
  autoHide: boolean;
  duration: number;
  timerId: NodeJS.Timeout | null;
  cancellable: boolean;
  cancelLabel: string;
  onCancel: (() => void) | null;
}

interface LoadingActions {
  show: (
    message?: string,
    options?: {
      autoHide?: boolean;
      duration?: number;
      cancellable?: boolean;
      cancelLabel?: string;
      onCancel?: () => void;
    },
  ) => void;
  hide: () => void;
  setMessage: (message: string) => void;
}

type LoadingStore = LoadingState & LoadingActions;

export const useLoadingStore = create<LoadingStore>((set, get) => ({
  // State
  isVisible: false,
  message: "Please wait...",
  autoHide: false,
  duration: 3000, // Default 3 seconds
  timerId: null,
  cancellable: true,
  cancelLabel: "Cancel",
  onCancel: null,

  // Actions
  show: (message = "Please wait...", options = {}) => {
    const {
      autoHide = false,
      duration = 3000,
      cancellable = true,
      cancelLabel = "Cancel",
      onCancel = null,
    } = options;
    
    // Clear any existing timer
    const currentTimerId = get().timerId;
    if (currentTimerId) {
      clearTimeout(currentTimerId);
    }

    // Set up new timer if autoHide is enabled
    let newTimerId: NodeJS.Timeout | null = null;
    if (autoHide) {
      newTimerId = setTimeout(() => {
        get().hide();
      }, duration);
    }

    set({
      isVisible: true,
      message,
      autoHide,
      duration,
      timerId: newTimerId,
      cancellable,
      cancelLabel,
      onCancel,
    });
  },

  hide: () => {
    const currentTimerId = get().timerId;
    if (currentTimerId) {
      clearTimeout(currentTimerId);
    }

    set({
      isVisible: false,
      timerId: null,
      onCancel: null,
    });
  },

  setMessage: (message: string) => {
    set({ message });
  },
}));
