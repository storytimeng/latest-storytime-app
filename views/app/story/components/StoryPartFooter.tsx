"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { cn } from "@/lib/utils";

interface StoryPartMeta {
  id: string;
  title?: string;
  chapterNumber?: number;
  episodeNumber?: number;
}

interface StoryPartFooterProps {
  partLabel: string;
  currentIndex: number;
  total: number;
  nextPart?: StoryPartMeta | null;
  prevPart?: StoryPartMeta | null;
  onNext?: () => void;
  onPrevious?: () => void;
  isLoading?: boolean;
}

function formatPartName(
  part: StoryPartMeta,
  partLabel: string,
  fallbackIndex: number,
) {
  if (part.title?.trim()) {
    return part.title.trim();
  }
  const number = part.episodeNumber ?? part.chapterNumber ?? fallbackIndex + 1;
  return `${partLabel} ${number}`;
}

export const StoryPartFooter = React.memo(
  ({
    partLabel,
    currentIndex,
    total,
    nextPart,
    prevPart,
    onNext,
    onPrevious,
    isLoading = false,
  }: StoryPartFooterProps) => {
    const hasNext = !!nextPart && !!onNext;
    const hasPrevious = !!prevPart && !!onPrevious;

    if (!hasNext && !hasPrevious) {
      return null;
    }

    return (
      <div className="px-4 pb-6">
        <div className="rounded-2xl border border-light-grey-2 bg-white p-4 space-y-3">
          <p
            className={cn(
              "text-center text-xs text-primary-shade-4",
              Magnetik_Regular.className,
            )}
          >
            {partLabel} {currentIndex + 1} of {total}
          </p>

          {hasNext ? (
            <button
              type="button"
              onClick={onNext}
              disabled={isLoading}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl bg-complimentary-colour text-white py-3 px-4 transition-opacity",
                Magnetik_Medium.className,
                isLoading ? "opacity-70 cursor-wait" : "hover:opacity-90",
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              Continue to{" "}
              {formatPartName(nextPart, partLabel, currentIndex + 1)}
            </button>
          ) : (
            <p
              className={cn(
                "text-center text-sm text-primary-shade-4 py-2",
                Magnetik_Regular.className,
              )}
            >
              You&apos;ve reached the final {partLabel.toLowerCase()}.
            </p>
          )}

          {hasPrevious ? (
            <button
              type="button"
              onClick={onPrevious}
              disabled={isLoading}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl border border-light-grey-2 text-primary-colour py-2.5 px-4 transition-colors hover:bg-accent-shade-1",
                Magnetik_Medium.className,
                isLoading && "opacity-60 cursor-not-allowed",
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Back to {formatPartName(prevPart, partLabel, currentIndex - 1)}
            </button>
          ) : null}
        </div>
      </div>
    );
  },
);

StoryPartFooter.displayName = "StoryPartFooter";
