"use client";

import { useState, useEffect, useCallback } from "react";
import { getDB, STORES, Draft, PendingAction } from "@/lib/offline/db";
import { useOnlineStatus } from "./useOnlineStatus";

// Generate unique ID
const generateId = () => crypto.randomUUID();

/**
 * Hook to manage drafts with offline queue support
 */
export function useDraftQueue(userId: string | null) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const isOnline = useOnlineStatus();

  // Load drafts from IndexedDB
  const loadDrafts = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const db = await getDB();
      if (!db) {
        setIsLoading(false);
        return;
      }

      const allDrafts = await db.getAllFromIndex(
        STORES.DRAFTS,
        "userId",
        userId,
      );
      setDrafts(allDrafts.sort((a, b) => b.updatedAt - a.updatedAt));
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading drafts:", error);
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  // Save draft to IndexedDB
  const saveDraft = useCallback(
    async (draft: Omit<Draft, "id" | "userId" | "createdAt" | "updatedAt">) => {
      if (!userId) throw new Error("User ID required");

      const db = await getDB();
      if (!db) throw new Error("IndexedDB not available");

      const now = Date.now();

      const draftId = draft.storyId || generateId();

      const newDraft: Draft = {
        id: draftId,
        userId,
        ...draft,
        createdAt: now,
        updatedAt: now,
      };

      await db.put(STORES.DRAFTS, newDraft);
      await loadDrafts();

      // If online, try to sync immediately
      if (isOnline && !draft.synced) {
        syncDraft(draftId);
      }

      return draftId;
    },
    [userId, isOnline, loadDrafts],
  );

  // Update existing draft
  const updateDraft = useCallback(
    async (draftId: string, updates: Partial<Draft>) => {
      const db = await getDB();
      if (!db) throw new Error("IndexedDB not available");

      const existing = await db.get(STORES.DRAFTS, draftId);

      if (!existing) throw new Error("Draft not found");

      const updatedDraft: Draft = {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
      };

      await db.put(STORES.DRAFTS, updatedDraft);
      await loadDrafts();

      // If online and not synced, try to sync
      if (isOnline && !updatedDraft.synced) {
        syncDraft(draftId);
      }
    },
    [isOnline, loadDrafts],
  );

  // Delete draft
  const deleteDraft = useCallback(
    async (draftId: string) => {
      const db = await getDB();
      if (!db) throw new Error("IndexedDB not available");

      await db.delete(STORES.DRAFTS, draftId);
      await loadDrafts();
    },
    [loadDrafts],
  );

  // Sync a specific draft
  const syncDraft = useCallback(
    async (draftId: string) => {
      if (!isOnline) {
        console.log("Cannot sync draft: offline");
        return false;
      }

      try {
        const db = await getDB();
        if (!db) {
          console.warn("IndexedDB not available for syncing");
          return false;
        }

        const draft = await db.get(STORES.DRAFTS, draftId);

        if (!draft || draft.synced) return false;

        // TODO: Implement actual API call to upload draft
        // For now, we'll just mark it as synced after a delay
        console.log("Syncing draft:", draftId);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mark as synced
        draft.synced = true;
        draft.updatedAt = Date.now();
        await db.put(STORES.DRAFTS, draft);
        await loadDrafts();

        return true;
      } catch (error) {
        console.error("Error syncing draft:", error);
        return false;
      }
    },
    [isOnline, loadDrafts],
  );

  // Sync all unsynced drafts
  const syncAllDrafts = useCallback(async () => {
    if (!isOnline) {
      console.log("Cannot sync drafts: offline");
      return;
    }

    setIsSyncing(true);

    try {
      const unsyncedDrafts = drafts.filter((d) => !d.synced);

      for (const draft of unsyncedDrafts) {
        await syncDraft(draft.id);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, drafts, syncDraft]);

  // Get count of unsynced drafts
  const unsyncedCount = drafts.filter((d) => !d.synced).length;

  return {
    drafts,
    isLoading,
    isSyncing,
    unsyncedCount,
    saveDraft,
    updateDraft,
    deleteDraft,
    syncDraft,
    syncAllDrafts,
    isOnline,
  };
}
