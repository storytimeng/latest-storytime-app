import { create } from 'zustand';

interface ReadingHistoryItem {
  id: string;
  story: any;
  storyId: string;
  userId: string;
  createdAt: string;
}

interface ReadingHistoryStore {
  history: ReadingHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  setHistory: (data: {
    history: ReadingHistoryItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }) => void;
  clearHistory: () => void;
}

export const useReadingHistoryStore = create<ReadingHistoryStore>((set) => ({
  history: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  setHistory: (data) => set(data),
  clearHistory: () => set({ history: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
}));
