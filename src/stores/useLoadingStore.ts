import { create } from "zustand";

interface LoadingState {
  isVisible: boolean;
  message: string;
  autoHide: boolean;
  duration: number;
  timerId: NodeJS.Timeout | null;
}

interface LoadingActions {
  show: (message?: string, options?: { autoHide?: boolean; duration?: number }) => void;
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

  // Actions
  show: (message = "Please wait...", options = {}) => {
    const { autoHide = false, duration = 3000 } = options;
    
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
    });
  },

  setMessage: (message: string) => {
    set({ message });
  },
}));
