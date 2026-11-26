/**
 * Push Notification client helpers
 *
 * Browser-side wrappers around `PushManager` + the project's push API.
 * The VAPID public key must be exposed as `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
 *
 * Backend integration points (implemented externally - see BACKEND_PUSH.md):
 *   - POST {API_BASE}/push/subscribe    - store PushSubscription for current user
 *   - DELETE {API_BASE}/push/subscribe - remove PushSubscription
 *   - GET  {API_BASE}/push/vapid-public - optionally return public key from server
 */

import { ensureValidToken } from "@/src/lib/tokenManager";
import { getApiBaseUrl } from "@/src/lib/apiBase";

export type PushPermissionState =
  | "unsupported"
  | "default"
  | "granted"
  | "denied";

function resolveApiBase(apiBase?: string): string {
  return (apiBase || getApiBaseUrl()).replace(/\/+$/, "");
}

/** Read the public VAPID key from env or fetch it from the backend. */
export async function getVapidPublicKey(apiBase?: string): Promise<string | null> {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (key && key.length > 0) return key;

  try {
    const res = await fetch(
      `${resolveApiBase(apiBase)}/notifications/push/vapid-public`,
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.publicKey || json?.publicKey || null;
  } catch {
    return null;
  }
}

/** Convert a base64url string to a Uint8Array (required by `applicationServerKey`). */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = typeof window === "undefined" ? "" : window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** Current Notification permission state, normalised. */
export function getPermissionState(): PushPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return "unsupported";
  }
  return (Notification.permission as PushPermissionState) ?? "default";
}

/** Returns the current active push subscription, if any. */
export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

/**
 * Request permission, subscribe the active SW to push, and POST the
 * subscription to the backend so it can be stored against the user.
 *
 * Backend must implement `POST ${apiBase}/push/subscribe` accepting JSON:
 *   { endpoint, keys: { p256dh, auth }, userId?: string }
 *
 * Returns the resulting PushSubscription, or throws.
 */
export async function subscribeToPush(
  opts: {
    apiBase?: string;
    userId?: string | null;
  } = {},
): Promise<PushSubscription> {
  const perm = await Notification.requestPermission();
  if (perm !== "granted") {
    throw new Error(`Notification permission ${perm}`);
  }

  const vapidKey = await getVapidPublicKey(opts.apiBase);
  if (!vapidKey) {
    throw new Error(
      "Unable to retrieve VAPID public key for push notifications.",
    );
  }

  const reg = await navigator.serviceWorker.ready;
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });

  const apiBase = resolveApiBase(opts.apiBase);
  const token = await ensureValidToken();
  const json = subscription.toJSON();
  const res = await fetch(`${apiBase}/notifications/push/subscribe`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
      },
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to save push subscription (${res.status})`);
  }

  return subscription;
}

/** Unsubscribe from push and tell the backend to drop the record. */
export async function unsubscribeFromPush(
  opts: { apiBase?: string } = {},
): Promise<boolean> {
  const sub = await getExistingSubscription();
  if (!sub) return false;

  const apiBase = resolveApiBase(opts.apiBase);
  const token = await ensureValidToken();
  try {
    await fetch(`${apiBase}/notifications/push/subscribe`, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
  } catch {
    // Still unsubscribe locally even if backend fails
  }
  return sub.unsubscribe();
}
