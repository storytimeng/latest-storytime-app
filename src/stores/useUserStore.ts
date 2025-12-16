import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      name: "user-storage", // unique name for localStorage
    }
  )
);
