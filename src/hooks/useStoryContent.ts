import { useState, useCallback } from "react";
import type { Chapter, Part, StoryStructure } from "@/types/story";

interface UseStoryContentProps {
  storyStructure: StoryStructure;
  initialChapters?: Chapter[];
  initialParts?: Part[];
}

interface UseStoryContentReturn {
  chapters: Chapter[];
  parts: Part[];
  expandedChapters: Set<number>;
  expandedEpisodes: Set<number>;
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  setParts: React.Dispatch<React.SetStateAction<Part[]>>;
  setExpandedChapters: React.Dispatch<React.SetStateAction<Set<number>>>;
  setExpandedEpisodes: React.Dispatch<React.SetStateAction<Set<number>>>;
  addChapter: () => void;
  addPart: () => void;
  toggleChapter: (chapterId: number) => void;
  toggleEpisode: (episodeId: number) => void;
}

/**
 * Custom hook for managing story content (chapters/episodes)
 * Handles content state, expansion state, and content operations
 */
export function useStoryContent({
  storyStructure,
  initialChapters,
  initialParts,
}: UseStoryContentProps): UseStoryContentReturn {
  // Content state - Initialize with empty defaults first
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    if (initialChapters && initialChapters.length > 0) {
      return initialChapters;
    }
    return [
      {
        id: 1,
        title: "Chapter 1",
        body: "",
        episodes: [{ id: 1, title: "Episode 1", body: "" }],
      },
    ];
  });

  const [parts, setParts] = useState<Part[]>(() => {
    if (initialParts && initialParts.length > 0) {
      return initialParts;
    }
    return [{ id: 1, title: "Part 1", body: "" }];
  });

  // Accordion state for collapsing chapters/episodes
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set([1])
  );
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<number>>(
    new Set([1])
  );

  // Toggle chapter expansion
  const toggleChapter = useCallback((chapterId: number) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  }, []);

  // Toggle episode expansion
  const toggleEpisode = useCallback((episodeId: number) => {
    setExpandedEpisodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(episodeId)) {
        newSet.delete(episodeId);
      } else {
        newSet.add(episodeId);
      }
      return newSet;
    });
  }, []);

  // Add chapter
  const addChapter = useCallback(() => {
    const newChapterId = chapters.length + 1;
    setChapters((prev) => [
      ...prev,
      {
        id: newChapterId,
        title: `Chapter ${newChapterId}`,
        body: "",
        episodes: storyStructure.hasEpisodes
          ? [{ id: 1, title: "Episode 1", body: "" }]
          : undefined,
      },
    ]);
    // Expand the newly added chapter
    setExpandedChapters(new Set([newChapterId]));
  }, [chapters.length, storyStructure.hasEpisodes]);

  // Add part/episode
  const addPart = useCallback(() => {
    const newPartId = parts.length + 1;
    setParts((prev) => [
      ...prev,
      { id: newPartId, title: `Part ${newPartId}`, body: "" },
    ]);
    // Expand the newly added episode
    setExpandedEpisodes(new Set([newPartId]));
  }, [parts.length]);

  return {
    chapters,
    parts,
    expandedChapters,
    expandedEpisodes,
    setChapters,
    setParts,
    setExpandedChapters,
    setExpandedEpisodes,
    addChapter,
    addPart,
    toggleChapter,
    toggleEpisode,
  };
}
