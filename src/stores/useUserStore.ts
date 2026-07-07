import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";

const safeLocalStorage: StateStorage = {
  getItem: (name) => localStorage.getItem(name),
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      if (
        e instanceof DOMException &&
        (e.name === "QuotaExceededError" || e.code === 22)
      ) {
        console.warn(
          `localStorage quota exceeded writing "${name}", skipping persist`,
        );
        return;
      }
      throw e;
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
};
export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  penName?: string;
  profilePicture?: string;
  avatar?: string; // Alternative to profilePicture
  bio?: string;
  genres?: string[];
  favoriteGenres?: string[]; // User's favorite genres
  timeToRead?: string;
  timeToWrite?: string;
  reminder?: string;
  isEmailVerified?: boolean;
  authorId?: string;
  readerId?: string;
  createdAt?: string;
  isPremium?: boolean;
  premiumExpiresAt?: string | null;
}

interface UserState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        user: state.user
          ? {
              id: state.user.id,
              email: state.user.email,
              penName: state.user.penName,
              firstName: state.user.firstName,
              lastName: state.user.lastName,
              avatar: state.user.avatar,
              profilePicture: state.user.profilePicture,
              isPremium: state.user.isPremium,
            }
          : null,
      }),
    },
  ),
);
