"use client";

import React, { createContext, useContext, ReactNode, useRef } from "react";
import { useTTSStore } from "@/src/stores/useTTSStore";

interface TTSControls {
  play: () => void;
  pause: () => void;
  stop: () => void;
  replay: () => void;
  seekToSentence: (index: number) => void;
}

interface TTSContextValue {
  registerControls: (controls: TTSControls) => void;
  controls: React.MutableRefObject<TTSControls | null>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekToSentence: (index: number) => void;
  availableVoices: SpeechSynthesisVoice[];
}

const TTSContext = createContext<TTSContextValue | null>(null);

export const TTSProvider = ({ children }: { children: ReactNode }) => {
  const controlsRef = useRef<TTSControls | null>(null);
  const store = useTTSStore();
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);

  React.useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const registerControls = (controls: TTSControls) => {
    controlsRef.current = controls;
  };

  const play = () => {
    // The hook's play() already handles pause resume logic
    controlsRef.current?.play();
  };

  const pause = () => {
    controlsRef.current?.pause();
  };

  const stop = () => {
    controlsRef.current?.stop();
  };

  const seekToSentence = (index: number) => {
    controlsRef.current?.seekToSentence(index);
  };

  return (
    <TTSContext.Provider
      value={{
        registerControls,
        controls: controlsRef,
        play,
        pause,
        stop,
        seekToSentence,
        availableVoices: voices,
      }}
    >
      {children}
    </TTSContext.Provider>
  );
};

export const useTTSContext = () => {
  const context = useContext(TTSContext);
  if (!context)
    throw new Error("useTTSContext must be used within TTSProvider");
  return context;
};
