import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MoreVertical,
  BookOpen,
  Headphones,
  Lock,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Magnetik_Bold, Magnetik_Medium } from "@/lib/font";
import { cn } from "@/lib/utils";
import type { StoryShell } from "@/lib/storyRoutes";

export type StoryReadingMode = "read" | "listen";

interface StoryHeaderProps {
  storyId: string;
  currentTitle: string;
  storyTitle: string;
  isVisible: boolean;
  showDropdown: boolean;
  onToggleDropdown: () => void;
  isOffline?: boolean;
  readingMode?: StoryReadingMode;
  onReadingModeChange?: (mode: StoryReadingMode) => void;
  listenLocked?: boolean;
  onListenLocked?: () => void;
  backHref?: string;
  shell?: StoryShell;
}

export const StoryHeader = React.memo(
  ({
    storyId,
    currentTitle,
    storyTitle,
    isVisible,
    showDropdown,
    onToggleDropdown,
    isOffline = false,
    readingMode = "read",
    onReadingModeChange,
    listenLocked = false,
    onListenLocked,
    backHref,
    shell = "mobile",
  }: StoryHeaderProps) => {
    const isDesktop = shell === "desktop";
    const storyLink = backHref ?? `/story/${storyId}`;

    if (isDesktop) {
      return (
        <div className="sticky top-0 z-40 border-b border-black/10 bg-accent-shade-1/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-accent-shade-1/80">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={storyLink}
              className="flex shrink-0 items-center gap-2 text-primary-colour"
            >
              <ArrowLeft className="h-5 w-5" />
              <span
                className={cn(
                  "hidden text-sm sm:inline",
                  Magnetik_Medium.className,
                )}
              >
                Story details
              </span>
            </Link>

            <h1
              className={cn(
                "min-w-0 flex-1 truncate text-center text-base text-primary-colour",
                Magnetik_Bold.className,
              )}
            >
              {currentTitle || storyTitle}
            </h1>

            {onReadingModeChange ? (
              <div className="flex shrink-0 items-center gap-1 rounded-full border border-light-grey-2 bg-universal-white/80 p-1">
                <button
                  type="button"
                  onClick={() => onReadingModeChange("read")}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors",
                    Magnetik_Medium.className,
                    readingMode === "read"
                      ? "bg-primary-colour text-white"
                      : "text-primary-shade-4",
                  )}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Read
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (listenLocked) {
                      onListenLocked?.();
                      return;
                    }
                    onReadingModeChange("listen");
                  }}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors",
                    Magnetik_Medium.className,
                    readingMode === "listen"
                      ? "bg-complimentary-colour text-white"
                      : listenLocked
                        ? "text-primary-shade-4/60"
                        : "text-primary-shade-4",
                  )}
                >
                  {listenLocked ? (
                    <Lock className="h-3 w-3" />
                  ) : (
                    <Headphones className="h-3.5 w-3.5" />
                  )}
                  Listen
                </button>
              </div>
            ) : (
              <div className="w-8 shrink-0" />
            )}
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Header */}
        <div
          className={`fixed ${isOffline ? "top-10" : "top-0"} left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-accent-shade-1 px-4 pt-5 pb-4 z-50 transition-transform duration-300 ${
            isVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <Link href={storyLink}>
              <ArrowLeft className="w-6 h-6 text-primary-colour" />
            </Link>
          </div>
        </div>

        {/* Title Bar */}
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-accent-colour px-4 py-3 z-50 transition-transform duration-300 ${
            isVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <h1
              className={`text-lg text-primary-colour truncate flex-1 min-w-0 pr-2 ${Magnetik_Bold.className}`}
            >
              {currentTitle || storyTitle}
            </h1>

            {onReadingModeChange ? (
              <div className="flex items-center gap-1 mr-1 rounded-full bg-universal-white/80 p-1 border border-light-grey-2">
                <button
                  type="button"
                  onClick={() => onReadingModeChange("read")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${Magnetik_Medium.className} ${
                    readingMode === "read"
                      ? "bg-primary-colour text-white"
                      : "text-primary-shade-4"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Read
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (listenLocked) {
                      onListenLocked?.();
                      return;
                    }
                    onReadingModeChange("listen");
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${Magnetik_Medium.className} ${
                    readingMode === "listen"
                      ? "bg-complimentary-colour text-white"
                      : listenLocked
                        ? "text-primary-shade-4/60"
                        : "text-primary-shade-4"
                  }`}
                >
                  {listenLocked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <Headphones className="w-3.5 h-3.5" />
                  )}
                  Listen
                </button>
              </div>
            ) : null}

            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              onClick={onToggleDropdown}
              className="flex-shrink-0 border-none"
            >
              <MoreVertical className="w-5 h-5 rotate-90 text-primary-colour" />
            </Button>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute z-[100] w-40 mt-1 border rounded-lg shadow-lg top-full right-4 bg-universal-white border-light-grey-2">
              <button
                className="w-full px-4 py-3 text-sm text-left border-b text-primary-colour hover:bg-accent-shade-1 border-light-grey-2"
                onClick={onToggleDropdown}
              >
                Add to library
              </button>
            </div>
          )}
        </div>
      </>
    );
  },
);

StoryHeader.displayName = "StoryHeader";
