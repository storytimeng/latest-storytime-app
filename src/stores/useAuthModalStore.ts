import { create } from "zustand";

export type AuthViewType = "login" | "signup" | "forgot-password" | "otp";

interface AuthModalStore {
  isOpen: boolean;
  view: AuthViewType;
  openModal: (view?: AuthViewType) => void;
  closeModal: () => void;
  setView: (view: AuthViewType) => void;
}

export const useAuthModalStore = create<AuthModalStore>((set) => ({
  isOpen: false,
  view: "login",
  openModal: (view = "login") => set({ isOpen: true, view }),
  closeModal: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}));
