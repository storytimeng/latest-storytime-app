"use client";

import useSWR from "swr";
import { fetchStoryAudioVoices } from "@/src/lib/storyAudio";

export function useStoryAudioVoices(enabled = true) {
  const { data, error, isLoading } = useSWR(
    enabled ? "story-audio-voices" : null,
    fetchStoryAudioVoices,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  return {
    voices: data?.voices ?? [],
    defaultVoice: data?.defaultVoice ?? "en-US-AvaNeural",
    isLoading,
    error,
  };
}
