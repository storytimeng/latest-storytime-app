"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Avatar } from "@heroui/avatar";
import { Magnetik_Regular, Magnetik_Medium } from "@/lib/font";
import DOMPurify from "dompurify";
import { Play } from "lucide-react";
import { useTTSStore } from "@/src/stores/useTTSStore";
// Use the library hook
import { useSpeech, useVoices } from "react-text-to-speech";
import { parseSentences } from "@/src/hooks/useTTS"; // Keep for sentence parsing/analysis if needed, but not for playback
import { useSmartVoice } from "@/src/hooks/useVoiceUtils";
import { useTTSContext } from "@/components/providers/TTSProvider";
import { PremiumGate } from "@/components/reusables/PremiumGate";
import { usePremiumFeatures } from "@/src/hooks/usePremiumFeatures";

interface StoryContentProps {
  content: string;
  authorName: string;
  authorAvatar?: string;
  hasNavigation: boolean;
  description?: string;
  onPlayFromSentence?: (sentenceIndex: number) => void;
}

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  sentenceIndex: number;
}

export const StoryContent = React.memo(
  ({
    content,
    authorName,
    authorAvatar,
    hasNavigation,
    description,
  }: StoryContentProps) => {
    const { registerControls } = useTTSContext();
    const {
      playbackRate,
      pitch,
      volume,
      selectedVoiceURI,
      setPlaying,
      setPaused,
      stop: stopStore,
      setCurrentSentenceIndex,
      setSelectedVoiceURI
    } = useTTSStore();
    const { checkFeature } = usePremiumFeatures();
    const { voices } = useVoices();

    // Context menu state
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
      isOpen: false,
      x: 0,
      y: 0,
      sentenceIndex: 0,
    });

    // Sanitize and extract plain text
    const sanitizedContent = useMemo(() => {
      // Basic sanitization
      return DOMPurify.sanitize(content, {
          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'img']
      });
    }, [content]);

    // Strip tags for the TTS engine to read clean text
    const plainText = useMemo(() => {
       const tmp = document.createElement("DIV");
       tmp.innerHTML = sanitizedContent;
       return tmp.textContent || "";
    }, [sanitizedContent]);

    // Resolve voice
    const resolvedVoice = useSmartVoice(voices, selectedVoiceURI);
    
    // Update store with resolved voice if needed
    useEffect(() => {
        if (resolvedVoice && resolvedVoice.voiceURI !== selectedVoiceURI) {
            setSelectedVoiceURI(resolvedVoice.voiceURI);
        }
    }, [resolvedVoice, selectedVoiceURI, setSelectedVoiceURI]);


    // Initialize Library Hook
    const { Text, start, pause, stop, speechStatus } = useSpeech({
      text: plainText, // Speak the plain text
      pitch,
      rate: playbackRate,
      volume,
      voiceURI: resolvedVoice?.voiceURI,
      highlightText: true,
      highlightMode: "sentence",
      preserveUtteranceQueue: true, // Fix for stopping after one line
      onStart: () => setPlaying(true),
      onPause: () => setPaused(true),
      onStop: () => {
          stopStore();
          // Reset highlights if needed
      },
      onBoundary: (e: any) => {
          // Check for native event properties if available as 'any', otherwise use library 'progress' abstraction if it exists
          if (e.name === 'sentence' || e.name === 'word') {
             // Calculate approximate progress
             const charIndex = e.charIndex;
             const length = plainText.length;
             // Update store (we might need a standard progress action)
             // setProgress(progressFn);
             // Also total sentences tracking?
          }
          if (typeof e.progress === 'number') {
             // If library exposes progress (0-100 or 0-1)
             // Assumption: e.progress is percentage 0-100? Or fraction?
             // Let's assume fraction 0-1 if small, or check docs. Assuming 0-1 from common Web Speech API usage wrappers
             // Use estimated duration to set elapsed
             // const elapsed = e.progress * useTTSStore.getState().estimatedDurationSeconds; 
             // setElapsedSeconds(elapsed);
          }
      },
      onError: (e) => console.error("TTS Error", e)
    });

    // Register controls with parent provider so NavigationBar can access them
    useEffect(() => {
      registerControls({
        play: start,
        pause,
        stop,
        replay: () => {
            stop();
            start();
        }
      });
    }, [registerControls, start, pause, stop]);

    // Handle double click using DOM/Selection to enable "Play from here"
    // Note: The library doesn't expose a "seek" function easily for character index.
    // We would need to restart speech with substring.
    // For now, "Play from here" might be limited if the library doesn't support start offset.
    // But since the user INSISTED on this library, we use what it offers.
    // We can simulate "Play from here" by chopping the text?
    // If we chop the text, the highlights desync with the full text displayed.
    
    const handleDoubleClick = (e: React.MouseEvent) => {
       // Placeholder for Play From Here with lib limitations
       // If we want to support it, we might need to recreate the hook with new 'text' prop?
    };

    return (
        <div className={`px-4 py-6 pb-9 ${hasNavigation ? "pt-44" : "pt-32"}`}>
        <div className="mb-6 space-y-4">
          
          <div className={`text-primary-shade-5 text-sm leading-relaxed ${Magnetik_Regular.className} story-rich-text`}>
             {/* Wrap content in Text component for highlighting */}
             <Text>
                 <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
             </Text>
          </div>

          <div className="w-full h-px my-6 bg-light-grey-2" />

          <div className="flex items-center gap-2 mb-3">
            <Avatar
              src={authorAvatar || "/images/placeholder-image.svg"}
              name={authorName}
              size="sm"
              className="w-6 h-6"
            />
            <span
              className={`text-primary-colour text-xs ${Magnetik_Medium.className}`}
            >
              By {authorName}
            </span>
          </div>

          {description && (
            <div
              className={`text-primary-shade-4 text-sm leading-relaxed ${Magnetik_Regular.className}`}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    );
  }
);

StoryContent.displayName = "StoryContent";
