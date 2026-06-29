import { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/app";

// Regenerate sitemap at most every 30 minutes in production.
// On-demand revalidation via /api/revalidate will also purge this immediately.
export const revalidate = 1800;

const BASE = APP_CONFIG.url;

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: `${BASE}/`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  },
  {
    url: `${BASE}/home`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${BASE}/search`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: `${BASE}/leaderboard`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.6,
  },
  {
    url: `${BASE}/premium`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${BASE}/ambassador`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  },
  // Category discovery pages
  {
    url: `${BASE}/category/recently-added`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.9,
  },
  {
    url: `${BASE}/category/trending`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.9,
  },
  {
    url: `${BASE}/category/popular`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: `${BASE}/category/only-on-storytime`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
];

async function fetchPublishedStories(): Promise<MetadataRoute.Sitemap> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || `https://api.${APP_CONFIG.domain}`;

    const allStories: Array<{ id: string; updatedAt?: string }> = [];
    const limit = 100;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const res = await fetch(
        `${apiUrl}/stories?page=${page}&limit=${limit}`,
        { next: { revalidate: 1800 } },
      );

      if (!res.ok) break;

      const json = await res.json();
      const items: Array<{ id: string; updatedAt?: string }> =
        json?.data?.items || json?.data || [];

      allStories.push(...items);

      // Stop if we got fewer items than the limit (last page)
      hasMore = items.length === limit;
      page++;

      // Safety cap: fetch at most 10 pages (1000 stories)
      if (page > 10) break;
    }

    return allStories.map((story) => ({
      url: `${BASE}/story/${story.id}`,
      lastModified: story.updatedAt ? new Date(story.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    return [];
  }
}

async function fetchGenrePages(): Promise<MetadataRoute.Sitemap> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || `https://api.${APP_CONFIG.domain}`;
    const res = await fetch(`${apiUrl}/stories/genres`, {
      next: { revalidate: 86400 }, // refresh genres once a day
    });

    if (!res.ok) return [];

    const json = await res.json();
    const genres: Array<string | { name: string }> =
      json?.data?.genres || json?.genres || json?.data || [];

    return genres.map((g) => {
      const name = typeof g === "string" ? g : g.name;
      return {
        url: `${BASE}/all-genres/${encodeURIComponent(name)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [storyRoutes, genreRoutes] = await Promise.all([
    fetchPublishedStories(),
    fetchGenrePages(),
  ]);
  return [...staticRoutes, ...storyRoutes, ...genreRoutes];
}
