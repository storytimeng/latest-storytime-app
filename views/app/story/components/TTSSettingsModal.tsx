"use client";

import React, { useState, useMemo } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Slider } from "@heroui/slider";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { X, RotateCcw } from "lucide-react";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { useTTSStore, PLAYBACK_RATES } from "@/src/stores/useTTSStore";
import { PremiumGate } from "@/components/reusables/PremiumGate";

interface TTSSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
}

export const TTSSettingsModal: React.FC<TTSSettingsModalProps> = ({
  isOpen,
  onClose,
  availableVoices,
  selectedVoice,
  onVoiceChange,
}) => {
  const { playbackRate, setPlaybackRate, pitch, setPitch, volume, setVolume } =
    useTTSStore();

  // Local state for sliders - now synced with actual values
  const [localPitch, setLocalPitch] = useState(pitch);
  const [localVolume, setLocalVolume] = useState(volume);

  // Sync local state when modal opens or values change externally
  React.useEffect(() => {
    setLocalPitch(pitch);
    setLocalVolume(volume);
  }, [pitch, volume, isOpen]);

  const handlePitchChange = (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    setLocalPitch(val);
    // Apply immediately for real-time feedback
    setPitch(val);
  };

  const handlePitchChangeEnd = (value: number | number[]) => {
    // Already applied in onChange
  };

  const handleVolumeChange = (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    setLocalVolume(val);
    // Apply immediately for real-time feedback
    setVolume(val);
  };

  const handleVolumeChangeEnd = (value: number | number[]) => {
    // Already applied in onChange
  };

  const handleReset = () => {
    setPlaybackRate(1);
    setPitch(1);
    setVolume(1);
    setLocalPitch(1);
    setLocalVolume(1);
  };

  // Group voices by language for potential future categorization
  // and prioritize the current selected voice at the top
  const sortedVoices = useMemo(() => {
    return [...availableVoices].sort((a, b) => {
      // Prioritize English
      const aEn = a.lang.startsWith("en");
      const bEn = b.lang.startsWith("en");
      if (aEn && !bEn) return -1;
      if (!aEn && bEn) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [availableVoices]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      placement="bottom"
      backdrop="blur"
      classNames={{
        base: "bg-accent-shade-1 max-h-[80vh]",
        header: "border-b border-light-grey-2",
        body: "py-4",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between">
          <span className={`text-primary-colour ${Magnetik_Medium.className}`}>
            TTS Settings
          </span>
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={onClose}
            className="text-grey-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* Voice Selection with Autocomplete */}
          <div className="space-y-2">
            <label
              className={`text-sm text-primary-shade-4 ${Magnetik_Medium.className}`}
            >
              Voice
            </label>
            <PremiumGate
              feature="advancedVoices"
              lockedMessage="Premium voices"
            >
              <Autocomplete
                aria-label="Select Voice"
                defaultItems={sortedVoices}
                selectedKey={selectedVoice?.voiceURI}
                onSelectionChange={(key) => {
                  if (key) {
                    const voice = availableVoices.find(
                      (v) => v.voiceURI === key
                    );
                    if (voice) onVoiceChange(voice);
                  }
                }}
                variant="bordered"
                size="sm"
                classNames={{
                  base: "w-full",
                  listboxWrapper: "max-h-[300px]",
                  selectorButton: "text-primary-shade-4",
                  popoverContent: "p-0",
                }}
                listboxProps={{
                  itemClasses: {
                    base: "py-3 px-3 min-h-[52px] data-[hover=true]:bg-accent-shade-1",
                  },
                }}
                inputProps={{
                  classNames: {
                    input: `${Magnetik_Regular.className} text-primary-colour`,
                    inputWrapper: "bg-white border-light-grey-2 min-h-[44px]",
                  },
                }}
              >
                {(voice) => (
                  <AutocompleteItem key={voice.voiceURI} textValue={voice.name}>
                    <div className="flex flex-col gap-0.5 py-1">
                      <span className="text-sm leading-tight text-primary-colour">
                        {voice.name}
                      </span>
                      <span className="text-xs text-primary-shade-4">
                        {voice.lang}
                      </span>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </PremiumGate>
          </div>

          {/* Playback Speed */}
          <div className="space-y-2">
            <label
              className={`text-sm text-primary-shade-4 ${Magnetik_Medium.className}`}
            >
              Speed: {playbackRate}x
            </label>
            <PremiumGate
              feature="playbackSpeedControl"
              lockedMessage="Speed control requires premium"
            >
              <div className="flex gap-1 flex-wrap">
                {PLAYBACK_RATES.map((rate) => (
                  <Button
                    key={rate}
                    size="sm"
                    variant={playbackRate === rate ? "solid" : "flat"}
                    className={`min-w-[48px] ${
                      playbackRate === rate
                        ? "bg-complimentary-colour text-white"
                        : "bg-white text-primary-shade-5 border border-light-grey-2"
                    } ${Magnetik_Medium.className}`}
                    onPress={() => setPlaybackRate(rate)}
                  >
                    {rate}x
                  </Button>
                ))}
              </div>
            </PremiumGate>
          </div>

          {/* Pitch Control */}
          <div className="space-y-2">
            <label
              className={`text-sm text-primary-shade-4 ${Magnetik_Medium.className}`}
            >
              Pitch: {localPitch.toFixed(1)}
            </label>
            <PremiumGate
              feature="pitchControl"
              lockedMessage="Pitch adjustment requires premium"
            >
              <Slider
                size="sm"
                step={0.1}
                minValue={0.5}
                maxValue={2}
                value={localPitch}
                onChange={handlePitchChange}
                onChangeEnd={handlePitchChangeEnd}
                classNames={{
                  track: "bg-light-grey-2",
                  filler: "bg-complimentary-colour",
                  thumb: "bg-complimentary-colour",
                }}
                aria-label="Pitch"
              />
            </PremiumGate>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <label
              className={`text-sm text-primary-shade-4 ${Magnetik_Medium.className}`}
            >
              Volume: {Math.round(localVolume * 100)}%
            </label>
            <Slider
              size="sm"
              step={0.05}
              minValue={0}
              maxValue={1}
              value={localVolume}
              onChange={handleVolumeChange}
              onChangeEnd={handleVolumeChangeEnd}
              classNames={{
                track: "bg-light-grey-2",
                filler: "bg-complimentary-colour",
                thumb: "bg-complimentary-colour",
              }}
              aria-label="Volume"
            />
          </div>

          {/* Reset Button */}
          <Button
            variant="flat"
            className="w-full bg-light-grey-1 text-primary-shade-5"
            startContent={<RotateCcw className="w-4 h-4" />}
            onPress={handleReset}
          >
            <span className={Magnetik_Medium.className}>Reset to Defaults</span>
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
