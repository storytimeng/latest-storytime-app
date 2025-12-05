"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { cn } from "@/lib/utils";
import type { StoryBriefModalProps, StoryStructure } from "@/types/story";

/**
 * Modal component for selecting story structure (chapters/episodes)
 * Lazy-loaded to reduce initial bundle size
 */
const StoryBriefModal: React.FC<StoryBriefModalProps> = ({
  isOpen,
  onClose,
  onNext,
}) => {
  const [structure, setStructure] = useState<StoryStructure>({
    hasChapters: false,
    hasEpisodes: false,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="bg-universal-white rounded-t-2xl w-full max-w-[28rem] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2
            className={`text-xl text-primary-colour ${Magnetik_Bold.className}`}
          >
            Story Structure
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <p
              className={`text-primary-colour text-base mb-4 ${Magnetik_Medium.className}`}
            >
              Does this story have chapters?
            </p>
            <div className="flex gap-3">
              {["No", "Yes"].map((option, index) => (
                <Button
                  key={option}
                  variant={
                    structure.hasChapters === Boolean(index)
                      ? "solid"
                      : "bordered"
                  }
                  onClick={() =>
                    setStructure((prev) => ({
                      ...prev,
                      hasChapters: Boolean(index),
                      // If selecting Yes for chapters, set episodes to No
                      hasEpisodes: index === 1 ? false : prev.hasEpisodes,
                    }))
                  }
                  className={cn(
                    "flex-1",
                    structure.hasChapters === Boolean(index)
                      ? "bg-complimentary-colour text-universal-white"
                      : "border-complimentary-colour text-complimentary-colour"
                  )}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p
              className={`text-primary-colour text-base mb-4 ${Magnetik_Medium.className}`}
            >
              Is this story divided into episodes?
            </p>
            <div className="flex gap-3">
              {["No", "Yes"].map((option, index) => (
                <Button
                  key={option}
                  variant={
                    structure.hasEpisodes === Boolean(index)
                      ? "solid"
                      : "bordered"
                  }
                  onClick={() =>
                    setStructure((prev) => ({
                      ...prev,
                      hasEpisodes: Boolean(index),
                      // If selecting Yes for episodes, set chapters to No
                      hasChapters: index === 1 ? false : prev.hasChapters,
                    }))
                  }
                  className={cn(
                    "flex-1",
                    structure.hasEpisodes === Boolean(index)
                      ? "bg-complimentary-colour text-universal-white"
                      : "border-complimentary-colour text-complimentary-colour"
                  )}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-complimentary-colour/10">
            <p
              className={`text-complimentary-colour text-sm ${Magnetik_Regular.className}`}
            >
              Note: A story can have either chapters or episodes, not both.
            </p>
          </div>
        </div>

        <Button
          className={`w-full bg-primary-shade-6 text-universal-white py-3 ${Magnetik_Medium.className}`}
          onClick={() => onNext(structure)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export default React.memo(StoryBriefModal);
