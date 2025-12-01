import React from "react";
import Link from "next/link";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@heroui/button";
import { Magnetik_Bold } from "@/lib/font";

interface StoryHeaderProps {
  storyId: string;
  currentTitle: string;
  storyTitle: string;
  isVisible: boolean;
  showDropdown: boolean;
  onToggleDropdown: () => void;
  isOffline?: boolean;
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
  }: StoryHeaderProps) => {
    return (
      <>
        {/* Header */}
        <div
          className={`fixed ${isOffline ? "top-10" : "top-0"} left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-accent-shade-1 px-4 pt-5 pb-4 z-40 transition-transform duration-300 ${
            isVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <Link href={`/story/${storyId}`}>
              <ArrowLeft className="w-6 h-6 text-primary-colour" />
            </Link>
          </div>
        </div>

        {/* Title Bar */}
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-accent-colour px-4 py-3 z-40 transition-transform duration-300 ${
            isVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <h1
              className={`text-lg text-primary-colour truncate flex-1 min-w-0 pr-2 ${Magnetik_Bold.className}`}
            >
              {currentTitle || storyTitle}
            </h1>
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
            <div className="absolute z-50 w-40 mt-1 border rounded-lg shadow-lg top-full right-4 bg-universal-white border-light-grey-2">
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
  }
);

StoryHeader.displayName = "StoryHeader";
