"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTTSStore, estimateReadingDuration } from "@/src/stores/useTTSStore";

export interface TTSOptions {
  text: string;
  onSentenceChange?: (index: number) => void;
  onWordChange?: (index: number) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export interface Sentence {
  text: string;
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
  const plainText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return plainText.split(/\s+/).filter((w) => w.length > 0).length;
};

export interface UseTTSReturn {
  sentences: Sentence[];
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

export const useTTS = (content: string): UseTTSReturn => {
  const store = useTTSStore();
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isSupported = useMemo(() => {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }, []);

  const sentences = useMemo(() => parseSentences(content), [content]);

  const wordCount = useMemo(() => countWords(content), [content]);
  const estimatedDuration = useMemo(
    () => estimateReadingDuration(wordCount, store.playbackRate),
    [wordCount, store.playbackRate]
  );

  useEffect(() => {
    store.setTotalSentences(sentences.length);
    store.setEstimatedDuration(estimatedDuration);
  }, [sentences.length, estimatedDuration]);

  // Smart voice selection logic
  const findBestVoice = useCallback((voices: SpeechSynthesisVoice[]) => {
    if (!voices.length) return null;

    const libby = voices.find(v => v.name.includes("Libby") && v.name.includes("Microsoft"));
    if (libby) return libby;

    const msNatural = voices.find(v => 
      v.name.includes("Microsoft") && 
      v.name.includes("Online") && 
      v.name.includes("Natural") &&
      v.lang.startsWith("en")
    );
    if (msNatural) return msNatural;

    const sonia = voices.find(v => v.name.includes("Sonia"));
    if (sonia) return sonia;

    const britishOnline = voices.find(v => 
      v.lang === "en-GB" && 
      (v.name.includes("Online") || v.localService === false)
    );
    if (britishOnline) return britishOnline;

    const british = voices.find(v => v.lang === "en-GB");
    if (british) return british;

    return voices.find(v => v.default && v.lang.startsWith("en")) || voices[0];
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        
        const currentUri = useTTSStore.getState().selectedVoiceURI;
        const currentVoiceExists = voices.some(v => v.voiceURI === currentUri);
        
        if (!currentUri || !currentVoiceExists) {
          const bestVoice = findBestVoice(voices);
          if (bestVoice) {
            store.setSelectedVoiceURI(bestVoice.voiceURI);
          }
        }
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    
    // Safety fallback
    const safetyTimer = setInterval(loadVoices, 1000);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      clearInterval(safetyTimer);
    };
  }, [isSupported, findBestVoice, store]);

  const selectedVoice = useMemo(() => {
    if (!store.selectedVoiceURI) return null;
    return availableVoices.find((v) => v.voiceURI === store.selectedVoiceURI) || null;
  }, [availableVoices, store.selectedVoiceURI]);

  const startElapsedTimer = useCallback(() => {
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    elapsedTimerRef.current = setInterval(() => {
      store.setElapsedSeconds(store.elapsedSeconds + 1);
    }, 1000);
  }, [store]);

  const stopElapsedTimer = useCallback(() => {
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  }, []);

  const speakSentence = useCallback(
    (sentenceIndex: number) => {
      if (!isSupported || sentenceIndex >= sentences.length) {
        store.stop();
        stopElapsedTimer();
        return;
      }

      window.speechSynthesis.cancel();

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        const sentence = sentences[sentenceIndex];
        if (!sentence) return;

        const utterance = new SpeechSynthesisUtterance(sentence.text);
        utterance.rate = store.playbackRate;
        utterance.pitch = store.pitch;
        utterance.volume = store.volume;

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
          store.setCurrentSentenceIndex(sentenceIndex);
          startElapsedTimer();
        };

        utterance.onend = () => {
          const currentState = useTTSStore.getState();
          if (currentState.isPlaying && !currentState.isPaused) {
            if (sentenceIndex < sentences.length - 1) {
              speakSentence(sentenceIndex + 1);
            } else {
              store.stop();
              stopElapsedTimer();
              setIsSpeaking(false);
            }
          } else {
            setIsSpeaking(false);
          }
        };

        utterance.onerror = (event) => {
          console.error("TTS Error:", event);
          setIsSpeaking(false);
          if (event.error !== 'interrupted' && event.error !== 'canceled') {
              setTimeout(() => {
                  if (store.isPlaying) speakSentence(sentenceIndex + 1);
              }, 500);
          }
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }, 50);
    },
    [isSupported, sentences, selectedVoice, store, startElapsedTimer, stopElapsedTimer]
  );

  const play = useCallback(() => {
    if (!isSupported) return;
    store.play();
    speakSentence(store.currentSentenceIndex);
  }, [isSupported, store, speakSentence]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    store.pause();
    window.speechSynthesis.pause();
    stopElapsedTimer();
    setIsSpeaking(false);
  }, [isSupported, store, stopElapsedTimer]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    store.play();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      startElapsedTimer();
      setIsSpeaking(true);
    } else {
      speakSentence(store.currentSentenceIndex);
    }
  }, [isSupported, store, startElapsedTimer, speakSentence]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    store.stop();
    stopElapsedTimer();
    setIsSpeaking(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [isSupported, store, stopElapsedTimer]);

  const seekToSentence = useCallback(
    (index: number) => {
      if (!isSupported || index < 0 || index >= sentences.length) return;

      store.seekToSentence(index);
      const averageSecondsPerSentence = estimatedDuration / (sentences.length || 1);
      store.setElapsedSeconds(Math.floor(index * averageSecondsPerSentence));

      if (store.isPlaying) {
        speakSentence(index);
      }
    },
    [isSupported, sentences.length, estimatedDuration, store, speakSentence]
  );

  const setSelectedVoice = useCallback(
    (voice: SpeechSynthesisVoice) => {
      store.setSelectedVoiceURI(voice.voiceURI);
      if (store.isPlaying) {
        speakSentence(store.currentSentenceIndex);
      }
    },
    [store, speakSentence]
  );
  
  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
      stopElapsedTimer();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isSupported, stopElapsedTimer]);

  const progress = useMemo(() => {
    if (sentences.length <= 1) return 0;
    return Math.round((store.currentSentenceIndex / (sentences.length - 1)) * 100);
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
