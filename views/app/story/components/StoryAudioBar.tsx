"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Slider } from "@heroui/slider";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Headphones,
  Loader2,
  Mic,
} from "lucide-react";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import {
  useTTSStore,
  formatDuration,
  PLAYBACK_RATES,
} from "@/src/stores/useTTSStore";
import { PremiumGate } from "@/components/reusables/PremiumGate";
import { useStoryAudioVoices } from "@/src/hooks/useStoryAudioVoices";

interface StoryAudioBarProps {
  isVisible: boolean;
  isLoading?: boolean;
  error?: string | null;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSeek: (seconds: number) => void;
  currentIndex?: number;
  totalChapters?: number;
  onPreviousChapter?: () => void;
  onNextChapter?: () => void;
}

export const StoryAudioBar = React.memo(
  ({
    isVisible,
    isLoading = false,
    error,
    onPlay,
    onPause,
    onResume,
    onStop,
    onSeek,
    currentIndex,
    totalChapters = 0,
    onPreviousChapter,
    onNextChapter,
  }: StoryAudioBarProps) => {
    const store = useTTSStore();
    const { voices, isLoading: isLoadingVoices } = useStoryAudioVoices();
    const [showSpeedPopover, setShowSpeedPopover] = useState(false);
    const [showVoicePopover, setShowVoicePopover] = useState(false);
    const hasChapterNav =
      totalChapters > 1 && onPreviousChapter && onNextChapter;

    const selectedVoice = useMemo(
      () =>
        voices.find((voice) => voice.id === store.selectedNarrationVoiceId) ??
        voices[0] ??
        null,
      [store.selectedNarrationVoiceId, voices],
    );

    const handleVoiceSelect = useCallback(
      (voiceId: string) => {
        store.setSelectedNarrationVoiceId(voiceId);
        setShowVoicePopover(false);
      },
      [store],
    );

    const togglePlayPause = useCallback(() => {
      if (store.isPlaying && !store.isPaused) {
        onPause();
        return;
      }

      if (store.isPaused) {
        void onResume();
        return;
      }

      void onPlay();
    }, [onPause, onPlay, onResume, store.isPaused, store.isPlaying]);

    const handleVolumeToggle = useCallback(() => {
      store.setVolume(store.volume === 0 ? 1 : 0);
    }, [store]);

    const handleSeek = useCallback(
      (value: number | number[]) => {
        const seconds = Array.isArray(value) ? value[0] : value;
        void onSeek(seconds);
      },
      [onSeek],
    );

    return (
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-accent-shade-1/95 backdrop-blur-md z-40 transition-transform duration-300 ease-in-out border-t border-light-grey-2 shadow-lg ${
          isVisible ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
      >
        <div className="px-4 pt-3 pb-4 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Headphones className="w-4 h-4 text-complimentary-colour" />
            <span
              className={`text-xs text-primary-shade-4 ${Magnetik_Medium.className}`}
            >
              Natural voice narration
            </span>
            {isLoading && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-shade-4" />
            )}
          </div>

          {error ? (
            <p className="text-xs text-center text-red-500">{error}</p>
          ) : null}

          <div className="flex items-center justify-between gap-2">
            {hasChapterNav ? (
              <Button
                isIconOnly
                variant="light"
                onPress={onPreviousChapter}
                isDisabled={currentIndex === 0}
                className="text-primary-shade-4 hover:text-primary-colour"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            ) : (
              <div className="w-10" />
            )}

            <div className="flex items-center gap-4">
              <Button
                isIconOnly
                size="lg"
                className={`rounded-full ${
                  store.isPlaying && !store.isPaused
                    ? "bg-accent-shade-1 text-primary-colour border border-light-grey-2"
                    : "bg-complimentary-colour text-white shadow-lg shadow-complimentary-colour/20"
                }`}
                onPress={togglePlayPause}
                isDisabled={isLoading}
              >
                {store.isPlaying && !store.isPaused ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-1" />
                )}
              </Button>
            </div>

            {hasChapterNav ? (
              <Button
                isIconOnly
                variant="light"
                onPress={onNextChapter}
                isDisabled={
                  currentIndex === undefined ||
                  currentIndex >= totalChapters - 1
                }
                className="text-primary-shade-4 hover:text-primary-colour"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            ) : (
              <div className="w-10" />
            )}
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs text-primary-shade-4 w-10 text-right ${Magnetik_Regular.className}`}
            >
              {formatDuration(store.elapsedSeconds)}
            </span>
            <Slider
              size="sm"
              value={store.elapsedSeconds}
              maxValue={Math.max(store.estimatedDurationSeconds, 1)}
              step={1}
              aria-label="Narration progress"
              onChange={handleSeek}
              isDisabled={!store.estimatedDurationSeconds}
              classNames={{
                base: "cursor-pointer",
                track: "bg-light-grey-2 h-1.5 cursor-pointer",
                filler: "bg-complimentary-colour",
                thumb:
                  "w-3 h-3 bg-complimentary-colour shadow-md after:bg-white after:w-1.5 after:h-1.5 transition-all cursor-grab active:cursor-grabbing",
              }}
            />
            <span
              className={`text-xs text-primary-shade-4 w-10 ${Magnetik_Regular.className}`}
            >
              {formatDuration(store.estimatedDurationSeconds)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <PremiumGate
                feature="playbackSpeedControl"
                hideWhenLocked={false}
              >
                <Popover
                  isOpen={showSpeedPopover}
                  onOpenChange={setShowSpeedPopover}
                  placement="top"
                >
                  <PopoverTrigger>
                    <Button
                      size="sm"
                      variant="light"
                      className={`text-xs text-primary-shade-4 ${Magnetik_Medium.className}`}
                    >
                      {store.playbackRate}x
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-2 flex-row gap-1">
                    {PLAYBACK_RATES.map((rate) => (
                      <Button
                        key={rate}
                        size="sm"
                        variant={
                          rate === store.playbackRate ? "solid" : "ghost"
                        }
                        className={`min-w-0 px-2 h-8 ${rate === store.playbackRate ? "bg-complimentary-colour text-white" : ""}`}
                        onPress={() => {
                          store.setPlaybackRate(rate);
                          setShowSpeedPopover(false);
                        }}
                      >
                        {rate}x
                      </Button>
                    ))}
                  </PopoverContent>
                </Popover>
              </PremiumGate>

              <Popover
                isOpen={showVoicePopover}
                onOpenChange={setShowVoicePopover}
                placement="top"
              >
                <PopoverTrigger>
                  <Button
                    size="sm"
                    variant="light"
                    isDisabled={isLoadingVoices || voices.length === 0}
                    className={`text-xs text-primary-shade-4 max-w-[5.5rem] truncate ${Magnetik_Medium.className}`}
                    startContent={<Mic className="w-3.5 h-3.5 shrink-0" />}
                  >
                    {selectedVoice?.name ?? "Voice"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-2 flex flex-col gap-1 min-w-[10rem]">
                  {voices.map((voice) => (
                    <Button
                      key={voice.id}
                      size="sm"
                      variant={
                        voice.id === store.selectedNarrationVoiceId
                          ? "solid"
                          : "ghost"
                      }
                      className={`justify-start h-9 ${
                        voice.id === store.selectedNarrationVoiceId
                          ? "bg-complimentary-colour text-white"
                          : ""
                      }`}
                      onPress={() => handleVoiceSelect(voice.id)}
                    >
                      {voice.name}
                      <span className="ml-auto text-[10px] opacity-70">
                        {voice.locale}
                      </span>
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 text-center px-2 truncate">
              {hasChapterNav && currentIndex !== undefined ? (
                <span
                  className={`text-xs text-primary-shade-4 ${Magnetik_Regular.className}`}
                >
                  Part {currentIndex + 1} / {totalChapters}
                </span>
              ) : (
                <span
                  className={`text-xs text-primary-shade-4 ${Magnetik_Regular.className}`}
                >
                  Listen mode
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={handleVolumeToggle}
                className="text-primary-shade-4"
              >
                {store.volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>

              {store.isPlaying || store.isPaused ? (
                <Button
                  size="sm"
                  variant="light"
                  onPress={onStop}
                  className={`text-xs text-primary-shade-4 ${Magnetik_Medium.className}`}
                >
                  Stop
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

StoryAudioBar.displayName = "StoryAudioBar";
