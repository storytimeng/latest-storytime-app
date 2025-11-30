import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StoriesFilterState {
  selectedGenres: string[];
  searchQuery: string;
  sortBy: "recent" | "popular" | "trending";
}

interface StoriesFilterActions {
  setSelectedGenres: (genres: string[]) => void;
  toggleGenre: (genre: string) => void;
  clearGenres: () => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: "recent" | "popular" | "trending") => void;
  reset: () => void;
}

type StoriesFilterStore = StoriesFilterState & StoriesFilterActions;

const initialState: StoriesFilterState = {
  selectedGenres: [],
  searchQuery: "",
  sortBy: "recent",
};

export const useStoriesFilterStore = create<StoriesFilterStore>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedGenres: (genres) => set({ selectedGenres: genres }),

      toggleGenre: (genre) =>
        set((state) => ({
          selectedGenres: state.selectedGenres.includes(genre)
            ? state.selectedGenres.filter((g) => g !== genre)
            : [...state.selectedGenres, genre],
        })),

      clearGenres: () => set({ selectedGenres: [] }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSortBy: (sort) => set({ sortBy: sort }),

      reset: () => set(initialState),
    }),
    {
      name: "stories-filter-storage",
    }
  )
);
