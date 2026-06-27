/// <reference lib="webworker" />

import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  // When a navigation request fails, serve /~offline (registered as an
  // additionalPrecacheEntry in app/serwist/[path]/route.ts).
  // The matcher restricts the fallback to top-level navigations only so
  // it doesn't intercept asset requests.
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

// --- Push notifications ---
// Receives push events from the server (via VAPID) and shows a notification.
// Payload shape: { title: string, body?: string, icon?: string, url?: string, tag?: string }
self.addEventListener("push", (event: any) => {
  let payload: {
    title?: string;
    body?: string;
    icon?: string;
    badge?: string;
    url?: string;
    tag?: string;
  } = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { title: event.data.text() || "Notification" };
    }
  }

  const title = payload.title || "Storytime";
  const options = {
    body: payload.body,
    icon: payload.icon || "/icons/icon-192x192.png",
    badge: payload.badge || "/icons/icon-96x96.png",
    tag: payload.tag,
    data: { url: payload.url || "/notification" },
    vibrate: [100, 50, 100],
  } as unknown as NotificationOptions & { data?: unknown };

  event.waitUntil((self as any).registration.showNotification(title, options));
});

// --- Notification click → focus or open app, navigate to payload.url ---
self.addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  const targetUrl: string = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      const allClients = await (self as any).clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      // Focus an existing Storytime tab if any.
      for (const client of allClients) {
        if ("focus" in client) {
          try {
            await client.focus();
            if ("navigate" in client) {
              return client.navigate(targetUrl);
            }
            return undefined;
          } catch {
            // Fall through to opening a new window.
          }
        }
      }
      // Otherwise open a fresh window.
      return (self as any).clients.openWindow(targetUrl);
    })(),
  );
});