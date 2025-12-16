import { useState, useCallback, useEffect } from "react";
import { showToast } from "@/lib/showNotification";
import {
  saveChaptersCache,
  saveEpisodesCache,
  getChaptersCache,
  getEpisodesCache,
  hasCachedData,
  clearStoryCache,
} from "@/lib/storyCache";
import { useUnsavedChangesWarning } from "@/src/hooks/useUnsavedChangesWarning";
import { useUserStore } from "@/src/stores/useUserStore";
import type { Chapter, Part, StoryStructure } from "@/types/story";

interface UseStoryCacheProps {
  createdStoryId: string | null;
  mode: "create" | "edit";
  initialDataId?: string;
  storyStructure: StoryStructure;
  chapters: Chapter[];
  parts: Part[];
  hasUnsavedChanges: boolean;
}

interface UseStoryCacheReturn {
  showCacheModal: boolean;
  pendingCacheType: "chapters" | "episodes" | null;
  handleLoadCache: () => Promise<void>;
  handleDiscardCache: () => Promise<void>;
  setExpandedChapters: React.Dispatch<React.SetStateAction<Set<number>>>;
  setExpandedEpisodes: React.Dispatch<React.SetStateAction<Set<number>>>;
}

/**
 * Custom hook for managing story cache (chapters/episodes)
 * Handles cache loading, discarding, and auto-save functionality
 */
export function useStoryCache({
  createdStoryId,
  mode,
  initialDataId,
  storyStructure,
  chapters,
  parts,
  hasUnsavedChanges,
}: UseStoryCacheProps): UseStoryCacheReturn {
  const { user } = useUserStore();
  const userId = user?.id;

  const [showCacheModal, setShowCacheModal] = useState(false);
  const [pendingCacheType, setPendingCacheType] = useState<
    "chapters" | "episodes" | null
  >(null);
  const [cacheChecked, setCacheChecked] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set([1])
  );
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<number>>(
    new Set([1])
  );

  // Unsaved changes warning with automatic caching
  useUnsavedChangesWarning({
    hasUnsavedChanges,
    onSave: () => {
      const storyId = createdStoryId || (mode === "edit" && initialDataId);
      if (storyId && userId) {
        if (storyStructure.hasChapters && chapters.length > 0) {
          saveChaptersCache(storyId, userId, chapters);
        }
        if (storyStructure.hasEpisodes && parts.length > 0) {
          saveEpisodesCache(storyId, userId, parts);
        }
      }
    },
  });

  // Check for cached data when story ID becomes available
  useEffect(() => {
    if (cacheChecked || !userId) return;

    const storyId = createdStoryId || (mode === "edit" && initialDataId);
    if (!storyId) return;

    const checkCache = async () => {
      const cached = await hasCachedData(storyId, userId);

      if (cached.hasChapters && storyStructure.hasChapters) {
        setPendingCacheType("chapters");
        setShowCacheModal(true);
        setCacheChecked(true);
      } else if (cached.hasEpisodes && storyStructure.hasEpisodes) {
        setPendingCacheType("episodes");
        setShowCacheModal(true);
        setCacheChecked(true);
      } else {
        setCacheChecked(true);
      }
    };

    checkCache();
  }, [
    createdStoryId,
    mode,
    initialDataId,
    storyStructure,
    cacheChecked,
    userId,
  ]);

  // Handle loading cache
  const handleLoadCache = useCallback(async () => {
    const storyId = createdStoryId || (mode === "edit" && initialDataId);
    if (!storyId || !pendingCacheType || !userId) return;

    if (pendingCacheType === "chapters") {
      const cached = await getChaptersCache(storyId, userId);
      if (cached && cached.length > 0) {
        // Note: This needs to be handled by parent component
        // We'll return the cached data through a callback
        setExpandedChapters(new Set([cached[0].id]));
        showToast({
          type: "success",
          message: `Loaded ${cached.length} cached chapter${cached.length > 1 ? "s" : ""}`,
        });
      }
    } else if (pendingCacheType === "episodes") {
      const cached = await getEpisodesCache(storyId, userId);
      if (cached && cached.length > 0) {
        setExpandedEpisodes(new Set([cached[0].id]));
        showToast({
          type: "success",
          message: `Loaded ${cached.length} cached episode${cached.length > 1 ? "s" : ""}`,
        });
      }
    }

    setShowCacheModal(false);
    setPendingCacheType(null);
  }, [createdStoryId, mode, initialDataId, pendingCacheType, userId]);

  // Handle discarding cache
  const handleDiscardCache = useCallback(async () => {
    const storyId = createdStoryId || (mode === "edit" && initialDataId);
    if (storyId && userId) {
      await clearStoryCache(storyId, userId);
      showToast({
        type: "info",
        message: "Cached data has been discarded",
      });
    }
    setShowCacheModal(false);
    setPendingCacheType(null);
  }, [createdStoryId, mode, initialDataId, userId]);

  // Auto-save chapters to cache when they change
  useEffect(() => {
    const storyId = createdStoryId || (mode === "edit" && initialDataId);
    if (
      storyId &&
      chapters.length > 0 &&
      storyStructure.hasChapters &&
      userId
    ) {
      saveChaptersCache(storyId, userId, chapters);
    }
  }, [
    chapters,
    createdStoryId,
    mode,
    initialDataId,
    storyStructure.hasChapters,
    userId,
  ]);

  // Auto-save episodes to cache when they change
  useEffect(() => {
    const storyId = createdStoryId || (mode === "edit" && initialDataId);
    if (storyId && parts.length > 0 && storyStructure.hasEpisodes && userId) {
      saveEpisodesCache(storyId, userId, parts);
    }
  }, [
    parts,
    createdStoryId,
    mode,
    initialDataId,
    storyStructure.hasEpisodes,
    userId,
  ]);

  return {
    showCacheModal,
    pendingCacheType,
    handleLoadCache,
    handleDiscardCache,
    setExpandedChapters,
    setExpandedEpisodes,
  };
}
