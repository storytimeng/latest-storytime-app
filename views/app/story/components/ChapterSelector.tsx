import React from "react";
import { Select, SelectItem } from "@heroui/select";

interface ChapterSelectorProps {
  navigationList: any[];
  selectedChapterId: string | null;
  onChapterChange: (chapterId: string) => void;
  isVisible: boolean;
}

export const ChapterSelector = React.memo(
  ({
    navigationList,
    selectedChapterId,
    onChapterChange,
    isVisible,
  }: ChapterSelectorProps) => {
    return (
      <div
        className={`fixed top-28 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-accent-shade-1 px-4 py-3 z-40 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Select
          placeholder="Select Chapter"
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
                `${item.chapterNumber ? 'Chapter' : 'Episode'} ${item.chapterNumber || item.episodeNumber}`}
            </SelectItem>
          ))}
        </Select>
      </div>
    );
  }
);

ChapterSelector.displayName = "ChapterSelector";
