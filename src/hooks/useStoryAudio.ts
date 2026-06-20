"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchStoryAudio,
  recordStoryAudioListen,
  type StoryAudioManifest,
  type StoryAudioSegment,
} from "@/src/lib/storyAudio";
import { useTTSStore, formatDuration } from "@/src/stores/useTTSStore";

interface UseStoryAudioOptions {
  storyId: string;
  chapterId?: string | null;
  episodeId?: string | null;
  enabled?: boolean;
}

export function useStoryAudio({
  storyId,
  chapterId,
  episodeId,
  enabled = true,
}: UseStoryAudioOptions) {
  const playbackRate = useTTSStore((state) => state.playbackRate);
  const volume = useTTSStore((state) => state.volume);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const segmentsRef = useRef<StoryAudioSegment[]>([]);
  const segmentIndexRef = useRef(0);
  const elapsedOffsetRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reportedListenRef = useRef(false);
  const manifestRef = useRef<StoryAudioManifest | null>(null);

  const [manifest, setManifest] = useState<StoryAudioManifest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const updateElapsed = useCallback(() => {
    const tts = useTTSStore.getState();
    const audio = audioRef.current;
    const segments = segmentsRef.current;
    const currentSegment = segments[segmentIndexRef.current];
    const base = elapsedOffsetRef.current;
    const current = audio?.currentTime ?? 0;
    const elapsed = base + current;
    const totalDurationSeconds = manifestRef.current?.totalDurationSeconds;

    tts.setElapsedSeconds(Math.floor(elapsed));

    if (currentSegment && totalDurationSeconds) {
      const sentenceEstimate = Math.floor(
        (elapsed / Math.max(totalDurationSeconds, 1)) *
          Math.max(tts.totalSentences, 1),
      );
      tts.setCurrentSentenceIndex(
        Math.min(
          Math.max(sentenceEstimate, 0),
          Math.max(tts.totalSentences - 1, 0),
        ),
      );
    }
  }, []);

  const reportListen = useCallback(
    (completed: boolean, durationSeconds: number) => {
      if (reportedListenRef.current || durationSeconds < 3) return;

      reportedListenRef.current = true;
      void recordStoryAudioListen({
        storyId,
        chapterId,
        episodeId,
        voice: manifestRef.current?.voice,
        durationSeconds,
        completed,
      });
    },
    [chapterId, episodeId, storyId],
  );

  const stopPlayback = useCallback(
    (options?: { completed?: boolean; report?: boolean }) => {
      const tts = useTTSStore.getState();
      const durationSeconds = Math.max(
        tts.elapsedSeconds,
        Math.floor(
          elapsedOffsetRef.current + (audioRef.current?.currentTime ?? 0),
        ),
      );

      if (options?.report !== false) {
        reportListen(Boolean(options?.completed), durationSeconds);
      }

      clearProgressTimer();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      segmentIndexRef.current = 0;
      elapsedOffsetRef.current = 0;
      tts.stop();
      tts.setElapsedSeconds(0);
    },
    [clearProgressTimer, reportListen],
  );

  const playSegmentRef = useRef<(index: number) => Promise<void>>(
    async () => {},
  );

  const playSegment = useCallback(
    async (index: number) => {
      const tts = useTTSStore.getState();
      const segments = segmentsRef.current;
      const segment = segments[index];
      if (!segment) {
        stopPlayback();
        return;
      }

      segmentIndexRef.current = index;
      const audio = new Audio(segment.url);
      audio.playbackRate = tts.playbackRate;
      audio.volume = tts.volume;
      audioRef.current = audio;

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Audio playback failed"));
        void audio.play().catch(reject);
      }).catch(() => {
        stopPlayback();
        setError("Playback failed. Please try again.");
      });

      if (!audioRef.current) return;

      elapsedOffsetRef.current += segment.durationSeconds;

      if (index < segments.length - 1) {
        await playSegmentRef.current(index + 1);
        return;
      }

      stopPlayback({ completed: true });
    },
    [stopPlayback],
  );

  useEffect(() => {
    playSegmentRef.current = playSegment;
  }, [playSegment]);

  const loadManifestRef = useRef<() => Promise<void>>(async () => {});

  const loadManifest = useCallback(async () => {
    if (!storyId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchStoryAudio({
        storyId,
        chapterId,
        episodeId,
      });

      manifestRef.current = result;
      setManifest(result);

      if (result.status === "pending") {
        clearPollTimer();
        pollTimerRef.current = setTimeout(() => {
          void loadManifestRef.current();
        }, 2500);
        return;
      }

      setIsLoading(false);

      if (result.status === "unavailable") {
        setError(result.message || "Human narration is unavailable.");
        return;
      }

      if (result.status === "failed") {
        setError(result.message || "Unable to prepare narration.");
        return;
      }

      segmentsRef.current = [...result.segments].sort(
        (a, b) => a.order - b.order,
      );
      useTTSStore.getState().setEstimatedDuration(result.totalDurationSeconds);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load narration audio.",
      );
      setIsLoading(false);
    }
  }, [chapterId, clearPollTimer, episodeId, storyId]);

  useEffect(() => {
    loadManifestRef.current = loadManifest;
  }, [loadManifest]);

  const play = useCallback(async () => {
    if (!segmentsRef.current.length) {
      await loadManifest();
    }

    if (!segmentsRef.current.length) {
      setError("Narration is not ready yet.");
      return;
    }

    stopPlayback({ report: false });
    reportedListenRef.current = false;
    useTTSStore.getState().play();
    clearProgressTimer();
    progressTimerRef.current = setInterval(updateElapsed, 250);

    try {
      await playSegment(0);
    } catch {
      stopPlayback();
    }
  }, [
    clearProgressTimer,
    loadManifest,
    playSegment,
    stopPlayback,
    updateElapsed,
  ]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    useTTSStore.getState().pause();
    clearProgressTimer();
  }, [clearProgressTimer]);

  const resume = useCallback(async () => {
    if (!audioRef.current && segmentsRef.current.length > 0) {
      await playSegment(segmentIndexRef.current);
      return;
    }

    await audioRef.current?.play();
    useTTSStore.getState().play();
    clearProgressTimer();
    progressTimerRef.current = setInterval(updateElapsed, 250);
  }, [clearProgressTimer, playSegment, updateElapsed]);

  const seek = useCallback(
    async (seconds: number) => {
      const tts = useTTSStore.getState();
      const segments = segmentsRef.current;
      const totalDurationSeconds = manifestRef.current?.totalDurationSeconds;
      if (!segments.length || !totalDurationSeconds) return;

      const target = Math.max(0, Math.min(seconds, totalDurationSeconds));
      let accumulated = 0;

      for (let index = 0; index < segments.length; index += 1) {
        const next = accumulated + segments[index].durationSeconds;
        if (target <= next) {
          stopPlayback({ report: false });
          segmentIndexRef.current = index;
          elapsedOffsetRef.current = accumulated;
          tts.play();
          clearProgressTimer();
          progressTimerRef.current = setInterval(updateElapsed, 250);

          const audio = new Audio(segments[index].url);
          audio.playbackRate = tts.playbackRate;
          audio.volume = tts.volume;
          audio.currentTime = Math.max(0, target - accumulated);
          audioRef.current = audio;
          audio.onended = () => {
            void playSegmentRef.current(index + 1);
          };
          await audio.play();
          return;
        }
        accumulated = next;
      }
    },
    [clearProgressTimer, playSegment, stopPlayback, updateElapsed],
  );

  const stopPlaybackRef = useRef(stopPlayback);
  useEffect(() => {
    stopPlaybackRef.current = stopPlayback;
  }, [stopPlayback]);

  useEffect(() => {
    if (!enabled) {
      return () => {
        stopPlaybackRef.current({ report: false });
        clearPollTimer();
      };
    }

    segmentsRef.current = [];
    manifestRef.current = null;
    setManifest(null);
    reportedListenRef.current = false;
    void loadManifestRef.current();

    return () => {
      stopPlaybackRef.current({ report: false });
      clearPollTimer();
    };
  }, [clearPollTimer, enabled, storyId, chapterId, episodeId]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = volume;
    }
  }, [playbackRate, volume]);

  return {
    manifest,
    isLoading,
    error,
    isReady: manifest?.status === "ready" && segmentsRef.current.length > 0,
    play,
    pause,
    resume,
    stop: stopPlayback,
    seek,
    formatDuration,
  };
}
