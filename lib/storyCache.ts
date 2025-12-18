/**
 * Story Cache Manager
 * Handles caching of story drafts, chapters, and episodes using IndexedDB
 * to prevent data loss due to network issues and avoid duplicates
 */

import type { Chapter, Part, StoryFormData } from "@/types/story";

// IndexedDB configuration
const DB_NAME = "storytime_cache";
const DB_VERSION = 2;
const STORE_NAME = "story_cache";

// Cache expiration from environment variable (in days, 0 = never expire)
const CACHE_EXPIRY_DAYS = parseInt(
  process.env.NEXT_PUBLIC_CACHE_EXPIRY_DAYS || "30",
  10
);

export interface StoryCacheData {
  formData: Partial<StoryFormData>;
  chapters?: Chapter[];
  episodes?: Part[];
  timestamp: number;
}

export interface CacheEntry {
  id: string; // storyId_type (e.g., "123_chapters", "123_episodes")
  storyId: string;
  userId?: string; // Added for multi-user support
  type: "chapters" | "episodes" | "draft";
  data: Chapter[] | Part[] | Partial<StoryFormData>;
  timestamp: number;
}

/**
 * Open IndexedDB connection
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available in SSR"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        objectStore.createIndex("storyId", "storyId", { unique: false });
        objectStore.createIndex("type", "type", { unique: false });
        objectStore.createIndex("timestamp", "timestamp", { unique: false });
        objectStore.createIndex("userId", "userId", { unique: false });
      } else {
        const objectStore = (
          event.target as IDBOpenDBRequest
        ).transaction!.objectStore(STORE_NAME);
        if (!objectStore.indexNames.contains("userId")) {
          objectStore.createIndex("userId", "userId", { unique: false });
        }
      }
    };
  });
};

/**
 * Save story draft to cache
 */
export const saveStoryDraft = async (
  storyId: string,
  userId: string,
  formData: Partial<StoryFormData>
): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const entry: CacheEntry = {
      id: `${userId}_${storyId}_draft`,
      storyId,
      userId,
      type: "draft",
      data: formData,
      timestamp: Date.now(),
    };

    store.put(entry);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error("Failed to save story draft:", error);
  }
};

/**
 * Save chapters to cache (avoids duplicates by using unique ID)
 */
export const saveChaptersCache = async (
  storyId: string,
  userId: string,
  chapters: Chapter[]
): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const entry: CacheEntry = {
      id: `${userId}_${storyId}_chapters`,
      storyId,
      userId,
      type: "chapters",
      data: chapters,
      timestamp: Date.now(),
    };

    store.put(entry); // put will update if exists, preventing duplicates

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error("Failed to save chapters cache:", error);
  }
};

/**
 * Save episodes to cache (avoids duplicates by using unique ID)
 */
export const saveEpisodesCache = async (
  storyId: string,
  userId: string,
  episodes: Part[]
): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const entry: CacheEntry = {
      id: `${userId}_${storyId}_episodes`,
      storyId,
      userId,
      type: "episodes",
      data: episodes,
      timestamp: Date.now(),
    };

    store.put(entry); // put will update if exists, preventing duplicates

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error("Failed to save episodes cache:", error);
  }
};

/**
 * Get story draft from cache
 */
export const getStoryDraft = async (
  storyId: string,
  userId: string
): Promise<Partial<StoryFormData> | null> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(`${userId}_${storyId}_draft`);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        db.close();
        const entry = request.result as CacheEntry | undefined;

        if (!entry) {
          resolve(null);
          return;
        }

        // Check expiration (0 = never expire)
        if (CACHE_EXPIRY_DAYS > 0) {
          const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
          if (Date.now() - entry.timestamp > expiryMs) {
            resolve(null);
            return;
          }
        }

        resolve(entry.data as Partial<StoryFormData>);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Failed to get story draft:", error);
    return null;
  }
};

/**
 * Get chapters from cache
 */
export const getChaptersCache = async (
  storyId: string,
  userId: string
): Promise<Chapter[] | null> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(`${userId}_${storyId}_chapters`);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        db.close();
        const entry = request.result as CacheEntry | undefined;

        if (!entry) {
          resolve(null);
          return;
        }

        // Check expiration (0 = never expire)
        if (CACHE_EXPIRY_DAYS > 0) {
          const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
          if (Date.now() - entry.timestamp > expiryMs) {
            resolve(null);
            return;
          }
        }

        resolve(entry.data as Chapter[]);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Failed to get chapters cache:", error);
    return null;
  }
};

/**
 * Get episodes from cache
 */
export const getEpisodesCache = async (
  storyId: string,
  userId: string
): Promise<Part[] | null> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(`${userId}_${storyId}_episodes`);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        db.close();
        const entry = request.result as CacheEntry | undefined;

        if (!entry) {
          resolve(null);
          return;
        }

        // Check expiration (0 = never expire)
        if (CACHE_EXPIRY_DAYS > 0) {
          const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
          if (Date.now() - entry.timestamp > expiryMs) {
            resolve(null);
            return;
          }
        }

        resolve(entry.data as Part[]);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Failed to get episodes cache:", error);
    return null;
  }
};

/**
 * Clear cache for a specific story (after successful publish/save)
 * Only clears if explicitly confirmed by user or after successful save
 */
export const clearStoryCache = async (
  storyId: string,
  userId: string
): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Delete chapters and episodes cache
    store.delete(`${userId}_${storyId}_chapters`);
    store.delete(`${userId}_${storyId}_episodes`);
    store.delete(`${userId}_${storyId}_draft`);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        console.log(`Cleared cache for story ${storyId}`);
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error("Failed to clear story cache:", error);
  }
};

/**
 * Check if there is cached data for a story
 */
export const hasCachedData = async (
  storyId: string,
  userId: string
): Promise<{
  hasChapters: boolean;
  hasEpisodes: boolean;
}> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const chaptersRequest = store.get(`${userId}_${storyId}_chapters`);
    const episodesRequest = store.get(`${userId}_${storyId}_episodes`);

    return new Promise((resolve, reject) => {
      const results = { hasChapters: false, hasEpisodes: false };

      chaptersRequest.onsuccess = () => {
        const entry = chaptersRequest.result as CacheEntry | undefined;
        if (entry) {
          // Check expiration
          if (CACHE_EXPIRY_DAYS === 0) {
            results.hasChapters = true;
          } else {
            const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
            results.hasChapters = Date.now() - entry.timestamp <= expiryMs;
          }
        }
      };

      episodesRequest.onsuccess = () => {
        const entry = episodesRequest.result as CacheEntry | undefined;
        if (entry) {
          // Check expiration
          if (CACHE_EXPIRY_DAYS === 0) {
            results.hasEpisodes = true;
          } else {
            const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
            results.hasEpisodes = Date.now() - entry.timestamp <= expiryMs;
          }
        }
      };

      transaction.oncomplete = () => {
        db.close();
        resolve(results);
      };

      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error("Failed to check cached data:", error);
    return { hasChapters: false, hasEpisodes: false };
  }
};

/**
 * Clear expired caches based on CACHE_EXPIRY_DAYS environment variable
 * If CACHE_EXPIRY_DAYS is 0, no caches will be cleared (never expire)
 */
export const clearExpiredCaches = async (): Promise<void> => {
  try {
    // Skip if cache never expires
    if (CACHE_EXPIRY_DAYS === 0) {
      console.log("Cache expiry disabled (CACHE_EXPIRY_DAYS=0)");
      return;
    }

    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.openCursor();

    const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let deletedCount = 0;

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;

      if (cursor) {
        const entry = cursor.value as CacheEntry;

        if (now - entry.timestamp > expiryMs) {
          cursor.delete();
          deletedCount++;
        }

        cursor.continue();
      }
    };

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        if (deletedCount > 0) {
          console.log(`Cleared ${deletedCount} expired cache entries`);
        }
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error("Failed to clear expired caches:", error);
  }
};
