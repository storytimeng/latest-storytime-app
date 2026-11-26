import { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/app";
import { getServerApiBaseUrl } from "@/lib/seo/storyMetadata";

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
    url: `${BASE}/pricing`,
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
  {
    url: `${BASE}/terms`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.3,
  },
  {
    url: `${BASE}/privacy`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.3,
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
    const apiUrl = getServerApiBaseUrl();
    const entries: MetadataRoute.Sitemap = [];
    const MAX_PAGES = 10;

    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await fetch(`${apiUrl}/stories?page=${page}&limit=100`, {
        next: { revalidate: 1800 },
      });

      if (!res.ok) break;

      const json = await res.json();
      const stories: Array<{ id: string; updatedAt?: string }> =
        json?.data?.stories ||
        json?.stories ||
        json?.data?.items ||
        [];

      if (!Array.isArray(stories) || stories.length === 0) break;

      for (const story of stories) {
        if (!story?.id) continue;
        const lastModified = story.updatedAt
          ? new Date(story.updatedAt)
          : new Date();
        entries.push({
          url: `${BASE}/story/${story.id}`,
          lastModified,
          changeFrequency: "weekly",
          priority: 0.8,
        });
        entries.push({
          url: `${BASE}/story/${story.id}/read`,
          lastModified,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }

      const totalPages = json?.data?.totalPages ?? 1;
      if (page >= totalPages) break;
    }

    return entries;
  } catch {
    return [];
  }
}

async function fetchGenrePages(): Promise<MetadataRoute.Sitemap> {
  try {
    const apiUrl = getServerApiBaseUrl();
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
