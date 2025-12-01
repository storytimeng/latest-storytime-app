/**
 * IndexedDB wrapper for offline story storage
 * Stores stories, chapters/episodes for offline reading
 */

const DB_NAME = "StorytimeOfflineDB";
const DB_VERSION = 1;

// Store names
export const STORES = {
  STORIES: "stories",
  CHAPTERS: "chapters",
  EPISODES: "episodes",
  METADATA: "metadata",
} as const;

export interface OfflineStory {
  id: string;
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
  lastUpdatedAt?: number; // Track when content was last updated on server
  metadata: Record<string, any>;
}

export interface OfflineChapter {
  id: string;
  storyId: string;
  chapterNumber: number;
  title: string;
  content: string;
  wordCount?: number;
  downloadedAt: number;
  lastUpdatedAt?: number; // Track when chapter was last updated on server
}

export interface OfflineEpisode {
  id: string;
  storyId: string;
  episodeNumber: number;
  title: string;
  content: string;
  duration?: number;
  downloadedAt: number;
  lastUpdatedAt?: number; // Track when episode was last updated on server
}

export interface OfflineMetadata {
  key: string;
  value: any;
  updatedAt: number;
}

/**
 * Initialize IndexedDB
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Stories store
      if (!db.objectStoreNames.contains(STORES.STORIES)) {
        const storyStore = db.createObjectStore(STORES.STORIES, {
          keyPath: "id",
        });
        storyStore.createIndex("downloadedAt", "downloadedAt", {
          unique: false,
        });
        storyStore.createIndex("lastReadAt", "lastReadAt", { unique: false });
      }

      // Chapters store
      if (!db.objectStoreNames.contains(STORES.CHAPTERS)) {
        const chapterStore = db.createObjectStore(STORES.CHAPTERS, {
          keyPath: "id",
        });
        chapterStore.createIndex("storyId", "storyId", { unique: false });
        chapterStore.createIndex(
          "storyId_chapterNumber",
          ["storyId", "chapterNumber"],
          {
            unique: true,
          }
        );
      }

      // Episodes store
      if (!db.objectStoreNames.contains(STORES.EPISODES)) {
        const episodeStore = db.createObjectStore(STORES.EPISODES, {
          keyPath: "id",
        });
        episodeStore.createIndex("storyId", "storyId", { unique: false });
        episodeStore.createIndex(
          "storyId_episodeNumber",
          ["storyId", "episodeNumber"],
          {
            unique: true,
          }
        );
      }

      // Metadata store (for storing settings, last sync time, etc.)
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: "key" });
      }
    };
  });
}

/**
 * Generic CRUD operations
 */
export class IndexedDBStore<T> {
  constructor(
    private storeName: string,
    private dbPromise: Promise<IDBDatabase> = initDB()
  ) {}

  async add(item: T): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.add(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async put(item: T): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get(key: string): Promise<T | undefined> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(): Promise<T[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex(indexName: string, value: any): Promise<T[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * Store instances
 */
export const storiesStore = new IndexedDBStore<OfflineStory>(STORES.STORIES);
export const chaptersStore = new IndexedDBStore<OfflineChapter>(
  STORES.CHAPTERS
);
export const episodesStore = new IndexedDBStore<OfflineEpisode>(
  STORES.EPISODES
);
export const metadataStore = new IndexedDBStore<OfflineMetadata>(
  STORES.METADATA
);

/**
 * Get storage usage estimate
 */
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
}> {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;

    return { usage, quota, percentUsed };
  }

  return { usage: 0, quota: 0, percentUsed: 0 };
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
