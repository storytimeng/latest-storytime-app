"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getExistingSubscription,
  getPermissionState,
  subscribeToPush,
  unsubscribeFromPush,
  type PushPermissionState,
} from "@/lib/push/client";

export interface UsePushSubscriptionResult {
  /** Browser support state. */
  permission: PushPermissionState;
  /** True if a push subscription currently exists. */
  isSubscribed: boolean;
  /** True while initial subscription state is being hydrated from ServiceWorker. */
  isHydrating: boolean;
  /** True while a subscribe/unsubscribe is in flight. */
  isLoading: boolean;
  /** Last error message, if any. */
  error: string | null;
  /** Trigger the native permission prompt and subscribe. */
  subscribe: () => Promise<void>;
  /** Unsubscribe and tell the backend to drop the subscription. */
  unsubscribe: () => Promise<void>;
}

/**
 * React hook for managing the browser's push subscription state.
 *
 * SSR-safe: returns neutral defaults on the server and hydrates on mount.
 */
export function usePushSubscription(
  opts: {
    apiBase?: string;
    userId?: string | null;
  } = {},
): UsePushSubscriptionResult {
  const [permission, setPermission] = useState<PushPermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate initial state.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const perm = getPermissionState();
      setPermission(perm);
      try {
        const sub = await getExistingSubscription();
        if (!cancelled) setIsSubscribed(!!sub);
        // If browser permission is already granted, ensure backend has the active subscription synced
        if (!cancelled && perm === "granted" && !sub) {
          try {
            await subscribeToPush(opts);
            if (!cancelled) setIsSubscribed(true);
          } catch {
            // Silent background sync
          }
        }
      } catch {
        // Ignore - permission/subscription not available.
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const subscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await subscribeToPush(opts);
      setIsSubscribed(true);
      setPermission("granted");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setPermission(getPermissionState());
    } finally {
      setIsLoading(false);
    }
  }, [opts]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ok = await unsubscribeFromPush(opts);
      setIsSubscribed(!ok && false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [opts]);

  return {
    permission,
    isSubscribed,
    isHydrating,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  };
}
