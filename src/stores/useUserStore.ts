import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

// Safe localStorage wrapper — swallows QuotaExceededError so a large avatar
// or profile payload doesn't crash the whole app.
const safeLocalStorage = {
  getItem: (name: string) => {
    try { return localStorage.getItem(name); } catch { return null; }
  },
  setItem: (name: string, value: string) => {
    try { localStorage.setItem(name, value); } catch { /* quota exceeded — skip */ }
  },
  removeItem: (name: string) => {
    try { localStorage.removeItem(name); } catch { /* ignore */ }
  },
};

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
      // Only persist the lightweight identity fields — exclude avatar/profilePicture
      // (may be base64 data URLs) which can exceed the ~5 MB localStorage quota.
      partialize: (state) => ({
        user: state.user
          ? {
              id: state.user.id,
              email: state.user.email,
              firstName: state.user.firstName,
              lastName: state.user.lastName,
              penName: state.user.penName,
              authorId: state.user.authorId,
              readerId: state.user.readerId,
              isEmailVerified: state.user.isEmailVerified,
              isPremium: state.user.isPremium,
              premiumExpiresAt: state.user.premiumExpiresAt,
            }
          : null,
      }),
    }
  )
);
