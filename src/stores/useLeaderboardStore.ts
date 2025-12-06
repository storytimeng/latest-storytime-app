import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LeaderboardType = "readers" | "authors" | "time";

interface LeaderboardState {
  readers: any[];
  authors: any[];
  time: any[];
  lastUpdated: number;
  setLeaderboardData: (type: LeaderboardType, data: any[]) => void;
  setAllLeaderboardData: (data: { readers: any[]; authors: any[]; time: any[] }) => void;
}

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set) => ({
      readers: [],
      authors: [],
      time: [],
      lastUpdated: 0,
      setLeaderboardData: (type, data) =>
        set((state) => ({
          [type]: data,
          lastUpdated: Date.now(),
        })),
      setAllLeaderboardData: (data) =>
        set({
          readers: data.readers,
          authors: data.authors,
          time: data.time,
          lastUpdated: Date.now(),
        }),
    }),
    {
      name: "leaderboard-storage",
    }
  )
);
