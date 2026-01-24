"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTTSStore, estimateReadingDuration } from "@/src/stores/useTTSStore";

export interface Sentence {
  text: string;
  index: number;
  startOffset: number;
  endOffset: number;
  html?: string;
}

export interface TTSSegment {
  text: string;
  html?: string;
  index: number;
  startOffset: number;
  endOffset: number;
}

// Split text into sentences for highlighting
export const parseSentences = (text: string): Sentence[] => {
  if (!text) return [];

  // Remove HTML tags for TTS but preserve structure for display
  const plainText = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Split by sentence-ending punctuation
  const sentenceRegex = /[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g;
  const matches = plainText.match(sentenceRegex) || [plainText];

  let offset = 0;
  return matches
    .map((sentence, index) => {
      const trimmed = sentence.trim();
      if (!trimmed) return null;
      const startOffset = offset;
      offset += sentence.length;
      return {
        text: trimmed,
        index,
        startOffset,
        endOffset: offset,
      };
    })
    .filter((s): s is Sentence => s !== null);
};

export const countWords = (text: string): number => {
  const plainText = text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plainText.split(/\s+/).filter((w) => w.length > 0).length;
};

export interface UseTTSReturn {
  sentences: (Sentence | TTSSegment)[];
  isPlaying: boolean;
  isPaused: boolean;
  currentSentenceIndex: number;
  totalSentences: number;
  estimatedDuration: number;
  elapsedSeconds: number;
  progress: number;
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seekToSentence: (index: number) => void;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
  isSupported: boolean;
  isSpeaking: boolean;
}

type StopReason = "manual" | "auto" | "seek" | "settings-change";

export const useTTS = (content: string | TTSSegment[]): UseTTSReturn => {
  const store = useTTSStore();
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs for stable state access in callbacks
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stopReasonRef = useRef<StopReason>("manual");
  const pendingSeekIndexRef = useRef<number | null>(null);
  const currentSentenceRef = useRef<number>(0);

  const isSupported = useMemo(() => {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }, []);

  // Determine segments
  const sentences = useMemo(() => {
    if (Array.isArray(content)) {
      return content.map((s, i) => ({ ...s, index: i }));
    }
    return parseSentences(content);
  }, [content]);

  // Handle plain text conversion for Duration estimation
  const fullText = useMemo(() => {
    return sentences.map((s) => s.text).join(" ");
  }, [sentences]);

  const wordCount = useMemo(() => countWords(fullText), [fullText]);
  const estimatedDuration = useMemo(
    () => estimateReadingDuration(wordCount, store.playbackRate),
    [wordCount, store.playbackRate]
  );

  // Update store with sentence count and duration - using getState to avoid dependency issues
  useEffect(() => {
    const currentStore = useTTSStore.getState();
    if (currentStore.totalSentences !== sentences.length) {
      useTTSStore.getState().setTotalSentences(sentences.length);
    }
    if (currentStore.estimatedDurationSeconds !== estimatedDuration) {
      useTTSStore.getState().setEstimatedDuration(estimatedDuration);
    }
  }, [sentences.length, estimatedDuration]);

  // Smart voice selection logic
  const findBestVoice = useCallback((voices: SpeechSynthesisVoice[]) => {
    if (!voices.length) return null;

    const libby = voices.find(
      (v) => v.name.includes("Libby") && v.name.includes("Microsoft")
    );
    if (libby) return libby;

    const msNatural = voices.find(
      (v) =>
        v.name.includes("Microsoft") &&
        v.name.includes("Online") &&
        v.name.includes("Natural") &&
        v.lang.startsWith("en")
    );
    if (msNatural) return msNatural;

    const sonia = voices.find((v) => v.name.includes("Sonia"));
    if (sonia) return sonia;

    const britishOnline = voices.find(
      (v) =>
        v.lang === "en-GB" &&
        (v.name.includes("Online") || v.localService === false)
    );
    if (britishOnline) return britishOnline;

    const british = voices.find((v) => v.lang === "en-GB");
    if (british) return british;

    return (
      voices.find((v) => v.default && v.lang.startsWith("en")) || voices[0]
    );
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);

        const currentUri = useTTSStore.getState().selectedVoiceURI;
        const currentVoiceExists = voices.some(
          (v) => v.voiceURI === currentUri
        );

        if (!currentUri || !currentVoiceExists) {
          const bestVoice = findBestVoice(voices);
          if (bestVoice) {
            useTTSStore.getState().setSelectedVoiceURI(bestVoice.voiceURI);
          }
        }
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [isSupported, findBestVoice]);

  const selectedVoice = useMemo(() => {
    if (!store.selectedVoiceURI) return null;
    return (
      availableVoices.find((v) => v.voiceURI === store.selectedVoiceURI) || null
    );
  }, [availableVoices, store.selectedVoiceURI]);

  // Elapsed timer with speed adjustment
  const startElapsedTimer = useCallback(() => {
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);

    const updateInterval = 200; // Update every 200ms for smooth progress

    elapsedTimerRef.current = setInterval(() => {
      const currentState = useTTSStore.getState();
      if (currentState.isPlaying && !currentState.isPaused) {
        const increment = (updateInterval / 1000) * currentState.playbackRate;
        const newElapsed = Math.min(
          currentState.elapsedSeconds + increment,
          currentState.estimatedDurationSeconds
        );
        store.setElapsedSeconds(newElapsed);
      }
    }, updateInterval);
  }, [store]);

  const stopElapsedTimer = useCallback(() => {
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  }, []);

  // Directives State
  const directiveStateRef = useRef({
    rate: null as number | null,
    pitch: null as number | null,
    volume: null as number | null,
    delay: 0,
    skip: false,
  });

  // Core speak function - using ref to break circular dependency
  const speakSentenceRef = useRef<(index: number) => void>(() => {});

  const speakSentence = useCallback(
    (sentenceIndex: number) => {
      if (
        !isSupported ||
        sentenceIndex >= sentences.length ||
        sentenceIndex < 0
      ) {
        store.stop();
        stopElapsedTimer();
        setIsSpeaking(false);
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const sentence = sentences[sentenceIndex];
      if (!sentence) return;

      // Track current sentence in ref for onend handler
      currentSentenceRef.current = sentenceIndex;

      // Parse Directives
      let textToSpeak = sentence.text;
      
      // Regex to find all directives [[key=value]]
      const directiveRegex = /\[\[(.*?)=(.*?)\]\]/g;
      let match;
      
      // Reset temporary one-shot directives like delay? 
      // User docs: "The effect of a directive applies to the content that follows it."
      // "This means a directive in one chunk can affect subsequent chunks if not overridden."
      // So rate/pitch/volume persist. skip persists.
      // Delay? "Introduces a pause before the subsequent content is processed."
      // Usually delay is one-time for that spot. But if it's "before content", does it mean every sentence? 
      // "This will have a [[delay=500]] half-second pause." -> Pause then text.
      // If I have [[delay=500]] Sentence 1. Sentence 2.
      // Should Sentence 2 also delay? Probably not. Delay is usually an event.
      // I will treat delay as one-shot for the current sentence (if found).
      
      let localDelay = 0;

      // Reset one-shot directives from previous state if any? No, only delay is one-shot.
      
      // We process directives found in THIS sentence.
      // Note: If a directive is "at the end" of previous sentence, it might have been attached to that previous sentence text.
      // My splitter attaches everything to the sentence.
      
      while ((match = directiveRegex.exec(sentence.text)) !== null) {
          const key = match[1].trim();
          const value = match[2].trim();
          
          if (key === "rate") {
              if (value === "default") directiveStateRef.current.rate = null;
              else {
                  const num = parseFloat(value);
                  if (!isNaN(num)) directiveStateRef.current.rate = num;
              }
          } else if (key === "pitch") {
              if (value === "default") directiveStateRef.current.pitch = null;
              else {
                  const num = parseFloat(value);
                  if (!isNaN(num)) directiveStateRef.current.pitch = num;
              }
          } else if (key === "volume") {
             if (value === "default") directiveStateRef.current.volume = null;
             else {
                 const num = parseFloat(value);
                 if (!isNaN(num)) directiveStateRef.current.volume = num;
             }
          } else if (key === "delay") {
              const num = parseInt(value);
              if (!isNaN(num)) localDelay = num;
          } else if (key === "skip") {
              if (value === "true") directiveStateRef.current.skip = true;
              else if (value === "false") directiveStateRef.current.skip = false;
          }
      }
      
      // Remove directives from spoken text
      textToSpeak = textToSpeak.replace(/\[\[.*?\]\]/g, "").trim();

      // Check for SKIP
      if (directiveStateRef.current.skip) {
          // Move to next immediately
           const nextIdx = sentenceIndex + 1;
           // We use setTimeout to avoid recursion limit
           setTimeout(() => {
               speakSentenceRef.current(nextIdx);
           }, 10);
           return;
      }

      // Get fresh state for settings
      const currentState = useTTSStore.getState();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Apply directives or fall back to store
      utterance.rate = directiveStateRef.current.rate !== null ? directiveStateRef.current.rate : currentState.playbackRate;
      utterance.pitch = directiveStateRef.current.pitch !== null ? directiveStateRef.current.pitch : currentState.pitch;
      utterance.volume = directiveStateRef.current.volume !== null ? directiveStateRef.current.volume : currentState.volume;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        store.setCurrentSentenceIndex(sentenceIndex);
        store.setPlaying(true);
        store.setPaused(false);
        startElapsedTimer();
      };

      utterance.onend = () => {
        const reason = stopReasonRef.current;
        const currentIdx = currentSentenceRef.current;

        // Handle seek - jump to pending index
        if (reason === "seek" && pendingSeekIndexRef.current !== null) {
          const targetIndex = pendingSeekIndexRef.current;
          pendingSeekIndexRef.current = null;
          stopReasonRef.current = "auto";
          speakSentenceRef.current(targetIndex);
          return;
        }

        // Handle settings change - restart from current sentence
        if (reason === "settings-change") {
          stopReasonRef.current = "auto";
          speakSentenceRef.current(currentIdx);
          return;
        }

        // Normal end - continue to next sentence
        const freshState = useTTSStore.getState();
        if (reason === "auto" && freshState.isPlaying && !freshState.isPaused) {
          if (currentIdx < sentences.length - 1) {
            speakSentenceRef.current(currentIdx + 1);
          } else {
            // Finished all sentences
            store.stop();
            stopElapsedTimer();
            setIsSpeaking(false);
          }
        } else {
          setIsSpeaking(false);
        }
      };

      utterance.onerror = (event) => {
        // Ignore interrupted/canceled errors (happens during seek/settings change)
        if (event.error === "interrupted" || event.error === "canceled") {
          return;
        }
        console.error("TTS Error:", event);
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      stopReasonRef.current = "auto";

      // Apply Delay if needed
      if (localDelay > 0) {
          setTimeout(() => {
              if (stopReasonRef.current === "auto" || stopReasonRef.current === "seek") {
                  window.speechSynthesis.speak(utterance);
              }
          }, localDelay);
      } else {
          // Small delay to ensure cancel() completed
          setTimeout(() => {
            window.speechSynthesis.speak(utterance);
          }, 50);
      }
    },
    [
      isSupported,
      sentences,
      selectedVoice,
      store,
      startElapsedTimer,
      stopElapsedTimer,
    ]
  );
  
  // Pause/Resume needs to handle delay?
  // If paused during delay, it just sits there. Cancel handles it.

  // Update ref when speakSentence changes
  useEffect(() => {
    speakSentenceRef.current = speakSentence;
  }, [speakSentence]);

  // Public API
  const play = useCallback(() => {
    if (!isSupported) return;

    const currentState = useTTSStore.getState();
    store.setPlaying(true);
    store.setPaused(false);

    speakSentence(currentState.currentSentenceIndex);
  }, [isSupported, store, speakSentence]);

  const pause = useCallback(() => {
    if (!isSupported) return;

    stopReasonRef.current = "manual";
    window.speechSynthesis.cancel();
    store.setPaused(true);
    store.setPlaying(false);
    stopElapsedTimer();
    setIsSpeaking(false);
  }, [isSupported, store, stopElapsedTimer]);

  const resume = useCallback(() => {
    play();
  }, [play]);

  const stop = useCallback(() => {
    if (!isSupported) return;

    stopReasonRef.current = "manual";
    window.speechSynthesis.cancel();
    store.stop();
    stopElapsedTimer();
    setIsSpeaking(false);
  }, [isSupported, store, stopElapsedTimer]);

  const seekToSentence = useCallback(
    (index: number) => {
      if (!isSupported || index < 0 || index >= sentences.length) return;

      const currentState = useTTSStore.getState();

      // Update store immediately
      useTTSStore.getState().setCurrentSentenceIndex(index);
      currentSentenceRef.current = index;

      // Calculate elapsed time based on sentence position
      const averageSecondsPerSentence =
        currentState.estimatedDurationSeconds / (sentences.length || 1);
      useTTSStore
        .getState()
        .setElapsedSeconds(Math.floor(index * averageSecondsPerSentence));

      // If playing, seek by stopping and restarting at new position
      if (currentState.isPlaying && !currentState.isPaused) {
        stopReasonRef.current = "seek";
        pendingSeekIndexRef.current = index;
        window.speechSynthesis.cancel();
      }
    },
    [isSupported, sentences.length]
  );

  const setSelectedVoice = useCallback((voice: SpeechSynthesisVoice) => {
    useTTSStore.getState().setSelectedVoiceURI(voice.voiceURI);

    const currentState = useTTSStore.getState();
    if (currentState.isPlaying && !currentState.isPaused) {
      stopReasonRef.current = "settings-change";
      window.speechSynthesis.cancel();
    }
  }, []);

  // Handle playback rate changes mid-speech
  const prevRateRef = useRef(store.playbackRate);
  useEffect(() => {
    if (prevRateRef.current !== store.playbackRate) {
      prevRateRef.current = store.playbackRate;
      const currentState = useTTSStore.getState();
      if (currentState.isPlaying && !currentState.isPaused && isSpeaking) {
        stopReasonRef.current = "settings-change";
        window.speechSynthesis.cancel();
      }
    }
  }, [store.playbackRate, isSpeaking]);

  // Handle pitch changes mid-speech
  const prevPitchRef = useRef(store.pitch);
  useEffect(() => {
    if (prevPitchRef.current !== store.pitch) {
      prevPitchRef.current = store.pitch;
      const currentState = useTTSStore.getState();
      if (currentState.isPlaying && !currentState.isPaused && isSpeaking) {
        stopReasonRef.current = "settings-change";
        window.speechSynthesis.cancel();
      }
    }
  }, [store.pitch, isSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
      stopElapsedTimer();
    };
  }, [isSupported, stopElapsedTimer]);

  const progress = useMemo(() => {
    if (sentences.length <= 1) return 0;
    return Math.round(
      (store.currentSentenceIndex / (sentences.length - 1)) * 100
    );
  }, [store.currentSentenceIndex, sentences.length]);

  return {
    sentences,
    isPlaying: store.isPlaying,
    isPaused: store.isPaused,
    currentSentenceIndex: store.currentSentenceIndex,
    totalSentences: sentences.length,
    estimatedDuration,
    elapsedSeconds: store.elapsedSeconds,
    progress,
    play,
    pause,
    resume,
    stop,
    seekToSentence,
    playbackRate: store.playbackRate,
    setPlaybackRate: store.setPlaybackRate,
    pitch: store.pitch,
    setPitch: store.setPitch,
    volume: store.volume,
    setVolume: store.setVolume,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    isSupported,
    isSpeaking,
  };
};
