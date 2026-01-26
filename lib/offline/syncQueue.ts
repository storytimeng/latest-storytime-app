/**
 * Sync Queue Management
 * Handles queuing and processing of offline mutations (POST/PUT/DELETE)
 */

import { getDB, STORES, PendingAction } from "./db";
import { v4 as uuidv4 } from "uuid";

/**
 * Queues a mutation for later execution when online
 */
export async function queueMutation(
  type: PendingAction["type"],
  payload: any,
  options: { id?: string } = {}
): Promise<string> {
  const db = await getDB();
  if (!db) return "";

  const id = options.id || uuidv4();
  const action: PendingAction = {
    id,
    type,
    payload,
    createdAt: Date.now(),
    retryCount: 0,
  };

  try {
    await db.put(STORES.PENDING_ACTIONS, action);
    console.log(`Mutation queued: ${type} (${id})`);
    return id;
  } catch (error) {
    console.error("Failed to queue mutation:", error);
    return "";
  }
}

/**
 * Retrieves all pending actions
 */
export async function getPendingActions(): Promise<PendingAction[]> {
  const db = await getDB();
  if (!db) return [];

  try {
    return await db.getAll(STORES.PENDING_ACTIONS);
  } catch (error) {
    console.error("Failed to retrieve pending actions:", error);
    return [];
  }
}

/**
 * Removes a pending action after successful sync
 */
export async function removePendingAction(id: string): Promise<void> {
  const db = await getDB();
  if (!db) return;

  try {
    await db.delete(STORES.PENDING_ACTIONS, id);
    console.log(`Mutation removed: ${id}`);
  } catch (error) {
    console.error("Failed to remove pending action:", error);
  }
}

/**
 * Increments retry count for a failed action
 */
export async function incrementRetryCount(id: string): Promise<void> {
  const db = await getDB();
  if (!db) return;

  try {
    const action = await db.get(STORES.PENDING_ACTIONS, id);
    if (action) {
      action.retryCount += 1;
      await db.put(STORES.PENDING_ACTIONS, action);
    }
  } catch (error) {
    console.error("Failed to increment retry count:", error);
  }
}

/**
 * Clears the sync queue
 */
export async function clearSyncQueue(): Promise<void> {
  const db = await getDB();
  if (!db) return;

  try {
    await db.clear(STORES.PENDING_ACTIONS);
  } catch (error) {
    console.error("Failed to clear sync queue:", error);
  }
}
