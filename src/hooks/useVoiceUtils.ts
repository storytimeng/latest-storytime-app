"use client";

import { useMemo } from "react";
import type { useVoices } from "react-text-to-speech";

export const getBestVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined => {
  if (!voices.length) return undefined;

  // 1. Precise match: Microsoft Libby Online (Natural) - English (United States)
  // This is the user's specific request
  const libby = voices.find(
    (v) => 
      v.name.includes("Libby") && 
      v.name.includes("Microsoft") && 
      v.name.includes("Online")
  );
  if (libby) return libby;

  // 2. Microsoft Online Natural (English) - High quality fallback
  const msNatural = voices.find(
    (v) =>
      v.name.includes("Microsoft") &&
      v.name.includes("Online") &&
      v.name.includes("Natural") &&
      v.lang.startsWith("en")
  );
  if (msNatural) return msNatural;

  // 3. Sonia (British) - Specifically mentioned as preferred fallback
  const sonia = voices.find((v) => v.name.includes("Sonia"));
  if (sonia) return sonia;

  // 4. Any British English Online voice
  const gbOnline = voices.find(
    (v) =>
      v.lang === "en-GB" &&
      (v.name.includes("Online") || v.localService === false)
  );
  if (gbOnline) return gbOnline;

  // 5. Any British English voice
  const gb = voices.find((v) => v.lang === "en-GB");
  if (gb) return gb;

  // 6. Any English Online voice
  const enOnline = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      (v.name.includes("Online") || v.localService === false)
  );
  if (enOnline) return enOnline;

  // 7. Default English voice
  const enDefault = voices.find((v) => v.default && v.lang.startsWith("en"));
  
  // 8. Fallback to first available
  return enDefault || voices[0];
};

export const useSmartVoice = (voices: SpeechSynthesisVoice[], currentUri: string | null) => {
  return useMemo(() => {
    // If user explicitly selected a voice and it exists, use it
    if (currentUri) {
      const selected = voices.find((v) => v.voiceURI === currentUri);
      if (selected) return selected;
    }

    // Otherwise find the best default
    return getBestVoice(voices);
  }, [voices, currentUri]);
};
