import React from "react";
import { Select, SelectItem } from "@heroui/select";
import { cn } from "@/lib/utils";
import { Magnetik_Medium } from "@/lib/font";

interface ChapterSelectorProps {
  navigationList: any[];
  selectedChapterId: string | null;
  onChapterChange: (chapterId: string) => void;
  isVisible: boolean;
  partLabel?: string;
  variant?: "dropdown" | "list";
}

export const ChapterSelector = React.memo(
  ({
    navigationList,
    selectedChapterId,
    onChapterChange,
    isVisible,
    partLabel = "Chapter",
    variant = "dropdown",
  }: ChapterSelectorProps) => {
    if (variant === "list") {
      return (
        <nav
          className="flex-1 overflow-y-auto p-3"
          aria-label={`${partLabel} list`}
        >
          <ul className="space-y-1">
            {navigationList.map((item: any) => {
              const isActive = item.id === selectedChapterId;
              const label =
                item.title ||
                `${item.chapterNumber ? "Chapter" : "Episode"} ${item.chapterNumber || item.episodeNumber}`;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onChapterChange(item.id)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      Magnetik_Medium.className,
                      isActive
                        ? "bg-primary-colour/10 font-semibold text-primary-colour"
                        : "text-[#361B17]/80 hover:bg-black/[0.04] hover:text-[#361B17]",
                    )}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      );
    }

    return (
      <div
        className={`fixed top-28 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-accent-shade-1 px-4 py-3 z-40 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Select
          placeholder={`Select ${partLabel}`}
          variant="flat"
          selectedKeys={selectedChapterId ? [selectedChapterId] : []}
          onSelectionChange={(keys) => {
            const value = Array.from(keys as Set<string>)[0];
            if (value) onChapterChange(value);
          }}
          classNames={{
            trigger: "bg-transparent shadow-none hover:bg-transparent",
            value: "text-primary-colour",
          }}
        >
          {navigationList.map((item: any) => (
            <SelectItem key={item.id} id={item.id}>
              {item.title ||
                `${item.chapterNumber ? "Chapter" : "Episode"} ${item.chapterNumber || item.episodeNumber}`}
            </SelectItem>
          ))}
        </Select>
      </div>
    );
  },
);

ChapterSelector.displayName = "ChapterSelector";
