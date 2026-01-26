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
  precacheEntries: [
    ...(self.__SW_MANIFEST || []),
    // Main pages
    { url: "/", revision: "1" },
    { url: "/home", revision: "1" },
    { url: "/library", revision: "1" },
    { url: "/notification", revision: "1" },
    { url: "/pen", revision: "1" },

    // Auth pages
    { url: "/auth", revision: "1" },
    { url: "/auth/login", revision: "1" },
    { url: "/auth/signup", revision: "1" },
    { url: "/auth/onboarding", revision: "1" },
    { url: "/auth/forgot-password", revision: "1" },
    { url: "/auth/update-password", revision: "1" },
    { url: "/auth/password-updated", revision: "1" },
    { url: "/auth/email-sent", revision: "1" },
    { url: "/auth/otp", revision: "1" },
    { url: "/auth/setup", revision: "1" },

    // App pages
    { url: "/all-genres", revision: "1" },
    { url: "/my-stories", revision: "1" },
    { url: "/new-story", revision: "1" },
    { url: "/premium", revision: "1" },
    { url: "/pricing", revision: "1" },
    { url: "/profile", revision: "1" },
    { url: "/search", revision: "1" },
    { url: "/settings", revision: "1" },
    { url: "/offline", revision: "1" },
  ],
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
    // Cache API routes with StaleWhileRevalidate for offline support
    // User data (profile, settings, achievements, stats) - cache indefinitely until next online sync
    {
      matcher: ({ url }: MatcherContext) =>
        url.pathname.startsWith("/api/users/profile") ||
        url.pathname.startsWith("/api/users/achievements") ||
        url.pathname.startsWith("/api/users/stats") ||
        url.pathname === "/api/settings",
      handler: new StaleWhileRevalidate({
        cacheName: "api-user-data",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 50,
            // No maxAgeSeconds - cache indefinitely
          }),
        ],
      }),
    },
    // Stories data - cache for 2 weeks
    {
      matcher: ({ url }: MatcherContext) =>
        url.pathname.startsWith("/api/stories") ||
        url.pathname.startsWith("/api/genres") ||
        url.pathname.startsWith("/api/categories"),
      handler: new StaleWhileRevalidate({
        cacheName: "api-stories",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 14 * 24 * 60 * 60, // 2 weeks
          }),
        ],
      }),
    },
    // Reading history and progress - cache for 1 hour
    {
      matcher: ({ url }: MatcherContext) =>
        url.pathname.startsWith("/api/users/reading-history") ||
        url.pathname.startsWith("/api/users/reading-progress"),
      handler: new StaleWhileRevalidate({
        cacheName: "api-reading-data",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 60 * 60, // 1 hour
          }),
        ],
      }),
    },
    // Notifications - cache for 5 minutes
    {
      matcher: ({ url }: MatcherContext) =>
        url.pathname.startsWith("/api/notifications"),
      handler: new StaleWhileRevalidate({
        cacheName: "api-notifications",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5 minutes
          }),
        ],
      }),
    },
    // Mutation endpoints (POST/PUT/DELETE) - DO NOT CACHE
    {
      matcher: ({ request, url }: MatcherContext) =>
        url.pathname.startsWith("/api/") &&
        (request.method === "POST" ||
          request.method === "PUT" ||
          request.method === "DELETE" ||
          request.method === "PATCH"),
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
