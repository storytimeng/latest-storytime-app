/**
 * Hook for managing and monitoring the offline mutation queue
 */

import { useState, useEffect, useCallback } from "react";
import { getPendingActions, clearSyncQueue } from "@/lib/offline/syncQueue";
import { processSyncQueue } from "@/lib/offline/syncProcessor";
import { useOnlineStatus } from "./useOnlineStatus";

export function useOfflineQueue() {
  const [queuedCount, setQueuedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const isOnline = useOnlineStatus();

  const updateCount = useCallback(async () => {
    const actions = await getPendingActions();
    setQueuedCount(actions.length);
  }, []);

  // Monitor the queue
  useEffect(() => {
    updateCount();
    
    // Check every 5 seconds for updates (simplified monitoring)
    const interval = setInterval(updateCount, 5000);
    return () => clearInterval(interval);
  }, [updateCount]);

  // Auto-sync when online and queue has items
  useEffect(() => {
    if (isOnline && queuedCount > 0 && !isSyncing) {
      handleSync();
    }
  }, [isOnline, queuedCount, isSyncing]);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await processSyncQueue();
      await updateCount();
    } catch (error) {
      console.error("Manual sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    queuedCount,
    isSyncing,
    syncNow: handleSync,
    clearQueue: async () => {
      await clearSyncQueue();
      await updateCount();
    },
  };
}
