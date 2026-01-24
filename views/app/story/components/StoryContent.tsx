"use client";

import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { useTTSStore } from "@/src/stores/useTTSStore";
import { Avatar } from "@heroui/avatar";
import DOMPurify from "dompurify";
import { Play } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// Custom TTS Hook
import { useTTSContext } from "@/components/providers/TTSProvider";
import { useTTS } from "@/src/hooks/useTTS";
import { useSmartVoice } from "@/src/hooks/useVoiceUtils";

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

    // Helper to split HTML content into sentences
    const splitHtmlIntoSentences = useCallback((htmlContent: string, globalStartIndex: number) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      const segments: {
        text: string;
        html: string;
        displayHtml: string; // New field for identifying HTML without directives
        index: number;
      }[] = [];

      let currentText = "";
      let currentHtml = "";
      let currentIndex = globalStartIndex;

      const flushSegment = () => {
        if (currentText.trim()) {
           // Create display HTML by removing directives pattern [[...]]
           // We use a regex to strip them.
           const displayHtml = currentHtml.replace(/\[\[.*?\]\]/g, "");
           
           segments.push({
             text: currentText.trim(),
             html: currentHtml.trim(),
             displayHtml: displayHtml.trim(),
             index: currentIndex++
           });
        }
        currentText = "";
        currentHtml = "";
      };

      // Recursive node traversal
      const traverse = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
           const text = node.textContent || "";
           
           // Split by punctuation, but respect ellipses and directives
           // Strategy: Match potential delimiters sequences: . ! ? 
           // We'll iterate through matches.
           
           const regex = /([.!?]+)(?=\s|$)|(\[\[.*?\]\])/g;
           // We want to capture delimiters to include them OR check them.
           // Actually, splitting by regex with capture gives us parts.
           
           // Improved manual scanning might be safer for ellipses check
           // Let's iterate character by character or use a smarter split.
           
           // Let's use split but include delimiters.
           // regex: /([.!?]+(?:(?=\s)|$))/
           
           const delimRegex = /([.!?]+(?:(?=\s)|$))/g;
           const parts = text.split(delimRegex);
           
           for (let i = 0; i < parts.length; i++) {
              const part = parts[i];
              if (!part) continue;
              
              const isDelimiter = /^[.!?]+$/.test(part);
              
              if (isDelimiter) {
                  // Check for ellipsis (2 or more dots)
                  if (part.indexOf('..') !== -1) {
                      // It is an ellipsis (or ..), treat as text
                      currentText += part;
                      currentHtml += part;
                  } else {
                      // It is a real sentence end (., !, ?)
                      currentText += part;
                      currentHtml += part;
                      flushSegment();
                  }
              } else {
                  currentText += part;
                  currentHtml += part;
              }
           }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          if (el.tagName === 'BR') {
             currentText += "\n";
             currentHtml += "<br>";
          } else {
             // For inline elements like <b>, <i>, <a>
             // Atomic handling
             currentText += el.textContent;
             currentHtml += el.outerHTML;
             
             // Check end of content ensuring we ignore ellipses
             const content = el.textContent || "";
             const match = content.match(/([.!?]+)\s*$/);
             if (match) {
                 const punct = match[1];
                 if (punct.indexOf('..') === -1) {
                     flushSegment();
                 }
             }
          }
        }
      };

      Array.from(tempDiv.childNodes).forEach(traverse);
      
      // Flush remaining
      flushSegment();

      return segments;
    }, []);

    // Parse content into blocks and sentences
    const { displayBlocks, allSentences } = useMemo(() => {
      if (typeof window === "undefined") return { displayBlocks: [], allSentences: [] };

      const blocks: {
        tagName: string;
        sentences: { text: string; html: string; displayHtml: string; index: number }[];
      }[] = [];
      
      const flatSentences: { text: string; index: number; startOffset: number; endOffset: number; html?: string }[] = [];
      
      let globalIndex = 0;

      // 1. Initial rough split by visual blocks/paragraphs
      const div = document.createElement("div");
      div.innerHTML = sanitizedContent;
      
      const processBlockNode = (node: Node) => {
         const el = node as Element;
         const tagName = (node.nodeName || "P").toLowerCase();
         const isBlock = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(tagName);
         
         if (isBlock || (node.nodeType === Node.TEXT_NODE && node.textContent?.trim())) {
             
             let innerHTML = "";
             let effectiveTagName = tagName;

             if (node.nodeType === Node.TEXT_NODE) {
                 innerHTML = node.textContent || "";
                 effectiveTagName = "p";
             } else {
                 innerHTML = el.innerHTML;
             }

             // Use the helper to split
             const blockSegments = splitHtmlIntoSentences(innerHTML, globalIndex);
             
             // Update global index based on segments count
             globalIndex += blockSegments.length;
             
             // Map to structures
             const blockSentences = blockSegments.map(s => ({
                 text: s.text,
                 html: s.html,
                 displayHtml: s.displayHtml,
                 index: s.index
             }));
             
             blockSegments.forEach(s => {
                 flatSentences.push({
                     text: s.text,
                     index: s.index,
                     startOffset: 0,
                     endOffset: 0,
                     html: s.html // TTS needs directives? Yes.
                 });
             });
             
             if (blockSentences.length > 0) {
                 blocks.push({
                     tagName: effectiveTagName,
                     sentences: blockSentences
                 });
             }
         } else if (node.nodeType === Node.ELEMENT_NODE) {
             Array.from(node.childNodes).forEach(processBlockNode);
         }
      };
      
      Array.from(div.childNodes).forEach(processBlockNode);

      return { displayBlocks: blocks, allSentences: flatSentences };
      
    }, [sanitizedContent, splitHtmlIntoSentences]);

    // Initialize TTS
    // If segments are empty (e.g. initial render or empty content), pass empty array or content string
    const ttsInput = allSentences.length > 0 ? allSentences : sanitizedContent;

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

    // Handle single click to play (Seeking)
    const handleSegmentClick = useCallback(
      (e: React.MouseEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        
        // If we are already playing, just jump there
        seekToSentence(index);
        // Ensure play is active
        if (!storeIsPlaying) {
            play();
        }
      },
      [seekToSentence, play, storeIsPlaying]
    );
    
    // Handle double click for context menu (Desktop alternatives)
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
            {displayBlocks.length > 0 ? (
              displayBlocks.map((block, bIdx) => {
                 // Determine Block Wrapper
                 const Tag = block.tagName as keyof JSX.IntrinsicElements;
                 
                 return (
                   <div key={bIdx} className="mb-4">
                      <Tag className="block mb-2">
                       {block.sentences.map((sent) => {
                          const isActive = storeIsPlaying && sent.index === storeCurrentIndex;
                          const isPausedAt = storeIsPaused && sent.index === storeCurrentIndex;
                          
                          return (
                            <span
                              key={sent.index}
                              data-sentence-index={sent.index}
                              onClick={(e) => handleSegmentClick(e, sent.index)}
                              onDoubleClick={(e) => handleSegmentDoubleClick(e, sent.index)}
                              onTouchStart={(e) => handleTouchStart(e, sent.index)}
                              onTouchEnd={handleTouchEnd}
                              onTouchMove={handleTouchMove}
                              className={`transition-all duration-200 rounded px-1 -mx-1 cursor-pointer
                                ${
                                  isActive
                                    ? "bg-complimentary-colour/20 text-black shadow-sm font-medium"
                                    : isPausedAt
                                      ? "bg-primary-colour/15 text-black"
                                      : "hover:bg-accent-colour/20"
                                }`}
                            >
                              <span dangerouslySetInnerHTML={{ __html: sent.displayHtml }} />
                              {/* Add a generic space after sentence to prevent running together visually if split stripped it? 
                                  Our parsing logic usually keeps the space in the sentence.
                              */}
                            </span>
                          );
                       })}
                     </Tag>
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
