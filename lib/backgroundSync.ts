/**
 * Background Sync utility for Progressive Web Apps
 * Registers and manages background sync tasks for offline data
 */

export interface SyncTask {
  id: string;
  type:
    | "draft_upload"
    | "profile_update"
    | "settings_change"
    | "reading_progress";
  payload: any;
  createdAt: number;
  retryCount: number;
}

/**
 * Check if Background Sync API is supported
 */
export function isBackgroundSyncSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "sync" in ServiceWorkerRegistration.prototype
  );
}

/**
 * Register a background sync task
 */
export async function registerBackgroundSync(tag: string): Promise<boolean> {
  if (!isBackgroundSyncSupported()) {
    console.warn("Background Sync not supported");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    // @ts-ignore - sync is part of ServiceWorkerRegistration in some browsers
    await registration.sync.register(tag);
    console.log(`Background sync registered: ${tag}`);
    return true;
  } catch (error) {
    console.error("Failed to register background sync:", error);
    return false;
  }
}

/**
 * Register sync for drafts
 */
export async function syncDrafts(): Promise<boolean> {
  return registerBackgroundSync("sync-drafts");
}

/**
 * Register sync for reading progress
 */
export async function syncReadingProgress(): Promise<boolean> {
  return registerBackgroundSync("sync-reading-progress");
}

/**
 * Register sync for profile updates
 */
export async function syncProfile(): Promise<boolean> {
  return registerBackgroundSync("sync-profile");
}

/**
 * Request persistent storage
 * This prevents the browser from evicting cached data
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) {
    return false;
  }

  try {
    const isPersisted = await navigator.storage.persist();
    console.log(`Persistent storage: ${isPersisted ? "granted" : "denied"}`);
    return isPersisted;
  } catch (error) {
    console.error("Failed to request persistent storage:", error);
    return false;
  }
}

/**
 * Check if storage is persisted
 */
export async function isStoragePersisted(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage?.persisted) {
    return false;
  }

  try {
    return await navigator.storage.persisted();
  } catch (error) {
    console.error("Failed to check storage persistence:", error);
    return false;
  }
}
