/**
 * Sync Processor
 * Orchestrates the synchronization of pending offline mutations when online
 */

import { client } from "@/src/client/client.gen";
import { getPendingActions, removePendingAction, incrementRetryCount } from "./syncQueue";

let isProcessing = false;

/**
 * Processes all pending mutations in the queue
 */
export async function processSyncQueue(): Promise<void> {
  const isOnline = typeof window !== "undefined" ? navigator.onLine : true;
  if (!isOnline || isProcessing) return;

  const actions = await getPendingActions();
  if (actions.length === 0) return;

  isProcessing = true;
  console.log(`🔄 [Sync] Processing ${actions.length} pending actions...`);

  // We use the client's internal request if possible or ensure our interceptor 
  // knows to skip queuing for sync requests
  const api = (client as any)._originalClient || client;
  const originalRequest = (client as any)._originalRequest || client.request;

  for (const action of actions) {
    const { id, type, payload } = action;
    const { url, method, body, query, path, headers } = payload;

    try {
      console.log(`[Sync] Executing: ${method} ${url} (${id})`);
      
      // We pass a special flag to skip the interceptor's offline check/queuing
      const result = await client.request({
        url,
        method,
        body,
        query,
        path,
        headers,
        _isSyncRequest: true // Hint for interceptor
      } as any);

      if (!result.error) {
        console.log(`✅ [Sync] Successfully synced: ${id}`);
        await removePendingAction(id);
      } else {
        console.warn(`❌ [Sync] Failed to sync ${id}:`, result.error);
        await incrementRetryCount(id);
        
        // If it's a validation error (400) or unauthorized, we might want to remove it
        // so it doesn't block the queue forever.
        // For now, we'll just continue to next item.
      }
    } catch (error) {
      console.error(`💥 [Sync] Critical error syncing ${id}:`, error);
      await incrementRetryCount(id);
    }
  }

  isProcessing = false;
  console.log("🏁 [Sync] Processing complete");
}

/**
 * Initializes listeners for online state to trigger sync
 */
export function setupSyncListeners() {
  if (typeof window === "undefined") return;

  window.addEventListener("online", () => {
    console.log("🌐 Connection restored, triggering sync...");
    processSyncQueue();
  });

  // Initial check
  if (navigator.onLine) {
    processSyncQueue();
  }
}
