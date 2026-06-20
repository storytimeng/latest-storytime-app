import { useTTSStore } from "@/src/stores/useTTSStore";

/**
 * Stops browser Web Speech API playback without affecting server narration state
 * beyond resetting shared playback flags in the TTS store.
 */
export function stopBrowserTTS(options?: { resetStore?: boolean }) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  if (options?.resetStore !== false) {
    useTTSStore.getState().stop();
  }
}
