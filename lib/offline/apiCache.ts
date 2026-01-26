/**
 * API Caching Layer
 * Synchronizes API responses with IndexedDB for offline access and performance
 */

import { getDB, STORES, CachedApiResponse } from "./db";

// Default TTL for cached entries (24 hours)
const DEFAULT_TTL = 24 * 60 * 60 * 1000;

/**
 * Normalizes a URL/endpoint for use as a cache key
 */
export function normalizeCacheKey(url: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) return url;
  
  // Sort keys to ensure consistency
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc: any, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
    
  return `${url}?${JSON.stringify(sortedParams)}`;
}

/**
 * Stores an API response in IndexedDB
 */
export async function cacheApiResponse(
  url: string,
  data: any,
  options: {
    ttl?: number;
    userId?: string;
    params?: Record<string, any>;
  } = {}
): Promise<void> {
  const db = await getDB();
  if (!db) return;

  const key = normalizeCacheKey(url, options.params);
  const now = Date.now();
  const ttl = options.ttl || DEFAULT_TTL;

  const entry: CachedApiResponse = {
    key,
    data,
    cachedAt: now,
    expiresAt: now + ttl,
    userId: options.userId,
  };

  try {
    await db.put(STORES.API_CACHE, entry);
  } catch (error) {
    console.error("Failed to cache API response:", error);
  }
}

/**
 * Retrieves a cached API response
 */
export async function getCachedResponse(
  url: string,
  params?: Record<string, any>
): Promise<any | null> {
  const db = await getDB();
  if (!db) return null;

  const key = normalizeCacheKey(url, params);

  try {
    const entry = await db.get(STORES.API_CACHE, key);
    
    if (!entry) return null;

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      // Background delete expired entry
      db.delete(STORES.API_CACHE, key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error("Failed to retrieve cached API response:", error);
    return null;
  }
}

/**
 * Invalidates (deletes) a cached API response
 */
export async function invalidateCache(
  url: string,
  params?: Record<string, any>
): Promise<void> {
  const db = await getDB();
  if (!db) return;

  const key = normalizeCacheKey(url, params);

  try {
    await db.delete(STORES.API_CACHE, key);
  } catch (error) {
    console.error("Failed to invalidate cache:", error);
  }
}

/**
 * Clears all cached API data for a specific user
 */
export async function clearUserCache(userId: string): Promise<void> {
  const db = await getDB();
  if (!db) return;

  try {
    const tx = db.transaction(STORES.API_CACHE, "readwrite");
    const index = tx.store.index("userId");
    const keys = await index.getAllKeys(userId);
    
    for (const key of keys) {
      await tx.store.delete(key);
    }
    
    await tx.done;
  } catch (error) {
    console.error("Failed to clear user cache:", error);
  }
}

/**
 * Prunes expired entries from the cache
 */
export async function pruneExpiredCache(): Promise<void> {
  const db = await getDB();
  if (!db) return;

  try {
    const tx = db.transaction(STORES.API_CACHE, "readwrite");
    const index = tx.store.index("expiresAt");
    const expiredKeys = await index.getAllKeys(IDBKeyRange.upperBound(Date.now()));
    
    for (const key of expiredKeys) {
      await tx.store.delete(key);
    }
    
    await tx.done;
  } catch (error) {
    console.error("Failed to prune expired cache:", error);
  }
}
