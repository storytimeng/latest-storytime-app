"use client";

import React, { useState, useMemo } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Slider } from "@heroui/slider";
import { Autocomplete, AutocompleteItem, AutocompleteSection } from "@heroui/autocomplete";
import { RotateCcw, Star } from "lucide-react";
import { Magnetik_Medium, Magnetik_Regular, Magnetik_Bold } from "@/lib/font";
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

  // Helper to determine if a voice is "Recommended" (High quality/Premium-like)
  const isRecommended = (voice: SpeechSynthesisVoice) => {
    const lowerName = voice.name.toLowerCase();
    return (
      voice.lang.startsWith("en") &&
      (lowerName.includes("online") || lowerName.includes("natural"))
    );
  };

  // Group voices by Language
  const groupedVoices = useMemo(() => {
    const groups: Record<string, SpeechSynthesisVoice[]> = {};
    const langNames = new Intl.DisplayNames(['en'], { type: 'language' });

    availableVoices.forEach((voice) => {
      // Get readable language name
      let langName = voice.lang;
      try {
        // Handle "en-US", "en-GB" etc.
        // We might want to group all "English" together or separate by region?
        // User asked for "en-gb or en-us online models".
        // Let's use full readable name: "English (United States)"
        // Intl.DisplayNames usually gives "English" for "en". For "en-US" it might give "American English".
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
        
        const langCode = voice.lang.split('-')[0];
        const regionCode = voice.lang.split('-')[1]; // US, GB
        
        const baseLang = langNames.of(langCode) || langCode;
        if (regionCode) {
           const region = regionNames.of(regionCode) || regionCode;
           langName = `${baseLang} (${region})`;
        } else {
           langName = baseLang;
        }
      } catch (e) {
        langName = voice.lang;
      }

      if (!groups[langName]) {
        groups[langName] = [];
      }
      groups[langName].push(voice);
    });

    // Sort groups: English first, then alphabetical
    const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
       const aEn = a.includes("English");
       const bEn = b.includes("English");
       if (aEn && !bEn) return -1;
       if (!aEn && bEn) return 1;
       return a.localeCompare(b);
    });

    return sortedGroupKeys.map(groupTitle => {
        const voices = groups[groupTitle].sort((a, b) => {
            // Sort recommended first within group
            const aRec = isRecommended(a);
            const bRec = isRecommended(b);
            if (aRec && !bRec) return -1;
            if (!aRec && bRec) return 1;
            return a.name.localeCompare(b.name);
        });
        return {
            title: groupTitle,
            items: voices
        };
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
                placeholder="Select a voice"
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
                  listboxWrapper: "max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
                  selectorButton: "text-primary-shade-4",
                  popoverContent: "p-0",
                }}
                listboxProps={{
                  itemClasses: {
                    base: "py-2 px-3 data-[hover=true]:bg-accent-shade-1",
                  },
                }}
                inputProps={{
                  classNames: {
                    input: `${Magnetik_Regular.className} text-primary-colour`,
                    inputWrapper: "bg-white border-light-grey-2 min-h-[44px]",
                  },
                }}
              >
                {groupedVoices.map((group) => (
                  <AutocompleteSection 
                    key={group.title} 
                    title={group.title}
                    classNames={{
                        heading: `text-xs font-semibold text-gray-500 uppercase px-3 py-2 bg-transparent`
                    }}
                  >
                    {group.items.map((voice) => {
                       const recommended = isRecommended(voice);
                       return (
                        <AutocompleteItem 
                           key={voice.voiceURI} 
                           textValue={voice.name}
                           classNames={{
                               base: "h-auto py-2", // Allow auto height
                           }}
                        >
                          <div className="flex flex-col gap-0.5">
                             <div className="flex items-center gap-2">
                                <span className={`text-sm leading-tight ${recommended ? "text-amber-600 font-medium" : "text-primary-colour"}`}>
                                  {voice.name.replace(/Microsoft |Online \(Natural\) - /g, "")}
                                </span>
                                {recommended && (
                                   <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 border border-amber-200">
                                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                      <span className="text-[10px] font-medium text-amber-700 uppercase tracking-wider">Premium</span>
                                   </div>
                                )}
                             </div>
                            {/* Detailed full name or extra info if needed */}
                            {recommended && false && (
                                <span className="text-[10px] text-amber-600/80">
                                    High Quality Neural Voice
                                </span>
                            )}
                          </div>
                        </AutocompleteItem>
                       );
                    })}
                  </AutocompleteSection>
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
