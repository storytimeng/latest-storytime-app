"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Magnetik_Regular, Magnetik_Medium } from "@/lib/font";
import DOMPurify from "dompurify";
import { Play, X } from "lucide-react";
import { useTTSStore } from "@/src/stores/useTTSStore";
// Custom TTS Hook
import { useTTS } from "@/src/hooks/useTTS";
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
      setSelectedVoiceURI,
      isPlaying: storeIsPlaying,
      isPaused: storeIsPaused,
      currentSentenceIndex: storeCurrentIndex,
    } = useTTSStore();

    // Context menu state for "Play from here"
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
      isOpen: false,
      x: 0,
      y: 0,
      sentenceIndex: 0,
    });
    const contentRef = useRef<HTMLDivElement>(null);

    // Sanitize first
    const sanitizedContent = useMemo(() => {
      return DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          "b",
          "i",
          "em",
          "strong",
          "a",
          "p",
          "br",
          "ul",
          "ol",
          "li",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "span",
          "div",
          "img",
        ],
      });
    }, [content]);

    // Parse content into paragraphs/segments for TTS
    const segments = useMemo(() => {
      if (typeof window === "undefined") return [];

      // First, check if content is mostly plain text (no HTML tags or just basic formatting)
      const hasBlockElements = /<(p|div|h[1-6]|li|br)\s*\/?>/i.test(content);

      const chunks: {
        text: string;
        html: string;
        index: number;
        startOffset: number;
        endOffset: number;
      }[] = [];
      let index = 0;

      if (!hasBlockElements) {
        // Plain text - split by double newlines (paragraphs) or single newlines
        const plainText = content
          .replace(/<[^>]*>/g, "") // Remove any HTML tags
          .trim();

        // Split by paragraph breaks (double newline) or single newlines
        const paragraphs = plainText.split(/\n\n+|\n/).filter((p) => p.trim());

        paragraphs.forEach((para) => {
          const trimmed = para.trim();
          if (trimmed) {
            chunks.push({
              text: trimmed,
              html: trimmed.replace(/\n/g, "<br>"),
              index: index++,
              startOffset: 0,
              endOffset: 0,
            });
          }
        });
      } else {
        // HTML content - parse properly
        const div = document.createElement("div");
        div.innerHTML = sanitizedContent;

        // Helper to process nodes
        const processNode = (node: Element | ChildNode) => {
          const tagName = (node.nodeName || "").toLowerCase();
          const isBlock = [
            "p",
            "div",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "li",
          ].includes(tagName);

          if (isBlock) {
            const text = node.textContent?.trim();
            if (text) {
              chunks.push({
                text: text,
                html: (node as Element).innerHTML || text,
                index: index++,
                startOffset: 0,
                endOffset: 0,
              });
            }
          } else if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text && text.length > 10) {
              // Only substantial text nodes
              chunks.push({
                text: text,
                html: text,
                index: index++,
                startOffset: 0,
                endOffset: 0,
              });
            }
          } else if (node.nodeType === Node.ELEMENT_NODE && tagName === "br") {
            // Skip br tags
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Process children of inline elements
            Array.from(node.childNodes).forEach(processNode);
          }
        };

        Array.from(div.childNodes).forEach(processNode);
      }

      // Fallback: if no chunks, treat entire content as one segment
      if (chunks.length === 0) {
        const plainText = content.replace(/<[^>]*>/g, "").trim();
        if (plainText) {
          chunks.push({
            text: plainText,
            html: sanitizedContent || plainText,
            index: 0,
            startOffset: 0,
            endOffset: 0,
          });
        }
      }

      return chunks;
    }, [content, sanitizedContent]);

    // Initialize TTS
    // If segments are empty (e.g. initial render or empty content), pass empty array or content string
    const ttsInput = segments.length > 0 ? segments : sanitizedContent;

    const {
      isPlaying,
      currentSentenceIndex,
      play,
      pause,
      stop,
      seekToSentence,
      sentences: stringSentences,
      availableVoices: voices,
    } = useTTS(ttsInput);

    // Sync voice with store (from original code)
    const resolvedVoice = useSmartVoice(voices, selectedVoiceURI);
    useEffect(() => {
      if (resolvedVoice && resolvedVoice.voiceURI !== selectedVoiceURI) {
        setSelectedVoiceURI(resolvedVoice.voiceURI);
      }
    }, [resolvedVoice, selectedVoiceURI, setSelectedVoiceURI]);

    // Register controls
    useEffect(() => {
      registerControls({
        play,
        pause,
        stop,
        replay: () => {
          stop();
          play();
        },
        seekToSentence,
      });
    }, [registerControls, play, pause, stop, seekToSentence]);

    // Handle play from here - using tap/click with context menu
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const touchStartPos = useRef({ x: 0, y: 0 });

    const showContextMenu = useCallback(
      (x: number, y: number, index: number) => {
        setContextMenu({
          isOpen: true,
          x: x,
          y: y,
          sentenceIndex: index,
        });
      },
      []
    );

    // Handle long press for mobile
    const handleTouchStart = useCallback(
      (e: React.TouchEvent, index: number) => {
        const touch = e.touches[0];
        touchStartPos.current = { x: touch.clientX, y: touch.clientY };

        longPressTimerRef.current = setTimeout(() => {
          showContextMenu(touch.clientX, touch.clientY - 50, index);
        }, 500); // 500ms long press
      },
      [showContextMenu]
    );

    const handleTouchEnd = useCallback(() => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      const touch = e.touches[0];
      const distance = Math.sqrt(
        Math.pow(touch.clientX - touchStartPos.current.x, 2) +
          Math.pow(touch.clientY - touchStartPos.current.y, 2)
      );

      // Cancel if moved more than 10px
      if (distance > 10 && longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }, []);

    // Handle double click for desktop
    const handleSegmentDoubleClick = useCallback(
      (e: React.MouseEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();

        // Clear text selection that might have occurred
        window.getSelection()?.removeAllRanges();

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        showContextMenu(e.clientX, rect.top, index);
      },
      [showContextMenu]
    );

    const handlePlayFromHere = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        seekToSentence(contextMenu.sentenceIndex);
        play();
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
      },
      [contextMenu.sentenceIndex, seekToSentence, play]
    );

    const closeContextMenu = useCallback(() => {
      setContextMenu((prev) => ({ ...prev, isOpen: false }));
    }, []);

    // Close context menu on outside click or scroll
    useEffect(() => {
      const handleClickOutside = () => {
        if (contextMenu.isOpen) {
          closeContextMenu();
        }
      };

      const handleScroll = () => {
        if (contextMenu.isOpen) {
          closeContextMenu();
        }
      };

      document.addEventListener("click", handleClickOutside);
      document.addEventListener("scroll", handleScroll, true);
      return () => {
        document.removeEventListener("click", handleClickOutside);
        document.removeEventListener("scroll", handleScroll, true);
      };
    }, [contextMenu.isOpen, closeContextMenu]);

    // Cleanup long press timer
    useEffect(() => {
      return () => {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
        }
      };
    }, []);

    // Scroll to active sentence when TTS is playing
    useEffect(() => {
      if (storeIsPlaying && !storeIsPaused && contentRef.current) {
        const activeElement = contentRef.current.querySelector(
          `[data-sentence-index="${storeCurrentIndex}"]`
        );
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }, [storeCurrentIndex, storeIsPlaying, storeIsPaused]);

    return (
      <div
        ref={contentRef}
        className={`px-4 py-6 pb-9 ${hasNavigation ? "pt-44" : "pt-32"}`}
      >
        {/* Context Menu Popup */}
        {contextMenu.isOpen && (
          <div
            className="fixed z-[100] bg-white rounded-xl shadow-xl border border-light-grey-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: Math.min(
                Math.max(contextMenu.x, 80),
                window.innerWidth - 80
              ),
              top: Math.max(contextMenu.y - 48, 60),
              transform: "translateX(-50%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="flex items-center gap-2 px-4 py-3 text-sm text-primary-colour hover:bg-accent-shade-1 transition-colors w-full active:bg-accent-colour"
              onClick={handlePlayFromHere}
            >
              <Play className="w-4 h-4 text-complimentary-colour fill-complimentary-colour" />
              <span className={Magnetik_Medium.className}>Play from here</span>
            </button>
          </div>
        )}

        <div className="mb-6 space-y-4">
          <div
            className={`text-primary-shade-5 text-sm leading-relaxed ${Magnetik_Regular.className} story-rich-text`}
          >
            {segments.length > 0 ? (
              segments.map((seg, idx) => {
                const isActive = storeIsPlaying && idx === storeCurrentIndex;
                const isPastRead = storeIsPlaying && idx < storeCurrentIndex;
                const isPausedAt = storeIsPaused && idx === storeCurrentIndex;

                return (
                  <div
                    key={idx}
                    data-sentence-index={idx}
                    onDoubleClick={(e) => handleSegmentDoubleClick(e, idx)}
                    onTouchStart={(e) => handleTouchStart(e, idx)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                    className={`mb-4 transition-all duration-200 rounded-lg px-3 py-2 -mx-2 cursor-pointer
                                ${
                                  isActive
                                    ? "bg-complimentary-colour/15 border-l-4 border-complimentary-colour pl-4 shadow-sm"
                                    : isPausedAt
                                      ? "bg-primary-colour/10 border-l-4 border-primary-colour pl-4"
                                      : isPastRead
                                        ? "bg-accent-colour/30"
                                        : "hover:bg-light-grey-1 active:bg-light-grey-2"
                                }`}
                  >
                    <div dangerouslySetInnerHTML={{ __html: seg.html }} />
                  </div>
                );
              })
            ) : (
              <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            )}
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
