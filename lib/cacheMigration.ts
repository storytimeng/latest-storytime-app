/**
 * Migration utility to move data from localStorage to IndexedDB
 * Run this once to migrate existing cached stories
 */

import {
  saveChaptersCache,
  saveEpisodesCache,
  saveStoryDraft,
} from "./storyCache";
import type { Chapter, Part, StoryFormData } from "@/types/story";

const OLD_CACHE_PREFIX = "story_draft_";
const OLD_CHAPTER_CACHE_PREFIX = "story_chapters_";
const OLD_EPISODE_CACHE_PREFIX = "story_episodes_";

interface OldCacheData {
  formData?: Partial<StoryFormData>;
  chapters?: Chapter[];
  episodes?: Part[];
  timestamp: number;
}

/**
 * Migrate all localStorage cache data to IndexedDB
 */
export const migrateLocalStorageToIndexedDB = async (): Promise<{
  success: boolean;
  migratedCount: number;
  errors: string[];
}> => {
  const errors: string[] = [];
  let migratedCount = 0;

  try {
    if (typeof window === "undefined") {
      return { success: false, migratedCount: 0, errors: ["Not in browser"] };
    }

    const allKeys = Object.keys(localStorage);

    // Migrate drafts
    for (const key of allKeys) {
      if (key.startsWith(OLD_CACHE_PREFIX)) {
        try {
          const storyId = key.replace(OLD_CACHE_PREFIX, "");
          const data = JSON.parse(localStorage.getItem(key) || "{}");

          if (data.formData) {
            await saveStoryDraft(storyId, data.formData);
            localStorage.removeItem(key);
            migratedCount++;
          }
        } catch (error) {
          errors.push(`Failed to migrate draft ${key}: ${error}`);
        }
      }
    }

    // Migrate chapters
    for (const key of allKeys) {
      if (key.startsWith(OLD_CHAPTER_CACHE_PREFIX)) {
        try {
          const storyId = key.replace(OLD_CHAPTER_CACHE_PREFIX, "");
          const data = JSON.parse(localStorage.getItem(key) || "{}");

          if (data.chapters && Array.isArray(data.chapters)) {
            await saveChaptersCache(storyId, data.chapters);
            localStorage.removeItem(key);
            migratedCount++;
          }
        } catch (error) {
          errors.push(`Failed to migrate chapters ${key}: ${error}`);
        }
      }
    }

    // Migrate episodes
    for (const key of allKeys) {
      if (key.startsWith(OLD_EPISODE_CACHE_PREFIX)) {
        try {
          const storyId = key.replace(OLD_EPISODE_CACHE_PREFIX, "");
          const data = JSON.parse(localStorage.getItem(key) || "{}");

          if (data.episodes && Array.isArray(data.episodes)) {
            await saveEpisodesCache(storyId, data.episodes);
            localStorage.removeItem(key);
            migratedCount++;
          }
        } catch (error) {
          errors.push(`Failed to migrate episodes ${key}: ${error}`);
        }
      }
    }

    console.log(`Migration complete: ${migratedCount} items migrated`);
    if (errors.length > 0) {
      console.warn("Migration errors:", errors);
    }

    return {
      success: errors.length === 0,
      migratedCount,
      errors,
    };
  } catch (error) {
    console.error("Migration failed:", error);
    return {
      success: false,
      migratedCount,
      errors: [...errors, `Migration failed: ${error}`],
    };
  }
};

/**
 * Check if migration is needed
 */
export const needsMigration = (): boolean => {
  if (typeof window === "undefined") return false;

  const allKeys = Object.keys(localStorage);
  return allKeys.some(
    (key) =>
      key.startsWith(OLD_CACHE_PREFIX) ||
      key.startsWith(OLD_CHAPTER_CACHE_PREFIX) ||
      key.startsWith(OLD_EPISODE_CACHE_PREFIX)
  );
};
