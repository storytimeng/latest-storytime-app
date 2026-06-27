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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate initial state.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPermission(getPermissionState());
      try {
        const sub = await getExistingSubscription();
        if (!cancelled) setIsSubscribed(!!sub);
      } catch {
        // Ignore - permission/subscription not available.
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

  return { permission, isSubscribed, isLoading, error, subscribe, unsubscribe };
}
