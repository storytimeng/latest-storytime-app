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
import { useSpeech } from "react-text-to-speech";
import { usePremiumFeatures } from "@/src/hooks/usePremiumFeatures";
import { useTTSStore } from "@/src/stores/useTTSStore";

interface StoryContentProps {
  content: string;
  authorName: string;
  authorAvatar?: string;
  hasNavigation: boolean;
  description?: string;
  /** Callback when TTS state changes */
  onTTSStateChange?: (state: {
    isPlaying: boolean;
    isPaused: boolean;
    start: () => void;
    pause: () => void;
    stop: () => void;
  }) => void;
}

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
}

// Preferred voice names in order of preference
const PREFERRED_VOICES = [
  "Microsoft Libby Online",
  "Microsoft Sonia Online",
  "Google UK English Female",
  "Google UK English Male",
];

const EN_GB_PATTERN = /en[-_]GB/i;

// Get preferred voice
const getPreferredVoice = (voices: SpeechSynthesisVoice[]): string | undefined => {
  // Try preferred voices
  for (const preferredName of PREFERRED_VOICES) {
    const found = voices.find((v) =>
      v.name.toLowerCase().includes(preferredName.toLowerCase())
    );
    if (found) return found.voiceURI;
  }

  // Try en-GB online
  const enGBOnline = voices.find(
    (v) => EN_GB_PATTERN.test(v.lang) && v.name.includes("Online")
  );
  if (enGBOnline) return enGBOnline.voiceURI;

  // Try any en-GB
  const enGB = voices.find((v) => EN_GB_PATTERN.test(v.lang));
  if (enGB) return enGB.voiceURI;

  return undefined;
};

export const StoryContent = React.memo(
  ({
    content,
    authorName,
    authorAvatar,
    hasNavigation,
    description,
    onTTSStateChange,
  }: StoryContentProps) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const { checkFeature } = usePremiumFeatures();
    
    // Get settings from store
    const { 
      selectedVoiceURI, 
      playbackRate, 
      pitch, 
      volume,
      setSelectedVoiceURI 
    } = useTTSStore();

    // Context menu state
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
      isOpen: false,
      x: 0,
      y: 0,
    });

    // Long press handling
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const touchStartPos = useRef<{ x: number; y: number } | null>(null);

    // Initial voice selection if not set in store
    useEffect(() => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0 && !selectedVoiceURI) {
          const preferred = getPreferredVoice(voices);
          if (preferred) setSelectedVoiceURI(preferred);
        }
      };

      loadVoices();
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      };
    }, [selectedVoiceURI, setSelectedVoiceURI]);

    // Sanitize and prepare content for TTS
    const sanitizedContent = useMemo(() => {
      return DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          "b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li",
          "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "span", "div",
        ],
        ALLOWED_ATTR: ["href", "target", "style", "class"],
      });
    }, [content]);

    // Create memoized text node for react-text-to-speech
    const textNode = useMemo(() => {
      // Convert HTML to React elements for proper TTS reading
      return (
        <div
          className={`text-primary-shade-5 text-sm leading-relaxed ${Magnetik_Regular.className} story-rich-text`}
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      );
    }, [sanitizedContent]);

    // Use react-text-to-speech hook
    const {
      Text, // This component MUST be rendered for TTS to work
      speechStatus,
      start,
      pause,
      stop,
    } = useSpeech({
      text: textNode,
      voiceURI: selectedVoiceURI || undefined,
      rate: playbackRate,
      pitch: pitch,
      volume: volume,
      highlightText: true,
      highlightMode: "sentence",
      highlightProps: {
        style: {
          backgroundColor: "var(--complimentary-shade-1)",
          borderRadius: "4px",
          padding: "2px 4px",
        },
      },
    });

    // Notify parent of TTS state changes
    useEffect(() => {
      if (onTTSStateChange) {
        onTTSStateChange({
          isPlaying: speechStatus === "started",
          isPaused: speechStatus === "paused",
          start,
          pause,
          stop,
        });
      }
    }, [speechStatus, start, pause, stop, onTTSStateChange]);

    // Close context menu on scroll or click outside
    useEffect(() => {
      const handleScroll = () =>
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
      const handleClick = () =>
        setContextMenu((prev) => ({ ...prev, isOpen: false }));

      if (contextMenu.isOpen) {
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("click", handleClick);
        return () => {
          window.removeEventListener("scroll", handleScroll);
          window.removeEventListener("click", handleClick);
        };
      }
    }, [contextMenu.isOpen]);

    // Handle double click to show context menu
    const handleDoubleClick = useCallback(
      (e: React.MouseEvent) => {
        if (!checkFeature("playFromHere")) return;

        e.preventDefault();
        e.stopPropagation();

        setContextMenu({
          isOpen: true,
          x: e.clientX,
          y: e.clientY,
        });
      },
      [checkFeature]
    );

    // Handle touch start for long press
    const handleTouchStart = useCallback(
      (e: React.TouchEvent) => {
        if (!checkFeature("playFromHere")) return;

        const touch = e.touches[0];
        touchStartPos.current = { x: touch.clientX, y: touch.clientY };

        longPressTimer.current = setTimeout(() => {
          setContextMenu({
            isOpen: true,
            x: touch.clientX,
            y: touch.clientY,
          });
        }, 500);
      },
      [checkFeature]
    );

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (longPressTimer.current && touchStartPos.current) {
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - touchStartPos.current.x);
        const dy = Math.abs(touch.clientY - touchStartPos.current.y);

        if (dx > 10 || dy > 10) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
    }, []);

    const handleTouchEnd = useCallback(() => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }, []);

    // Handle "Play from here" action
    const handlePlayFromHere = useCallback(() => {
      start();
      setContextMenu((prev) => ({ ...prev, isOpen: false }));
    }, [start]);

    return (
      <div className={`px-4 py-6 pb-9 ${hasNavigation ? "pt-44" : "pt-32"}`}>
        <div className="mb-6 space-y-4">
          {/* Story Content with TTS Highlighting - Text component MUST be rendered */}
          <div
            ref={contentRef}
            onDoubleClick={handleDoubleClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className="select-text"
          >
            <Text />
          </div>

          {/* Divider */}
          <div className="w-full h-px my-6 bg-light-grey-2" />

          {/* Author Section */}
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

          {/* Description */}
          {description && (
            <div
              className={`text-primary-shade-4 text-sm leading-relaxed ${Magnetik_Regular.className}`}
            >
              {description}
            </div>
          )}
        </div>

        {/* Context Menu */}
        {contextMenu.isOpen && (
          <div
            className="fixed z-50 bg-accent-shade-1 border border-light-grey-2 rounded-lg shadow-lg py-1 min-w-[140px] tts-context-menu"
            style={{
              left: Math.min(contextMenu.x, window.innerWidth - 150),
              top: Math.max(contextMenu.y - 40, 10),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handlePlayFromHere}
              className={`flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-accent-shade-2 transition-colors ${Magnetik_Medium.className}`}
            >
              <Play className="w-4 h-4 text-complimentary-colour" />
              <span className="text-sm text-primary-shade-5">
                Play from here
              </span>
            </button>
          </div>
        )}
      </div>
    );
  }
);

StoryContent.displayName = "StoryContent";
