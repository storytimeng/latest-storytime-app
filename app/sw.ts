/// <reference lib="webworker" />

import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { NetworkFirst } from "serwist";

const readerPagesHandler = new NetworkFirst({
  cacheName: "reader-pages",
  networkTimeoutSeconds: 10,
});

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;
// Cache the HTML shell for /story/[id]/read keyed by pathname only.
// Any ?chapterId= / ?episodeId= variation then gets the same shell,
// and the React component loads chapter content from IndexedDB.
const READER_SHELL_CACHE = "reader-shells-v1";

const readerShellHandler = {
  handle: async ({ request }: { request: Request }): Promise<Response> => {
    const url = new URL(request.url);
    // Strip search params so all chapter variants share one cached shell
    const shellKey = url.origin + url.pathname;
    const cache = await caches.open(READER_SHELL_CACHE);

    try {
      const response = await fetch(request);
      if (response.ok) {
        // Always refresh the shell when online
        await cache.put(shellKey, response.clone());
        return response;
      }
    } catch {
      // Network unavailable — fall through to cache
    }

    const cached = await cache.match(shellKey);
    if (cached) return cached;

    // Last resort: generic offline page
    const offline = await caches.match("/~offline");
    return (
      offline ??
      new Response("Offline", {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      })
    );
  },
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Must come before defaultCache so it wins for these paths
    {
      matcher: ({ url }: { url: URL }) =>
        /\/story\/[^/]+\/read/.test(url.pathname),
      handler: readerPagesHandler,
    },
    {
      matcher: ({ url }: { url: URL }) =>
        /\/story\/[^/]+\/read$/.test(url.pathname),
      handler: readerShellHandler,
    },
    ...defaultCache,
  ],
  // When a navigation request fails, serve /~offline (registered as an
  // additionalPrecacheEntry in app/serwist/[path]/route.ts).
  // The matcher restricts the fallback to top-level navigations only so
  // it doesn't intercept asset requests.
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }: { request: Request }) {
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
