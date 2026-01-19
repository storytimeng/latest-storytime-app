/// <reference lib="webworker" />

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
  StaleWhileRevalidate,
} from "serwist";
import { CacheableResponsePlugin } from "@serwist/cacheable-response";
import { ExpirationPlugin } from "@serwist/expiration";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

// Types for matcher functions
type MatcherContext = {
  request: Request;
  url: URL;
  sameOrigin: boolean;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  offlineAnalyticsConfig: false,
  runtimeCaching: [
    // Cache static assets (images, fonts, etc.)
    {
      matcher: ({ request }: MatcherContext) => request.destination === "image",
      handler: new CacheFirst({
        cacheName: "images",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    {
      matcher: ({ request }: MatcherContext) => request.destination === "font",
      handler: new CacheFirst({
        cacheName: "fonts",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          }),
        ],
      }),
    },
    // Cache JS/CSS with StaleWhileRevalidate
    {
      matcher: ({ request }: MatcherContext) =>
        request.destination === "script" || request.destination === "style",
      handler: new StaleWhileRevalidate({
        cacheName: "static-resources",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 60,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          }),
        ],
      }),
    },
    // DO NOT CACHE API ROUTES - Use NetworkOnly
    {
      matcher: ({ url }: MatcherContext) => url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },
    // DO NOT CACHE _rsc requests (React Server Components)
    {
      matcher: ({ url }: MatcherContext) => url.search.includes("_rsc="),
      handler: new NetworkOnly(),
    },
    // Cache pages with StaleWhileRevalidate for better offline support
    {
      matcher: ({ request }: MatcherContext) => request.mode === "navigate",
      handler: new StaleWhileRevalidate({
        cacheName: "pages",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();
