/**
 * Enhanced IndexedDB wrapper using idb library
 * Provides better error handling and cleaner API
 *
 * IMPORTANT: This module should only be used in client-side code.
 * All functions check for browser environment before accessing IndexedDB.
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";

const DB_NAME = "StorytimeOfflineDB";
const DB_VERSION = 4; // Updated to avoid conflicts

// Check if we're in a browser environment
const isBrowser =
  typeof window !== "undefined" && typeof indexedDB !== "undefined";

// Store names
export const STORES = {
  STORIES: "stories",
  CHAPTERS: "chapters",
  EPISODES: "episodes",
  METADATA: "metadata",
  USER_DATA: "userData",
  PROFILE: "profile",
  READING_PROGRESS: "readingProgress",
  DRAFTS: "drafts",
  SETTINGS: "settings",
  NOTIFICATIONS: "notifications",
  PENDING_ACTIONS: "pendingActions",
  API_CACHE: "apiCache",
} as const;

// Database schema
interface StorytimeDB extends DBSchema {
  stories: {
    key: string;
    value: OfflineStory;
    indexes: {
      downloadedAt: number;
      lastReadAt: number;
      userId: string;
      storyId: string;
    };
  };
  chapters: {
    key: string;
    value: OfflineChapter;
    indexes: {
      storyId: string;
      userId: string;
      chapterId: string;
    };
  };
  episodes: {
    key: string;
    value: OfflineEpisode;
    indexes: {
      storyId: string;
      userId: string;
      episodeId: string;
    };
  };
  metadata: {
    key: string;
    value: OfflineMetadata;
  };
  userData: {
    key: string;
    value: CachedUserData;
    indexes: { cachedAt: number };
  };
  profile: {
    key: string;
    value: CachedProfile;
    indexes: { userId: string; cachedAt: number };
  };
  readingProgress: {
    key: string;
    value: CachedReadingProgress;
    indexes: { storyId: string; userId: string; updatedAt: number };
  };
  drafts: {
    key: string;
    value: Draft;
    indexes: { userId: string; createdAt: number; synced: number };
  };
  settings: {
    key: string;
    value: CachedSettings;
    indexes: { userId: string };
  };
  notifications: {
    key: string;
    value: CachedNotification;
    indexes: { userId: string; createdAt: number; read: number };
  };
  pendingActions: {
    key: string;
    value: PendingAction;
    indexes: { type: string; createdAt: number };
  };
  apiCache: {
    key: string;
    value: CachedApiResponse;
    indexes: { userId: string; expiresAt: number };
  };
}

export interface OfflineStory {
  id: string;
  storyId: string;
  userId: string;
  title: string;
  description: string;
  coverImage: string;
  author: any;
  genres: string[];
  status: string;
  structure: "chapters" | "episodes" | "single";
  totalChapters?: number;
  totalEpisodes?: number;
  downloadedAt: number;
  lastReadAt?: number;
  lastUpdatedAt?: number;
  metadata: Record<string, any>;
}

export interface OfflineChapter {
  id: string;
  chapterId: string;
  storyId: string;
  userId: string;
  chapterNumber: number;
  title: string;
  content: string;
  wordCount?: number;
  downloadedAt: number;
  lastUpdatedAt?: number;
}

export interface OfflineEpisode {
  id: string;
  episodeId: string;
  storyId: string;
  userId: string;
  episodeNumber: number;
  title: string;
  content: string;
  duration?: number;
  downloadedAt: number;
  lastUpdatedAt?: number;
}

export interface OfflineMetadata {
  key: string;
  value: any;
  updatedAt: number;
}

export interface CachedUserData {
  id: string;
  userId: string;
  data: any;
  cachedAt: number;
  expiresAt?: number;
}

export interface CachedProfile {
  id: string;
  userId: string;
  profile: any;
  cachedAt: number;
  expiresAt?: number;
}

export interface CachedReadingProgress {
  id: string;
  storyId: string;
  userId: string;
  progress: number;
  currentChapter?: number;
  currentEpisode?: number;
  updatedAt: number;
}

export interface Draft {
  id: string;
  userId: string;
  title: string;
  content: string;
  storyId?: string;
  chapterId?: string;
  episodeId?: string;
  synced: boolean;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

export interface CachedSettings {
  id: string;
  userId: string;
  settings: any;
  updatedAt: number;
}

export interface CachedNotification {
  id: string;
  userId: string;
  notification: any;
  read: boolean;
  createdAt: number;
}

export interface PendingAction {
  id: string;
  type: "draft_upload" | "profile_update" | "setting_change" | "other";
  payload: any;
  createdAt: number;
  retryCount: number;
}

export interface CachedApiResponse {
  key: string; // URL + query params hash
  data: any;
  cachedAt: number;
  expiresAt: number;
  userId?: string;
}

let dbInstance: IDBPDatabase<StorytimeDB> | null = null;

/**
 * Initialize and get database instance
 * Returns null if not in browser environment
 */
export async function getDB(): Promise<IDBPDatabase<StorytimeDB> | null> {
  if (!isBrowser) {
    console.warn("IndexedDB is not available (not in browser environment)");
    return null;
  }

  if (dbInstance) return dbInstance;

  dbInstance = await openDB<StorytimeDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Stories store
      if (!db.objectStoreNames.contains(STORES.STORIES)) {
        const storyStore = db.createObjectStore(STORES.STORIES, {
          keyPath: "id",
        });
        storyStore.createIndex("downloadedAt", "downloadedAt");
        storyStore.createIndex("lastReadAt", "lastReadAt");
        storyStore.createIndex("userId", "userId");
        storyStore.createIndex("storyId", "storyId");
      }

      // Chapters store
      if (!db.objectStoreNames.contains(STORES.CHAPTERS)) {
        const chapterStore = db.createObjectStore(STORES.CHAPTERS, {
          keyPath: "id",
        });
        chapterStore.createIndex("storyId", "storyId");
        chapterStore.createIndex("userId", "userId");
        chapterStore.createIndex("chapterId", "chapterId");
      }

      // Episodes store
      if (!db.objectStoreNames.contains(STORES.EPISODES)) {
        const episodeStore = db.createObjectStore(STORES.EPISODES, {
          keyPath: "id",
        });
        episodeStore.createIndex("storyId", "storyId");
        episodeStore.createIndex("userId", "userId");
        episodeStore.createIndex("episodeId", "episodeId");
      }

      // Metadata store
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: "key" });
      }

      // User data store
      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        const userDataStore = db.createObjectStore(STORES.USER_DATA, {
          keyPath: "id",
        });
        userDataStore.createIndex("cachedAt", "cachedAt");
      }

      // Profile store
      if (!db.objectStoreNames.contains(STORES.PROFILE)) {
        const profileStore = db.createObjectStore(STORES.PROFILE, {
          keyPath: "id",
        });
        profileStore.createIndex("userId", "userId");
        profileStore.createIndex("cachedAt", "cachedAt");
      }

      // Reading progress store
      if (!db.objectStoreNames.contains(STORES.READING_PROGRESS)) {
        const progressStore = db.createObjectStore(STORES.READING_PROGRESS, {
          keyPath: "id",
        });
        progressStore.createIndex("storyId", "storyId");
        progressStore.createIndex("userId", "userId");
        progressStore.createIndex("updatedAt", "updatedAt");
      }

      // Drafts store
      if (!db.objectStoreNames.contains(STORES.DRAFTS)) {
        const draftsStore = db.createObjectStore(STORES.DRAFTS, {
          keyPath: "id",
        });
        draftsStore.createIndex("userId", "userId");
        draftsStore.createIndex("createdAt", "createdAt");
        draftsStore.createIndex("synced", "synced");
      }

      // Settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        const settingsStore = db.createObjectStore(STORES.SETTINGS, {
          keyPath: "id",
        });
        settingsStore.createIndex("userId", "userId");
      }

      // Notifications store
      if (!db.objectStoreNames.contains(STORES.NOTIFICATIONS)) {
        const notificationsStore = db.createObjectStore(STORES.NOTIFICATIONS, {
          keyPath: "id",
        });
        notificationsStore.createIndex("userId", "userId");
        notificationsStore.createIndex("createdAt", "createdAt");
        notificationsStore.createIndex("read", "read");
      }

      // Pending actions store
      if (!db.objectStoreNames.contains(STORES.PENDING_ACTIONS)) {
        const actionsStore = db.createObjectStore(STORES.PENDING_ACTIONS, {
          keyPath: "id",
        });
        actionsStore.createIndex("type", "type");
        actionsStore.createIndex("createdAt", "createdAt");
      }

      // API Cache store
      if (!db.objectStoreNames.contains(STORES.API_CACHE)) {
        const cacheStore = db.createObjectStore(STORES.API_CACHE, {
          keyPath: "key",
        });
        cacheStore.createIndex("userId", "userId");
        cacheStore.createIndex("expiresAt", "expiresAt");
      }
    },
  });

  return dbInstance;
}

/**
 * Get storage usage information
 */
export async function getStorageInfo(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
}> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
    return { usage: 0, quota: 0, percentUsed: 0 };
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;

    return { usage, quota, percentUsed };
  } catch (error) {
    console.error("Failed to get storage estimate:", error);
    return { usage: 0, quota: 0, percentUsed: 0 };
  }
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Clear all data from a specific store
 */
export async function clearStore(storeName: keyof typeof STORES) {
  const db = await getDB();
  if (!db) return;

  const storeKey = STORES[storeName];
  await db.clear(storeKey as any);
}

/**
 * Clear all offline data
 */
export async function clearAllData() {
  const db = await getDB();
  if (!db) return;

  const storeNames = Object.values(STORES);

  for (const storeName of storeNames) {
    if (db.objectStoreNames.contains(storeName)) {
      await db.clear(storeName as any);
    }
  }
}

/**
 * Check if database is available
 */
export function isDBAvailable(): boolean {
  return isBrowser;
}

/**
 * Helper class for backward compatibility with old IndexedDBStore API
 * Provides the same interface as the original IndexedDBStore
 */
export class IndexedDBStore<T> {
  constructor(private storeName: string) {}

  async add(item: T): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db.add(this.storeName as any, item as any);
  }

  async put(item: T): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db.put(this.storeName as any, item as any);
  }

  async get(key: string): Promise<T | undefined> {
    const db = await getDB();
    if (!db) return undefined;
    return await db.get(this.storeName as any, key);
  }

  async getAll(): Promise<T[]> {
    const db = await getDB();
    if (!db) return [];
    return await db.getAll(this.storeName as any);
  }

  async delete(key: string): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db.delete(this.storeName as any, key);
  }

  async getByIndex(indexName: string, value: any): Promise<T[]> {
    const db = await getDB();
    if (!db) return [];
    // @ts-ignore - Dynamic store/index access
    return await db.getAllFromIndex(this.storeName, indexName, value);
  }

  async clear(): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db.clear(this.storeName as any);
  }
}

/**
 * Store instances for backward compatibility
 */
export const storiesStore = new IndexedDBStore<OfflineStory>(STORES.STORIES);
export const chaptersStore = new IndexedDBStore<OfflineChapter>(
  STORES.CHAPTERS,
);
export const episodesStore = new IndexedDBStore<OfflineEpisode>(
  STORES.EPISODES,
);
export const metadataStore = new IndexedDBStore<OfflineMetadata>(
  STORES.METADATA,
);

/**
 * Get storage usage estimate
 */
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
}> {
  if (
    !isBrowser ||
    !("storage" in navigator && "estimate" in navigator.storage)
  ) {
    return { usage: 0, quota: 0, percentUsed: 0 };
  }

  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage || 0;
  const quota = estimate.quota || 0;
  const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;

  return { usage, quota, percentUsed };
}
