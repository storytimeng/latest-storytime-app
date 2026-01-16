"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSpeech } from "react-text-to-speech";
import {
  useTTSStore,
  estimateReadingDuration,
} from "@/src/stores/useTTSStore";

export interface Sentence {
  text: string;
  index: number;
  startOffset: number;
  endOffset: number;
}

// Split text into sentences for tracking
export const parseSentences = (text: string): Sentence[] => {
  // Remove HTML tags for counting
  const plainText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  const sentenceRegex = /[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g;
  const matches = plainText.match(sentenceRegex) || [plainText];

  let offset = 0;
  return matches.map((sentence, index) => {
    const trimmed = sentence.trim();
    const startOffset = offset;
    offset += sentence.length;
    return {
      text: trimmed,
      index,
      startOffset,
      endOffset: offset,
    };
  });
};

// Calculate word count from text
export const countWords = (text: string): number => {
  const plainText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return plainText.split(/\s+/).filter((w) => w.length > 0).length;
};

// Preferred voice names in order of preference
const PREFERRED_VOICES = [
  "Microsoft Libby Online", // Microsoft Libby (UK English)
  "Microsoft Sonia Online", // Microsoft Sonia (UK English)
  "Google UK English Female",
  "Google UK English Male",
];

// Fallback pattern for en-GB voices
const EN_GB_PATTERN = /en[-_]GB/i;

export interface UseTTSReturn {
  // State
  isPlaying: boolean;
  isPaused: boolean;
  isStopped: boolean;
  speechStatus: string;

  // Controls
  start: () => void;
  pause: () => void;
  stop: () => void;
  resume: () => void;

  // Settings
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
  volume: number;
  setVolume: (volume: number) => void;

  // Voices
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;

  // Duration
  estimatedDuration: number;
  elapsedSeconds: number;
  progress: number;
  totalSentences: number;
  currentSentenceIndex: number;

  // Content
  Text: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;

  // Flags
  isSupported: boolean;

  // Seeking
  seekToSentence: (index: number) => void;
}

/**
 * Hook that wraps react-text-to-speech with Microsoft Libby as default voice
 * and proper HTML content handling with sentence highlighting
 */
export const useTTS = (content: string): UseTTSReturn => {
  const store = useTTSStore();
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [selectedVoice, setSelectedVoiceState] =
    useState<SpeechSynthesisVoice | null>(null);

  // Check if Web Speech API is supported
  const isSupported = useMemo(() => {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }, []);

  // Parse content into sentences for tracking
  const sentences = useMemo(() => parseSentences(content), [content]);
  
  // Calculate word count and duration
  const wordCount = useMemo(() => countWords(content), [content]);
  const estimatedDuration = useMemo(
    () => estimateReadingDuration(wordCount, store.playbackRate),
    [wordCount, store.playbackRate]
  );

  // Load available voices and select default
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // If no voice selected yet, try to find preferred voice
      if (!selectedVoice && voices.length > 0) {
        // First try preferred voices in order
        for (const preferredName of PREFERRED_VOICES) {
          const found = voices.find((v) =>
            v.name.toLowerCase().includes(preferredName.toLowerCase())
          );
          if (found) {
            setSelectedVoiceState(found);
            store.setSelectedVoiceURI(found.voiceURI);
            return;
          }
        }

        // Then try any en-GB online voice
        const enGBOnline = voices.find(
          (v) => EN_GB_PATTERN.test(v.lang) && v.name.includes("Online")
        );
        if (enGBOnline) {
          setSelectedVoiceState(enGBOnline);
          store.setSelectedVoiceURI(enGBOnline.voiceURI);
          return;
        }

        // Then try any en-GB voice
        const enGB = voices.find((v) => EN_GB_PATTERN.test(v.lang));
        if (enGB) {
          setSelectedVoiceState(enGB);
          store.setSelectedVoiceURI(enGB.voiceURI);
          return;
        }

        // Finally fall back to first available voice
        setSelectedVoiceState(voices[0]);
        store.setSelectedVoiceURI(voices[0].voiceURI);
      } else if (store.selectedVoiceURI) {
        // Restore saved voice
        const saved = voices.find(
          (v) => v.voiceURI === store.selectedVoiceURI
        );
        if (saved) {
          setSelectedVoiceState(saved);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [isSupported, store.selectedVoiceURI]);

  // Convert HTML content to React nodes for the library
  const textNode = useMemo(() => {
    // Create a wrapper div with the HTML content
    // The library will traverse and read all text content
    return (
      <div dangerouslySetInnerHTML={{ __html: content }} />
    );
  }, [content]);

  // Use the react-text-to-speech hook
  const {
    Text,
    speechStatus,
    start: startSpeech,
    pause: pauseSpeech,
    stop: stopSpeech,
  } = useSpeech({
    text: textNode,
    pitch: store.pitch,
    rate: store.playbackRate,
    volume: store.volume,
    voiceURI: selectedVoice?.voiceURI,
    highlightText: true,
    highlightMode: "sentence",
    highlightProps: {
      style: {
        backgroundColor: "var(--complimentary-shade-1)",
        borderRadius: "4px",
        padding: "2px 0",
      },
    },
  });

  // Track speech status changes
  useEffect(() => {
    if (speechStatus === "started") {
      store.setPlaying(true);
      store.setPaused(false);
    } else if (speechStatus === "paused") {
      store.setPlaying(false);
      store.setPaused(true);
    } else if (speechStatus === "stopped") {
      store.setPlaying(false);
      store.setPaused(false);
    }
  }, [speechStatus]);

  // Elapsed time tracking
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (speechStatus === "started") {
      interval = setInterval(() => {
        store.setElapsedSeconds(store.elapsedSeconds + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [speechStatus, store.elapsedSeconds]);

  // Calculate progress
  const progress = useMemo(() => {
    if (estimatedDuration === 0) return 0;
    return Math.min(100, (store.elapsedSeconds / estimatedDuration) * 100);
  }, [store.elapsedSeconds, estimatedDuration]);

  // Control wrappers
  const start = useCallback(() => {
    startSpeech();
  }, [startSpeech]);

  const pause = useCallback(() => {
    pauseSpeech();
  }, [pauseSpeech]);

  const stop = useCallback(() => {
    stopSpeech();
    store.setElapsedSeconds(0);
    store.setCurrentSentenceIndex(0);
  }, [stopSpeech, store]);

  const resume = useCallback(() => {
    // react-text-to-speech uses start() for both initial start and resume
    startSpeech();
  }, [startSpeech]);

  const setSelectedVoice = useCallback(
    (voice: SpeechSynthesisVoice) => {
      setSelectedVoiceState(voice);
      store.setSelectedVoiceURI(voice.voiceURI);
    },
    [store]
  );

  // Seeking to sentence (limited support - restart from beginning for now)
  const seekToSentence = useCallback(
    (index: number) => {
      // The library doesn't expose direct seeking, so we track the index
      store.setCurrentSentenceIndex(index);
      // Calculate approximate elapsed time
      const avgTimePerSentence = estimatedDuration / (sentences.length || 1);
      store.setElapsedSeconds(Math.floor(index * avgTimePerSentence));
    },
    [store, estimatedDuration, sentences.length]
  );

  return {
    isPlaying: speechStatus === "started",
    isPaused: speechStatus === "paused",
    isStopped: speechStatus === "stopped",
    speechStatus,

    start,
    pause,
    stop,
    resume,

    playbackRate: store.playbackRate,
    setPlaybackRate: store.setPlaybackRate,
    pitch: store.pitch,
    setPitch: store.setPitch,
    volume: store.volume,
    setVolume: store.setVolume,

    availableVoices,
    selectedVoice,
    setSelectedVoice,

    estimatedDuration,
    elapsedSeconds: store.elapsedSeconds,
    progress,
    totalSentences: sentences.length,
    currentSentenceIndex: store.currentSentenceIndex,

    Text,
    isSupported,
    seekToSentence,
  };
};
