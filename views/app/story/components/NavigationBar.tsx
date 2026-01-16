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
} from "lucide-react";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDuration, PLAYBACK_RATES, estimateReadingDuration } from "@/src/stores/useTTSStore";
import { TTSSettingsModal } from "./TTSSettingsModal";
import { PremiumGate } from "@/components/reusables/PremiumGate";

interface TTSControls {
  isPlaying: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  stop: () => void;
}

interface NavigationBarProps {
  currentIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  isVisible: boolean;
  navigationList: any[];
  selectedChapterId: string | null;
  // TTS controls from StoryContent
  ttsControls?: TTSControls;
  // Content for duration estimation
  storyContent?: string;
}

export const NavigationBar = React.memo(
  ({
    currentIndex,
    total,
    onPrevious,
    onNext,
    isVisible,
    navigationList,
    selectedChapterId,
    ttsControls,
    storyContent = "",
  }: NavigationBarProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showSettings, setShowSettings] = useState(false);
    const [showSpeedPopover, setShowSpeedPopover] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [volume, setVolume] = useState(1);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

    // Load voices
    React.useEffect(() => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      const loadVoices = () => {
        setAvailableVoices(window.speechSynthesis.getVoices());
      };

      loadVoices();
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      };
    }, []);

    // Calculate estimated duration
    const wordCount = React.useMemo(() => {
      const plainText = storyContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      return plainText.split(/\s+/).filter((w) => w.length > 0).length;
    }, [storyContent]);

    const estimatedDuration = React.useMemo(
      () => estimateReadingDuration(wordCount, playbackRate),
      [wordCount, playbackRate]
    );

    // Handle chapter navigation
    const handlePrevious = () => {
      ttsControls?.stop();
      onPrevious();
      updateUrl(-1);
    };

    const handleNext = () => {
      ttsControls?.stop();
      onNext();
      updateUrl(1);
    };

    const updateUrl = (direction: number) => {
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
    };

    // TTS Controls
    const handlePlayPause = useCallback(() => {
      if (!ttsControls) return;
      
      if (ttsControls.isPlaying) {
        ttsControls.pause();
      } else {
        ttsControls.start();
      }
    }, [ttsControls]);

    const handleStop = useCallback(() => {
      ttsControls?.stop();
    }, [ttsControls]);

    const handleSpeedChange = useCallback((rate: number) => {
      setPlaybackRate(rate);
      setShowSpeedPopover(false);
      // Note: Speed changes take effect on next play
    }, []);

    const toggleMute = useCallback(() => {
      setVolume((v) => (v > 0 ? 0 : 1));
    }, []);

    const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

    // Render simple nav if TTS not supported
    if (!isSupported) {
      return (
        <SimpleNavigationBar
          currentIndex={currentIndex}
          total={total}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isVisible={isVisible}
        />
      );
    }

    const isPlaying = ttsControls?.isPlaying || false;
    const isPaused = ttsControls?.isPaused || false;

    return (
      <>
        <div
          className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-accent-shade-1/95 backdrop-blur-md z-40 transition-all duration-300 border-t border-light-grey-2 shadow-lg ${
            isVisible ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="px-4 pt-3 pb-4 space-y-3">
            {/* Top Row: Chapter Navigation + Main Controls */}
            <div className="flex items-center justify-between gap-2">
              {/* Previous Chapter */}
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={handlePrevious}
                isDisabled={currentIndex === 0}
                className="flex-shrink-0 text-primary-shade-4 hover:bg-accent-shade-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              {/* TTS Controls */}
              <div className="flex items-center gap-1">
                {/* Play/Pause */}
                <Button
                  isIconOnly
                  size="md"
                  onPress={handlePlayPause}
                  isDisabled={!ttsControls}
                  className={`rounded-full w-12 h-12 shadow-md transition-colors ${
                    isPlaying
                      ? "bg-primary-shade-5 text-white hover:bg-primary-shade-4"
                      : "bg-complimentary-colour text-white hover:bg-complimentary-dark-1"
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </Button>

                {/* Stop (only when playing or paused) */}
                {(isPlaying || isPaused) && (
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={handleStop}
                    className="text-primary-shade-4 hover:bg-accent-shade-2"
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Next Chapter */}
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={handleNext}
                isDisabled={currentIndex === total - 1}
                className="flex-shrink-0 text-primary-shade-4 hover:bg-accent-shade-2"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Bar Row */}
            <div className="flex items-center gap-3">
              {/* Elapsed placeholder */}
              <span
                className={`text-xs text-primary-shade-4 min-w-[36px] ${Magnetik_Regular.className}`}
              >
                0:00
              </span>

              {/* Progress Slider */}
              <Slider
                size="sm"
                step={1}
                minValue={0}
                maxValue={100}
                value={0}
                className="flex-1"
                classNames={{
                  track: "bg-light-grey-2 h-1",
                  filler: "bg-complimentary-colour",
                  thumb:
                    "w-3 h-3 bg-complimentary-colour shadow-md after:bg-complimentary-colour",
                }}
                aria-label="Reading progress"
              />

              {/* Total Duration */}
              <span
                className={`text-xs text-primary-shade-4 min-w-[36px] text-right ${Magnetik_Regular.className}`}
              >
                {formatDuration(estimatedDuration)}
              </span>
            </div>

            {/* Bottom Row: Speed, Volume, Settings, Chapter Info */}
            <div className="flex items-center justify-between">
              {/* Left: Speed Selector */}
              <PremiumGate feature="playbackSpeedControl" hideWhenLocked>
                <Popover
                  isOpen={showSpeedPopover}
                  onOpenChange={setShowSpeedPopover}
                  placement="top"
                >
                  <PopoverTrigger>
                    <Button
                      size="sm"
                      variant="flat"
                      className={`min-w-[48px] bg-accent-shade-2 text-primary-shade-5 ${Magnetik_Medium.className}`}
                    >
                      {playbackRate}x
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-accent-shade-1 border border-light-grey-2 p-2">
                    <div className="flex gap-1">
                      {PLAYBACK_RATES.map((rate) => (
                        <Button
                          key={rate}
                          size="sm"
                          variant={playbackRate === rate ? "solid" : "flat"}
                          className={`min-w-[40px] ${
                            playbackRate === rate
                              ? "bg-complimentary-colour text-white"
                              : "bg-white text-primary-shade-5"
                          } ${Magnetik_Medium.className}`}
                          onPress={() => handleSpeedChange(rate)}
                        >
                          {rate}x
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </PremiumGate>

              {/* Center: Chapter Info */}
              <span
                className={`text-xs text-primary-shade-4 ${Magnetik_Medium.className}`}
              >
                {currentIndex + 1} / {total}
              </span>

              {/* Right: Volume + Settings */}
              <div className="flex items-center gap-1">
                {/* Volume Toggle */}
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={toggleMute}
                  className="text-primary-shade-4 hover:bg-accent-shade-2"
                >
                  {volume > 0 ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </Button>

                {/* Settings Button */}
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={() => setShowSettings(true)}
                  className="text-primary-shade-4 hover:bg-accent-shade-2"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        <TTSSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          availableVoices={availableVoices}
          selectedVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
        />
      </>
    );
  }
);

NavigationBar.displayName = "NavigationBar";

// Simple fallback for browsers without TTS support
const SimpleNavigationBar = React.memo(
  ({
    currentIndex,
    total,
    onPrevious,
    onNext,
    isVisible,
  }: {
    currentIndex: number;
    total: number;
    onPrevious: () => void;
    onNext: () => void;
    isVisible: boolean;
  }) => {
    return (
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-[#FFEBD0]/80 backdrop-blur-sm z-40 transition-all duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between w-full">
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              isDisabled={currentIndex === 0}
              className="flex-shrink-0 bg-accent-shade-1 border-complimentary-shade-1 rounded-full p-[6px]"
            >
              <ChevronLeft className="w-6 h-6 text-complimentary-colour" />
            </Button>

            <span
              className={`text-xs text-primary-colour ${Magnetik_Medium.className}`}
            >
              {currentIndex + 1} / {total}
            </span>

            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              onClick={onNext}
              isDisabled={currentIndex === total - 1}
              className="flex-shrink-0 bg-accent-shade-1 border-complimentary-shade-1 rounded-full p-[6px]"
            >
              <ChevronRight className="w-6 h-6 text-complimentary-colour" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

SimpleNavigationBar.displayName = "SimpleNavigationBar";
