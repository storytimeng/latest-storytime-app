"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TTSVoice {
  name: string;
  lang: string;
  voiceURI: string;
  default: boolean;
}

export interface TTSState {
  // Playback state
  isPlaying: boolean;
  isPaused: boolean;
  currentSentenceIndex: number;
  currentWordIndex: number;

  // Settings (persisted)
  playbackRate: number;
  pitch: number;
  volume: number;
  selectedVoiceURI: string | null;

  // Content state
  totalSentences: number;
  estimatedDurationSeconds: number;
  elapsedSeconds: number;

  // Premium state (stub until API ready)
  isPremium: boolean;

  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  setPlaying: (isPlaying: boolean) => void;
  setPaused: (isPaused: boolean) => void;
  setCurrentSentenceIndex: (index: number) => void;
  setCurrentWordIndex: (index: number) => void;
  seekToSentence: (index: number) => void;
  setPlaybackRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  setSelectedVoiceURI: (voiceURI: string | null) => void;
  setTotalSentences: (count: number) => void;
  setEstimatedDuration: (seconds: number) => void;
  setElapsedSeconds: (seconds: number) => void;
  setIsPremium: (isPremium: boolean) => void;
  reset: () => void;
}

const initialState = {
  isPlaying: false,
  isPaused: false,
  currentSentenceIndex: 0,
  currentWordIndex: 0,
  playbackRate: 1,
  pitch: 1,
  volume: 1,
  selectedVoiceURI: null,
  totalSentences: 0,
  estimatedDurationSeconds: 0,
  elapsedSeconds: 0,
  isPremium: true, // Default to true until premium API is ready
};

export const useTTSStore = create<TTSState>()(
  persist(
    (set) => ({
      ...initialState,

      play: () => set({ isPlaying: true, isPaused: false }),
      pause: () => set({ isPlaying: false, isPaused: true }),
      stop: () =>
        set({
          isPlaying: false,
          isPaused: false,
          currentSentenceIndex: 0,
          currentWordIndex: 0,
          elapsedSeconds: 0,
        }),

      setPlaying: (isPlaying) => set({ isPlaying }),
      setPaused: (isPaused) => set({ isPaused }),
      setCurrentSentenceIndex: (index) => set({ currentSentenceIndex: index }),
      setCurrentWordIndex: (index) => set({ currentWordIndex: index }),

      seekToSentence: (index) =>
        set({
          currentSentenceIndex: index,
          currentWordIndex: 0,
        }),

      setPlaybackRate: (rate) => set({ playbackRate: rate }),
      setPitch: (pitch) => set({ pitch: pitch }),
      setVolume: (volume) => set({ volume: volume }),
      setSelectedVoiceURI: (voiceURI) => set({ selectedVoiceURI: voiceURI }),
      setTotalSentences: (count) => set({ totalSentences: count }),
      setEstimatedDuration: (seconds) =>
        set({ estimatedDurationSeconds: seconds }),
      setElapsedSeconds: (seconds) => set({ elapsedSeconds: seconds }),
      setIsPremium: (isPremium) => set({ isPremium }),

      reset: () => set(initialState),
    }),
    {
      name: "tts-storage",
      partialize: (state) => ({
        // Only persist user preferences, not playback state
        playbackRate: state.playbackRate,
        pitch: state.pitch,
        volume: state.volume,
        selectedVoiceURI: state.selectedVoiceURI,
      }),
    }
  )
);

// Playback rate options
export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// Helper to get formatted rate label
export const getPlaybackRateLabel = (rate: number) => `${rate}x`;

// Utility to estimate reading duration
export const estimateReadingDuration = (
  wordCount: number,
  playbackRate: number = 1
): number => {
  const wordsPerMinute = 150 * playbackRate; // Average TTS speaking rate
  return Math.ceil((wordCount / wordsPerMinute) * 60);
};

// Format seconds to MM:SS
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
