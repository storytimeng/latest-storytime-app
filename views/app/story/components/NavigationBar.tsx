"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@heroui/button";
import { Slider } from "@heroui/slider";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Settings,
  Volume2,
  VolumeX,
  Square,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useTTSStore,
  formatDuration,
  PLAYBACK_RATES,
} from "@/src/stores/useTTSStore";
import { useTTSContext } from "@/components/providers/TTSProvider";
import { TTSSettingsModal } from "./TTSSettingsModal";
import { PremiumGate } from "@/components/reusables/PremiumGate";

interface NavigationBarProps {
  currentIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  isVisible: boolean;
  navigationList: any[];
  selectedChapterId: string | null;
}

export const NavigationBar = React.memo(
  ({
    currentIndex,
    total,
    onPrevious,
    onNext,
    isVisible,
    navigationList,
  }: NavigationBarProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // TTS State & Controls
    const store = useTTSStore();
    const { play, pause, stop, seekToSentence, availableVoices } =
      useTTSContext();

    // Local UI State
    const [showSettings, setShowSettings] = useState(false);
    const [showSpeedPopover, setShowSpeedPopover] = useState(false);

    // Chapter Navigation
    const updateUrl = useCallback(
      (direction: number) => {
        const newIndex = currentIndex + direction;
        if (newIndex < 0 || newIndex >= total) return;

        const item = navigationList[newIndex];
        if (!item) return;

        const params = new URLSearchParams(searchParams.toString());
        params.delete("chapterId");
        params.delete("episodeId");

        if ("chapterNumber" in item) {
          params.set("chapterId", item.id);
        } else if ("episodeNumber" in item) {
          params.set("episodeId", item.id);
        }

        router.replace(`?${params.toString()}`, { scroll: false });
      },
      [currentIndex, total, navigationList, searchParams, router]
    );

    const handlePreviousChapter = useCallback(() => {
      stop();
      onPrevious();
      updateUrl(-1);
    }, [stop, onPrevious, updateUrl]);

    const handleNextChapter = useCallback(() => {
      stop();
      onNext();
      updateUrl(1);
    }, [stop, onNext, updateUrl]);

    // TTS Controls
    const togglePlayPause = useCallback(() => {
      if (store.isPlaying && !store.isPaused) {
        pause();
      } else {
        play();
      }
    }, [store.isPlaying, store.isPaused, play, pause]);

    const handleVolumeToggle = useCallback(() => {
      const newVolume = store.volume === 0 ? 1 : 0;
      store.setVolume(newVolume);
    }, [store]);

    // Skip forward/backward by sentences
    const handleSkipBack = useCallback(() => {
      const newIndex = Math.max(0, store.currentSentenceIndex - 1);
      seekToSentence(newIndex);
    }, [store.currentSentenceIndex, seekToSentence]);

    const handleSkipForward = useCallback(() => {
      const newIndex = Math.min(
        store.totalSentences - 1,
        store.currentSentenceIndex + 1
      );
      seekToSentence(newIndex);
    }, [store.currentSentenceIndex, store.totalSentences, seekToSentence]);

    // Seeker Logic - convert time position to sentence index
    const handleSeek = useCallback(
      (value: number | number[]) => {
        const seconds = Array.isArray(value) ? value[0] : value;

        // Calculate index from seconds
        if (store.estimatedDurationSeconds > 0 && store.totalSentences > 0) {
          const percent = seconds / store.estimatedDurationSeconds;
          const targetIndex = Math.floor(percent * store.totalSentences);
          const safeIndex = Math.min(
            Math.max(0, targetIndex),
            store.totalSentences - 1
          );

          seekToSentence(safeIndex);
        }
      },
      [store.estimatedDurationSeconds, store.totalSentences, seekToSentence]
    );

    // Selected Voice Object
    const selectedVoice =
      availableVoices.find(
        (v: SpeechSynthesisVoice) => v.voiceURI === store.selectedVoiceURI
      ) || null;

    return (
      <>
        <div
          className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-accent-shade-1/95 backdrop-blur-md z-40 transition-transform duration-300 ease-in-out border-t border-light-grey-2 shadow-lg ${
            isVisible ? "translate-y-0" : "translate-y-full pointer-events-none"
          }`}
        >
          <div className="px-4 pt-3 pb-4 space-y-3">
            {/* Top Row: Chapter Navigation + Main Controls */}
            <div className="flex items-center justify-between gap-2">
              {/* Previous Chapter */}
              <Button
                isIconOnly
                variant="light"
                onPress={handlePreviousChapter}
                isDisabled={currentIndex === 0}
                className="text-primary-shade-4 hover:text-primary-colour"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              {/* Player Controls Center */}
              <div className="flex items-center gap-6">
                <Button
                  isIconOnly
                  variant="light"
                  className="text-primary-shade-4 hover:text-primary-colour"
                  onPress={handleSkipBack}
                  isDisabled={store.currentSentenceIndex === 0}
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  isIconOnly
                  size="lg"
                  className={`rounded-full ${
                    store.isPlaying && !store.isPaused
                      ? "bg-accent-shade-1 text-primary-colour border border-light-grey-2"
                      : "bg-complimentary-colour text-white shadow-lg shadow-complimentary-colour/20"
                  }`}
                  onPress={togglePlayPause}
                >
                  {store.isPlaying && !store.isPaused ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-1" />
                  )}
                </Button>

                <Button
                  isIconOnly
                  variant="light"
                  className="text-primary-shade-4 hover:text-primary-colour"
                  onPress={handleSkipForward}
                  isDisabled={
                    store.currentSentenceIndex >= store.totalSentences - 1
                  }
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              {/* Next Chapter */}
              <Button
                isIconOnly
                variant="light"
                onPress={handleNextChapter}
                isDisabled={currentIndex === total - 1}
                className="text-primary-shade-4 hover:text-primary-colour"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>

            {/* Middle Row: Progress */}
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
                aria-label="Reading Progress"
                onChange={handleSeek} // Seek while dragging for real-time feedback
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

            {/* Bottom Row: Settings & Extras */}
            <div className="flex items-center justify-between">
              {/* Speed Selector */}
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

              {/* Chapter Info */}
              <div className="flex-1 text-center px-4 truncate">
                <span
                  className={`text-xs text-primary-shade-4 ${Magnetik_Regular.className}`}
                >
                  Chapter {currentIndex + 1} / {total}
                </span>
              </div>

              {/* Right Side Controls */}
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

                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={() => setShowSettings(true)}
                  className="text-primary-shade-4"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <TTSSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          availableVoices={availableVoices}
          selectedVoice={selectedVoice}
          onVoiceChange={(voice) => store.setSelectedVoiceURI(voice.voiceURI)}
        />
      </>
    );
  }
);

NavigationBar.displayName = "NavigationBar";
