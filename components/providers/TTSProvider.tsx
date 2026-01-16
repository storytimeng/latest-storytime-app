"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useSpeech } from "react-text-to-speech";
import { useTTSStore, estimateReadingDuration } from "@/src/stores/useTTSStore";

// Preferred voice names in order of preference
const PREFERRED_VOICES = [
  "Microsoft Libby Online",
  "Microsoft Sonia Online",
  "Google UK English Female",
  "Google UK English Male",
];

const EN_GB_PATTERN = /en[-_]GB/i;

interface TTSContextValue {
  // Speech controls
  Text: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
  speechStatus: string;
  start: () => void;
  pause: () => void;
  stop: () => void;
  
  // State
  isPlaying: boolean;
  isPaused: boolean;
  isStopped: boolean;
  
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
  
  // Flags
  isSupported: boolean;
}

const TTSContext = createContext<TTSContextValue | null>(null);

interface TTSProviderProps {
  children: ReactNode;
  content: string;
}

export const TTSProvider: React.FC<TTSProviderProps> = ({ children, content }) => {
  const store = useTTSStore();
  const [availableVoices, setAvailableVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoiceState] = React.useState<SpeechSynthesisVoice | null>(null);
  
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  
  // Calculate word count and estimated duration
  const wordCount = React.useMemo(() => {
    const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return plainText.split(/\s+/).filter((w) => w.length > 0).length;
  }, [content]);
  
  const estimatedDuration = React.useMemo(
    () => estimateReadingDuration(wordCount, store.playbackRate),
    [wordCount, store.playbackRate]
  );
  
  // Load voices
  React.useEffect(() => {
    if (!isSupported) return;
    
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      if (!selectedVoice && voices.length > 0) {
        // Try preferred voices
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
        
        // Try en-GB online
        const enGBOnline = voices.find(
          (v) => EN_GB_PATTERN.test(v.lang) && v.name.includes("Online")
        );
        if (enGBOnline) {
          setSelectedVoiceState(enGBOnline);
          store.setSelectedVoiceURI(enGBOnline.voiceURI);
          return;
        }
        
        // Try any en-GB
        const enGB = voices.find((v) => EN_GB_PATTERN.test(v.lang));
        if (enGB) {
          setSelectedVoiceState(enGB);
          store.setSelectedVoiceURI(enGB.voiceURI);
          return;
        }
        
        // Fallback
        setSelectedVoiceState(voices[0]);
        store.setSelectedVoiceURI(voices[0].voiceURI);
      } else if (store.selectedVoiceURI) {
        const saved = voices.find((v) => v.voiceURI === store.selectedVoiceURI);
        if (saved) setSelectedVoiceState(saved);
      }
    };
    
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [isSupported, store.selectedVoiceURI]);
  
  // Create text node for react-text-to-speech
  const textNode = React.useMemo(() => {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }, [content]);
  
  // Use react-text-to-speech
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
        padding: "2px 4px",
        transition: "background-color 0.2s ease",
      },
    },
  });
  
  // Sync speech status with store
  React.useEffect(() => {
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
  React.useEffect(() => {
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
  
  // Progress
  const progress = React.useMemo(() => {
    if (estimatedDuration === 0) return 0;
    return Math.min(100, (store.elapsedSeconds / estimatedDuration) * 100);
  }, [store.elapsedSeconds, estimatedDuration]);
  
  // Controls
  const start = React.useCallback(() => startSpeech(), [startSpeech]);
  const pause = React.useCallback(() => pauseSpeech(), [pauseSpeech]);
  const stop = React.useCallback(() => {
    stopSpeech();
    store.setElapsedSeconds(0);
  }, [stopSpeech, store]);
  
  const setSelectedVoice = React.useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoiceState(voice);
    store.setSelectedVoiceURI(voice.voiceURI);
  }, [store]);
  
  const value: TTSContextValue = {
    Text,
    speechStatus,
    start,
    pause,
    stop,
    
    isPlaying: speechStatus === "started",
    isPaused: speechStatus === "paused",
    isStopped: speechStatus === "stopped",
    
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
    
    isSupported,
  };
  
  return <TTSContext.Provider value={value}>{children}</TTSContext.Provider>;
};

export const useTTSContext = (): TTSContextValue => {
  const context = useContext(TTSContext);
  if (!context) {
    throw new Error("useTTSContext must be used within a TTSProvider");
  }
  return context;
};

// Optional hook for checking if TTS is available outside provider
export const useTTSAvailable = (): boolean => {
  return typeof window !== "undefined" && "speechSynthesis" in window;
};
