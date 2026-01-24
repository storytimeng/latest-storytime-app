import { create } from "zustand";

export type SupportViewType = "faqs" | "terms" | "privacy" | "support";

interface SupportStore {
  isOpen: boolean;
  view: SupportViewType;
  openModal: (view?: SupportViewType) => void;
  closeModal: () => void;
  setView: (view: SupportViewType) => void;
}

export const useSupportStore = create<SupportStore>((set) => ({
  isOpen: false,
  view: "faqs",
  openModal: (view = "faqs") => set({ isOpen: true, view }),
  closeModal: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}));
