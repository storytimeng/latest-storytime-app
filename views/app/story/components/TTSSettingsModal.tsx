"use client";

import React, { useState, useMemo } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Slider } from "@heroui/slider";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { X, RotateCcw, Mic } from "lucide-react";
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

// Group voices by type for better organization
const categorizeVoice = (voice: SpeechSynthesisVoice): string => {
  if (voice.name.includes("Online")) return "Online (Cloud)";
  if (voice.name.includes("Microsoft")) return "Microsoft";
  if (voice.name.includes("Google")) return "Google";
  return "System";
};

// Check if voice is British English
const isBritishEnglish = (voice: SpeechSynthesisVoice): boolean => {
  return /en[-_]GB/i.test(voice.lang);
};

export const TTSSettingsModal: React.FC<TTSSettingsModalProps> = ({
  isOpen,
  onClose,
  availableVoices,
  selectedVoice,
  onVoiceChange,
}) => {
  const { playbackRate, setPlaybackRate, pitch, setPitch, volume, setVolume } =
    useTTSStore();

  // Local state for sliders to avoid too many store updates
  const [localPitch, setLocalPitch] = useState(pitch);
  const [localVolume, setLocalVolume] = useState(volume);

  const handlePitchChange = (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    setLocalPitch(val);
  };

  const handlePitchChangeEnd = (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    setPitch(val);
  };

  const handleVolumeChange = (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    setLocalVolume(val);
  };

  const handleVolumeChangeEnd = (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    setVolume(val);
  };

  const handleReset = () => {
    setPlaybackRate(1);
    setPitch(1);
    setVolume(1);
    setLocalPitch(1);
    setLocalVolume(1);
  };

  // Prepare voice items for autocomplete, sorted with British English first
  const voiceItems = useMemo(() => {
    return availableVoices
      .map((voice) => ({
        voice,
        key: voice.voiceURI,
        label: voice.name,
        description: `${voice.lang} | ${categorizeVoice(voice)}`,
        isBritish: isBritishEnglish(voice),
        isOnline: voice.name.includes("Online"),
      }))
      .sort((a, b) => {
        // Sort: Online British > British > Online > Others
        if (a.isBritish && a.isOnline && !(b.isBritish && b.isOnline)) return -1;
        if (b.isBritish && b.isOnline && !(a.isBritish && a.isOnline)) return 1;
        if (a.isBritish && !b.isBritish) return -1;
        if (b.isBritish && !a.isBritish) return 1;
        if (a.isOnline && !b.isOnline) return -1;
        if (b.isOnline && !a.isOnline) return 1;
        return a.label.localeCompare(b.label);
      });
  }, [availableVoices]);

  const handleVoiceSelect = (key: React.Key | null) => {
    if (!key) return;
    const voice = availableVoices.find((v) => v.voiceURI === key);
    if (voice) {
      onVoiceChange(voice);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      placement="bottom"
      backdrop="blur"
      classNames={{
        base: "bg-accent-shade-1 max-h-[85vh]",
        header: "border-b border-light-grey-2",
        body: "py-4 overflow-y-auto",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between">
          <span className={`text-primary-colour ${Magnetik_Medium.className}`}>
            TTS Settings
          </span>
          
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* Voice Selection with Autocomplete */}
          <div className="space-y-2">
            <label
              className={`text-sm text-primary-shade-4 ${Magnetik_Medium.className} flex items-center gap-2`}
            >
              <Mic className="w-4 h-4" />
              Voice
            </label>
            <PremiumGate feature="advancedVoices" lockedMessage="Premium voices">
              <Autocomplete
                label="Select a voice"
                placeholder="Search voices..."
                defaultSelectedKey={selectedVoice?.voiceURI}
                onSelectionChange={handleVoiceSelect}
                size="sm"
                classNames={{
                  base: "w-full",
                  listboxWrapper: "max-h-[200px]",
                }}
                inputProps={{
                  classNames: {
                    input: `${Magnetik_Regular.className} text-primary-colour`,
                    inputWrapper: "bg-white border border-light-grey-2",
                  },
                }}
                listboxProps={{
                  emptyContent: "No voices found",
                }}
              >
                {voiceItems.map((item) => (
                  <AutocompleteItem
                    key={item.key}
                    textValue={item.label}
                    className="py-2"
                  >
                    <div className="flex flex-col">
                      <span
                        className={`text-sm text-primary-shade-5 ${Magnetik_Medium.className}`}
                      >
                        {item.label}
                        {item.isBritish && item.isOnline && (
                          <span className="ml-2 text-xs text-complimentary-colour">
                            ★ Recommended
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-xs text-grey-1 ${Magnetik_Regular.className}`}
                      >
                        {item.description}
                      </span>
                    </div>
                  </AutocompleteItem>
                ))}
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
