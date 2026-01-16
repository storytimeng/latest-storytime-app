"use client";

import React, { createContext, useContext, ReactNode, useRef } from "react";
import { useTTSStore } from "@/src/stores/useTTSStore";

interface TTSControls {
  play: () => void;
  pause: () => void;
  stop: () => void;
  replay: () => void;
}

interface TTSContextValue {
  registerControls: (controls: TTSControls) => void;
  controls: React.MutableRefObject<TTSControls | null>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  availableVoices: SpeechSynthesisVoice[];
}

const TTSContext = createContext<TTSContextValue | null>(null);

export const TTSProvider = ({ children }: { children: ReactNode }) => {
  const controlsRef = useRef<TTSControls | null>(null);
  const store = useTTSStore();
  // We need to access voices here to pass them down, even if StoryContent uses them too.
  // Actually, StoryContent receives voices via useVoices, but NavigationBar needs them via Context.
  // BUT useVoices is a hook using window.speechSynthesis. 
  // We can just use the hook here too properly.
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);

  React.useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const updateVoices = () => {
         setVoices(window.speechSynthesis.getVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
      return () => { window.speechSynthesis.onvoiceschanged = null; };
    }
  }, []);

  const registerControls = (controls: TTSControls) => {
    controlsRef.current = controls;
  };

  const play = () => {
    if (store.isPaused) {
       controlsRef.current?.play(); 
    } else {
       controlsRef.current?.play();
    }
  };

  const pause = () => {
    controlsRef.current?.pause();
  };

  const stop = () => {
    controlsRef.current?.stop();
  };

  return (
    <TTSContext.Provider
      value={{
        registerControls,
        controls: controlsRef,
        play,
        pause,
        stop,
        availableVoices: voices
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
