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

    // Helper to split HTML content into sentences
    const splitHtmlIntoSentences = useCallback((htmlContent: string, globalStartIndex: number) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      const segments: {
        text: string;
        html: string;
        index: number;
      }[] = [];

      let currentText = "";
      let currentHtml = "";
      let currentIndex = globalStartIndex;

      // Simple sentence splitter regex: ends with . ! ? followed by whitespace or end of string
      // But we need to be careful not to split abbreviations.
      // For now, we'll traverse nodes and accumulate.
      
      const flushSegment = () => {
        if (currentText.trim()) {
           segments.push({
             text: currentText.trim(),
             html: currentHtml.trim(), // We might need to close/open tags if we split across them, but for now assuming block-level split logic handles most.
                                       // Actually, splitting HTML *correctly* across tags is very hard. 
                                       // A simpler approach for "Rich Text" that is mostly text:
                                       // If we encounter a block tag, we likely already handled it in the parent loop.
                                       // So here we are inside a <p> or <h1>. 
                                       // We can just accumulate node HTML.
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
           // Check for sentence boundaries in this text node
           // This regex looks for punctuation that usually ends a sentence
           const parts = text.split(/([.!?]+(?:\s+|$))/g);
           
           for (let i = 0; i < parts.length; i++) {
              const part = parts[i];
              // If part is just delimiter, append to current and flush?
              // The split keeps delimiters if captured. 
              // With capture group: ["Hello", ". ", "World", "?", ""]
              
              if (!part) continue;

              // Append to current accumulation
              currentText += part;
              currentHtml += part ; // Text node content is safe to append as is (browser handles escaping usually if we used innerHTML, but here wait..)
                                    // Actually we need to escape HTML special chars if we append text to HTML string.
              
              // If this part *is* a delimiter (or contains one at end), we might flush.
              // Regex checking:
              if (/[.!?]+(?:\s+|$)/.test(part)) {
                 // It's a terminator.
                 flushSegment();
              }
           }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          if (el.tagName === 'BR') {
             currentText += "\n";
             currentHtml += "<br>";
             // Br often acts as a pause but maybe not a hard sentence break unless visual? 
             // Let's treat it as part of flow.
          } else {
             // For inline elements like <b>, <i>, <a>
             // We want to keep them intact. 
             // Complexity: What if a sentence ends INSIDE a <b>? 
             // "This is <b>bold!</b> And this is not."
             // If we just append outerHTML, we treat the whole <b>...</b> as one unit.
             // This avoids breaking tags. It's a compromise.
             currentText += el.textContent;
             currentHtml += el.outerHTML;
             
             // Check if the element ITSELF ends with punctuation? 
             // "<b>Bold sentence!</b>" -> textContent "Bold sentence!" -> ends with !
             if (/[.!?]+\s*$/.test(el.textContent || "")) {
                flushSegment();
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
        sentences: { text: string; html: string; index: number }[];
      }[] = [];
      
      const flatSentences: { text: string; index: number; startOffset: number; endOffset: number; html?: string }[] = [];
      
      let globalIndex = 0;

      // 1. Initial rough split by visual blocks/paragraphs to preserve layout
      const div = document.createElement("div");
      div.innerHTML = sanitizedContent;
      
      const processBlockNode = (node: Node) => {
         const el = node as Element;
         const tagName = (node.nodeName || "P").toLowerCase();
         const isBlock = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(tagName);
         
         if (isBlock || (node.nodeType === Node.TEXT_NODE && node.textContent?.trim())) {
             // It's a block. 
             // Extract content to parse into sentences.
             // If it's a Text Node at root, wrap in P implicit? Or just treat as block.
             
             let innerHTML = "";
             let effectiveTagName = tagName;

             if (node.nodeType === Node.TEXT_NODE) {
                 innerHTML = node.textContent || "";
                 effectiveTagName = "p";
             } else {
                 innerHTML = el.innerHTML;
             }

             // Now split this block's content into sentences
             // We need a sophisticated splitter that can handle "Blah <b>blah</b>."
             // Re-using the logic defined above (but we need to move it inside or use closure)
             
             const tempDiv = document.createElement('div');
             tempDiv.innerHTML = innerHTML;
             
             const blockSentences: { text: string; html: string; index: number }[] = [];
             
             let currentText = "";
             let currentHtml = "";
             
             const flush = () => {
                 if (currentText.trim()) {
                     const idx = globalIndex++;
                     blockSentences.push({
                         text: currentText.trim(),
                         html: currentHtml.trim(),
                         index: idx
                     });
                     flatSentences.push({
                         text: currentText.trim(),
                         index: idx,
                         startOffset: 0, 
                         endOffset: 0,
                         html: currentHtml.trim()
                     });
                 }
                 currentText = "";
                 currentHtml = "";
             };
             
             const traverseInfo = (n: Node) => {
                 if (n.nodeType === Node.TEXT_NODE) {
                     const val = n.textContent || "";
                     // Split by punctuation
                     // Simple regex: look for sequence of .!? followed by whitespace or EOF
                     const pd = /([.!?]+(?:\s+|$))/g;
                     const parts = val.split(pd);
                     
                     for (let i = 0; i < parts.length; i++) {
                         const part = parts[i];
                         if (!part) continue;
                         
                         // If it matches delimiter, append and flush check
                         if (part.match(/^[.!?]+(?:\s+|$)$/)) {
                             currentText += part;
                             currentHtml += part;
                             flush(); // Delimiter ends the sentence
                         } else {
                             // Regular text
                             currentText += part;
                             currentHtml += part;
                         }
                     }
                 } else if (n.nodeType === Node.ELEMENT_NODE) {
                     const elem = n as Element;
                     if (elem.tagName === 'BR') {
                         currentHtml += "<br>";
                         currentText += " "; // Treat br as space for TTS text
                     } else {
                         // Element like <b>, <i>..
                         // Treat as indivisible unit to avoid breaking tags
                         // CAUTION: "This is <b>Great.</b>" -> The period is inside the B.
                         // If we don't look inside, we miss the split.
                         
                         // Recursive strategy??
                         // If we recurse, we can't easily perform "currentHtml += <b" .. "</b>" 
                         // unless we rebuild the tree.
                         
                         // Compromise: For specific formatting tags, we recurse? 
                         // Complex.
                         
                         // Simpler Compromise: Treat inline tags as atomic. 
                         // If a sentence ends inside a tag, the Whole Tag belongs to that sentence.
                         // "This is <b>awesome.</b>" -> Sentence: "This is <b>awesome.</b>" (Correct)
                         // "One. <b>Two.</b>" -> "One." then "<b>Two.</b>" (Correct)
                         // "Start <b>Middle. End</b>" -> "Start <b>Middle. End</b>" (Incorrect merge)
                         
                         // Given typical blog content, nested sentences inside styling are rare 
                         // OR usually the styling wraps the whole sentence or phrase.
                         // Let's stick to atomic inline tags for robustness against invalid HTML.
                         
                         currentText += elem.textContent;
                         currentHtml += elem.outerHTML;
                         
                         // Check if atomic element ended with punctuation
                         if (/[.!?]+\s*$/.test(elem.textContent || "")) {
                             flush();
                         }
                     }
                 }
             };
             
             Array.from(tempDiv.childNodes).forEach(traverseInfo);
             flush(); // Flush remainder
             
             if (blockSentences.length > 0) {
                 blocks.push({
                     tagName: effectiveTagName,
                     sentences: blockSentences
                 });
             }
         } else if (node.nodeType === Node.ELEMENT_NODE) {
             // Recurse into non-block containers? Or just flatten?
             // If we have a div wrapping Ps, typical.
             Array.from(node.childNodes).forEach(processBlockNode);
         }
      };
      
      Array.from(div.childNodes).forEach(processBlockNode);

      return { displayBlocks: blocks, allSentences: flatSentences };
      
    }, [sanitizedContent]);

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
                               <span dangerouslySetInnerHTML={{ __html: sent.html }} />
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
