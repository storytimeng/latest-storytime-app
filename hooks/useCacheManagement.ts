"use client";

import { useState, useEffect } from "react";

export interface CacheStats {
  localStorage: number;
  sessionStorage: number;
  indexedDB: number;
  total: number;
}

/**
 * Hook for managing browser caches
 * Provides cache size calculation and clearing functions
 */
export const useCacheManagement = () => {
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    localStorage: 0,
    sessionStorage: 0,
    indexedDB: 0,
    total: 0,
  });
  const [isCalculating, setIsCalculating] = useState(false);

  /**
   * Format bytes to human-readable size
   */
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  /**
   * Calculate localStorage size
   */
  const calculateLocalStorageSize = (): number => {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total * 2; // UTF-16 uses 2 bytes per character
    } catch (error) {
      console.error("Error calculating localStorage size:", error);
      return 0;
    }
  };

  /**
   * Calculate sessionStorage size
   */
  const calculateSessionStorageSize = (): number => {
    try {
      let total = 0;
      for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
          total += sessionStorage[key].length + key.length;
        }
      }
      return total * 2; // UTF-16 uses 2 bytes per character
    } catch (error) {
      console.error("Error calculating sessionStorage size:", error);
      return 0;
    }
  };

  /**
   * Calculate IndexedDB size (estimated)
   */
  const calculateIndexedDBSize = async (): Promise<number> => {
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return estimate.usage || 0;
      }
      return 0;
    } catch (error) {
      console.error("Error calculating IndexedDB size:", error);
      return 0;
    }
  };

  /**
   * Calculate all cache sizes
   */
  const calculateCacheSizes = async () => {
    setIsCalculating(true);
    try {
      const localSize = calculateLocalStorageSize();
      const sessionSize = calculateSessionStorageSize();
      const indexedSize = await calculateIndexedDBSize();

      const stats: CacheStats = {
        localStorage: localSize,
        sessionStorage: sessionSize,
        indexedDB: indexedSize,
        total: localSize + sessionSize + indexedSize,
      };

      setCacheStats(stats);
    } catch (error) {
      console.error("Error calculating cache sizes:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  /**
   * Clear localStorage (Misc Cache)
   */
  const clearLocalStorage = () => {
    try {
      localStorage.clear();
      calculateCacheSizes();
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  };

  /**
   * Clear sessionStorage
   */
  const clearSessionStorage = () => {
    try {
      sessionStorage.clear();
      calculateCacheSizes();
      return true;
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
      return false;
    }
  };

  /**
   * Clear IndexedDB
   */
  const clearIndexedDB = async () => {
    try {
      if ("databases" in indexedDB) {
        const dbs = await indexedDB.databases();
        await Promise.all(
          dbs.map((db) => {
            if (db.name) {
              return new Promise<void>((resolve, reject) => {
                const request = indexedDB.deleteDatabase(db.name!);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
              });
            }
            return Promise.resolve();
          })
        );
      }
      await calculateCacheSizes();
      return true;
    } catch (error) {
      console.error("Error clearing IndexedDB:", error);
      return false;
    }
  };

  /**
   * Clear all caches and reset stores
   */
  const clearAllCaches = async () => {
    try {
      // Clear browser storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear IndexedDB
      await clearIndexedDB();

      // Reset Zustand stores
      try {
        const { useAuthStore } = await import("@/src/stores/useAuthStore");
        const { useUserStore } = await import("@/src/stores/useUserStore");
        const { useLoadingStore } = await import("@/src/stores/useLoadingStore");

        // Reset stores if they have reset methods
        if (typeof useAuthStore.getState === "function") {
          useAuthStore.setState({
            resetEmail: null,
            resetOtp: null,
          });
        }

        if (typeof useUserStore.getState === "function") {
          useUserStore.setState({
            user: null,
          });
        }
      } catch (storeError) {
        console.warn("Could not reset some stores:", storeError);
      }

      await calculateCacheSizes();
      return true;
    } catch (error) {
      console.error("Error clearing all caches:", error);
      return false;
    }
  };

  // Calculate cache sizes on mount
  useEffect(() => {
    calculateCacheSizes();
  }, []);

  return {
    cacheStats,
    isCalculating,
    formatBytes,
    calculateCacheSizes,
    clearLocalStorage,
    clearSessionStorage,
    clearIndexedDB,
    clearAllCaches,
  };
};
