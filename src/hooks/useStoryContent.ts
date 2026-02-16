import { useState, useCallback, useEffect, useRef } from "react";
import type { Chapter, Part, StoryStructure } from "@/types/story";
import {
  storiesControllerGetChapterById,
  storiesControllerGetEpisodeById,
} from "@/src/client";

interface UseStoryContentProps {
  storyStructure: StoryStructure;
  initialChapters?: Chapter[];
  initialParts?: Part[];
  storyId?: string; // For lazy loading chapter/episode content
}

interface UseStoryContentReturn {
  chapters: Chapter[];
  parts: Part[];
  expandedChapters: Set<number>;
  expandedEpisodes: Set<number>;
  editedChapterIds: Set<number>;
  editedPartIds: Set<number>;
  selectedChapterIndex: number | null;
  selectedPartIndex: number | null;
  loadingChapterIds: Set<string>;
  loadingPartIds: Set<string>;
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  setParts: React.Dispatch<React.SetStateAction<Part[]>>;
  setExpandedChapters: React.Dispatch<React.SetStateAction<Set<number>>>;
  setExpandedEpisodes: React.Dispatch<React.SetStateAction<Set<number>>>;
  setSelectedChapterIndex: (index: number | null) => void;
  setSelectedPartIndex: (index: number | null) => void;
  addChapter: () => void;
  addPart: () => void;
  toggleChapter: (chapterId: number) => void;
  toggleEpisode: (episodeId: number) => void;
  updateChapter: (id: number, field: "title" | "body", value: string) => void;
  updatePart: (id: number, field: "title" | "body", value: string) => void;
  loadChapterContent: (
    chapterId: string,
    chapterIndex: number,
  ) => Promise<void>;
  loadEpisodeContent: (
    episodeId: string,
    episodeIndex: number,
  ) => Promise<void>;
  getEditedChapters: () => Chapter[];
  getEditedParts: () => Part[];
}

/**
 * Custom hook for managing story content (chapters/episodes)
 * Handles content state, expansion state, and content operations
 */
export function useStoryContent({
  storyStructure,
  initialChapters,
  initialParts,
  storyId,
}: UseStoryContentProps): UseStoryContentReturn {
  // Track if we've initialized from API data to avoid re-initializing
  const hasInitializedChapters = useRef(false);
  const hasInitializedParts = useRef(false);

  // Store initial data to compare for dirty tracking
  const initialChaptersData = useRef<Map<number, Chapter>>(new Map());
  const initialPartsData = useRef<Map<number, Part>>(new Map());

  // Track which chapters/parts have been edited
  const [editedChapterIds, setEditedChapterIds] = useState<Set<number>>(
    new Set(),
  );
  const [editedPartIds, setEditedPartIds] = useState<Set<number>>(new Set());

  // Track selected chapter/part for focused editing
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<
    number | null
  >(null);
  const [selectedPartIndex, setSelectedPartIndex] = useState<number | null>(
    null,
  );

  // Track which chapters/episodes have their full content loaded
  const loadedChapterIds = useRef<Set<string>>(new Set());
  const loadedPartIds = useRef<Set<string>>(new Set());

  // Track loading states
  const [loadingChapterIds, setLoadingChapterIds] = useState<Set<string>>(
    new Set(),
  );
  const [loadingPartIds, setLoadingPartIds] = useState<Set<string>>(new Set());

  // Content state - Initialize based on story structure
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    // Use initialChapters if provided
    if (initialChapters && initialChapters.length > 0) {
      hasInitializedChapters.current = true;
      return initialChapters;
    }
    // Only create default chapter if story has chapters
    if (storyStructure.hasChapters) {
      return [
        {
          id: 1,
          title: "Chapter 1",
          body: "",
          episodes: storyStructure.hasEpisodes
            ? [{ id: 1, title: "Episode 1", body: "" }]
            : undefined,
        },
      ];
    }
    // No chapters for this story
    return [];
  });

  const [parts, setParts] = useState<Part[]>(() => {
    // Use initialParts if provided
    if (initialParts && initialParts.length > 0) {
      console.log(
        "[useStoryContent] Initializing parts from initialParts:",
        initialParts,
      );
      hasInitializedParts.current = true;
      return initialParts;
    }
    // Only create default part/episode if story has episodes but no chapters
    if (storyStructure.hasEpisodes && !storyStructure.hasChapters) {
      console.log("[useStoryContent] Creating default part");
      return [{ id: 1, title: "Part 1", body: "" }];
    }
    // No parts/episodes for this story
    console.log("[useStoryContent] No parts for this story");
    return [];
  });

  // Accordion state for collapsing chapters/episodes
  // In edit mode with existing content, expand the first item by default
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(() => {
    if (initialChapters && initialChapters.length > 0) {
      return new Set([initialChapters[0].id]);
    }
    return new Set([1]);
  });

  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<number>>(() => {
    if (initialParts && initialParts.length > 0) {
      return new Set([initialParts[0].id]);
    }
    return new Set([1]);
  });

  // Update chapters when initialChapters changes (for edit mode when data loads)
  // Use a more stable check to avoid infinite loops
  useEffect(() => {
    if (
      initialChapters &&
      initialChapters.length > 0 &&
      !hasInitializedChapters.current
    ) {
      console.log(
        "[useStoryContent] Updating chapters from initialChapters:",
        initialChapters,
      );
      setChapters(initialChapters);
      setExpandedChapters(new Set([initialChapters[0].id]));

      // Store initial data for dirty tracking
      const initialMap = new Map<number, Chapter>();
      initialChapters.forEach((ch) => {
        initialMap.set(ch.id, { ...ch });
      });
      initialChaptersData.current = initialMap;

      // Clear loaded sets to allow lazy loading of content
      loadedChapterIds.current.clear();
      console.log(
        "[useStoryContent] Cleared loadedChapterIds for fresh lazy loading",
      );

      hasInitializedChapters.current = true;
    }
  }, [initialChapters?.length]); // Only depend on length, not the array itself

  // Update parts when initialParts changes (for edit mode when data loads)
  useEffect(() => {
    if (
      initialParts &&
      initialParts.length > 0 &&
      !hasInitializedParts.current
    ) {
      console.log("[useStoryContent] Updating parts from initialParts:", {
        count: initialParts.length,
        parts: initialParts.map((p) => ({
          id: p.id,
          uuid: p.uuid,
          title: p.title,
          bodyLength: p.body?.length || 0,
          hasBody: !!p.body && p.body.trim().length > 0,
        })),
      });
      setParts(initialParts);
      setExpandedEpisodes(new Set([initialParts[0].id]));

      // Store initial data for dirty tracking
      const initialMap = new Map<number, Part>();
      initialParts.forEach((pt) => {
        initialMap.set(pt.id, { ...pt });
      });
      initialPartsData.current = initialMap;

      // Clear loaded sets to allow lazy loading of content
      loadedPartIds.current.clear();
      console.log(
        "[useStoryContent] Cleared loadedPartIds for fresh lazy loading",
      );

      hasInitializedParts.current = true;
    }
  }, [initialParts?.length]); // Only depend on length, not the array itself

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
    // Mark as edited (it's new)
    setEditedPartIds((prev) => new Set(prev).add(newPartId));
  }, [parts.length]);

  // Update chapter with dirty tracking
  const updateChapter = useCallback(
    (id: number, field: "title" | "body", value: string) => {
      setChapters((prev) =>
        prev.map((ch) => (ch.id === id ? { ...ch, [field]: value } : ch)),
      );

      // Mark as edited if changed from initial
      const initial = initialChaptersData.current.get(id);
      if (initial && initial[field] !== value) {
        setEditedChapterIds((prev) => new Set(prev).add(id));
      }
    },
    [],
  );

  // Update part with dirty tracking
  const updatePart = useCallback(
    (id: number, field: "title" | "body", value: string) => {
      setParts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
      );

      // Mark as edited if changed from initial
      const initial = initialPartsData.current.get(id);
      if (initial && initial[field] !== value) {
        setEditedPartIds((prev) => new Set(prev).add(id));
      }
    },
    [],
  );

  // Get only edited chapters
  const getEditedChapters = useCallback(() => {
    return chapters.filter((ch) => editedChapterIds.has(ch.id));
  }, [chapters, editedChapterIds]);

  // Get only edited parts
  const getEditedParts = useCallback(() => {
    return parts.filter((p) => editedPartIds.has(p.id));
  }, [parts, editedPartIds]);

  // Lazy load chapter content by ID
  const loadChapterContent = useCallback(
    async (chapterId: string, chapterIndex: number) => {
      // Skip if already loaded or currently loading
      if (
        loadedChapterIds.current.has(chapterId) ||
        loadingChapterIds.has(chapterId)
      ) {
        console.log(
          `[useStoryContent] Chapter ${chapterId} already loaded/loading, skipping`,
        );
        return;
      }

      console.log(`[useStoryContent] Loading chapter content:`, {
        chapterId,
        chapterIndex,
      });

      setLoadingChapterIds((prev) => new Set(prev).add(chapterId));

      try {
        const response = await storiesControllerGetChapterById({
          path: { chapterId },
        });

        console.log(`[useStoryContent] Chapter API response:`, {
          fullResponse: response,
          data: response.data,
          hasData: !!response.data,
        });

        // Handle wrapped response structure - API returns {data: {id, title, content, ...}}
        const rawData = response.data as any;
        const chapterData = rawData?.data || rawData;

        if (chapterData && (chapterData.title || chapterData.content)) {
          console.log(
            `[useStoryContent] Updating chapter at index ${chapterIndex} with:`,
            {
              title: chapterData.title,
              content: chapterData.content,
              contentLength: chapterData.content?.length || 0,
            },
          );

          // Update the chapter in state - map 'content' from API to 'body' in state
          setChapters((prev) => {
            const updated = prev.map((ch, idx) =>
              idx === chapterIndex
                ? {
                    ...ch,
                    title: chapterData.title || ch.title,
                    body: chapterData.content || ch.body || "",
                  }
                : ch,
            );
            console.log(`[useStoryContent] Chapters after update:`, {
              beforeCount: prev.length,
              afterCount: updated.length,
              updatedChapter: updated[chapterIndex],
            });
            return updated;
          });

          // Mark as loaded
          loadedChapterIds.current.add(chapterId);
          console.log(
            `[useStoryContent] Chapter ${chapterId} marked as loaded`,
          );
        } else {
          console.warn(
            `[useStoryContent] No data in response for chapter ${chapterId}`,
          );
        }
      } catch (error) {
        console.error(
          `[useStoryContent] Failed to load chapter ${chapterId}:`,
          error,
        );
      } finally {
        setLoadingChapterIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(chapterId);
          return newSet;
        });
      }
    },
    [loadingChapterIds],
  );

  // Lazy load episode content by ID
  const loadEpisodeContent = useCallback(
    async (episodeId: string, episodeIndex: number) => {
      // Skip if already loaded or currently loading
      if (
        loadedPartIds.current.has(episodeId) ||
        loadingPartIds.has(episodeId)
      ) {
        console.log(
          `[useStoryContent] Episode ${episodeId} already loaded/loading, skipping`,
        );
        return;
      }

      console.log(`[useStoryContent] Loading episode content:`, {
        episodeId,
        episodeIndex,
      });

      setLoadingPartIds((prev) => new Set(prev).add(episodeId));

      try {
        const response = await storiesControllerGetEpisodeById({
          path: { episodeId },
        });

        console.log(`[useStoryContent] Episode API response:`, {
          fullResponse: response,
          data: response.data,
          hasData: !!response.data,
          title: response.data?.title,
          content: response.data?.content,
        });

        // Handle wrapped response structure - API returns {data: {id, title, content, ...}}
        const rawData = response.data as any;
        const episodeData = rawData?.data || rawData;

        if (episodeData && (episodeData.title || episodeData.content)) {
          console.log(
            `[useStoryContent] Updating episode at index ${episodeIndex} with:`,
            {
              title: episodeData.title,
              content: episodeData.content,
              contentLength: episodeData.content?.length || 0,
            },
          );

          // Update the episode in state - map 'content' from API to 'body' in state
          setParts((prev) => {
            const updated = prev.map((p, idx) =>
              idx === episodeIndex
                ? {
                    ...p,
                    title: episodeData.title || p.title,
                    body: episodeData.content || p.body || "",
                  }
                : p,
            );
            console.log(`[useStoryContent] Episodes after update:`, {
              beforeCount: prev.length,
              afterCount: updated.length,
              updatedEpisode: updated[episodeIndex],
            });
            return updated;
          });

          // Mark as loaded
          loadedPartIds.current.add(episodeId);
          console.log(
            `[useStoryContent] Episode ${episodeId} marked as loaded`,
          );
        } else {
          console.warn(
            `[useStoryContent] No data in response for episode ${episodeId}`,
          );
        }
      } catch (error) {
        console.error(
          `[useStoryContent] Failed to load episode ${episodeId}:`,
          error,
        );
      } finally {
        setLoadingPartIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(episodeId);
          return newSet;
        });
      }
    },
    [loadingPartIds],
  );

  return {
    chapters,
    parts,
    expandedChapters,
    expandedEpisodes,
    editedChapterIds,
    editedPartIds,
    selectedChapterIndex,
    selectedPartIndex,
    loadingChapterIds,
    loadingPartIds,
    setChapters,
    setParts,
    setExpandedChapters,
    setExpandedEpisodes,
    setSelectedChapterIndex,
    setSelectedPartIndex,
    addChapter,
    addPart,
    toggleChapter,
    toggleEpisode,
    updateChapter,
    updatePart,
    loadChapterContent,
    loadEpisodeContent,
    getEditedChapters,
    getEditedParts,
  };
}
