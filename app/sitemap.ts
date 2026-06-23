import { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/app";

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
    url: `${BASE}/library`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.9,
  },
  {
    url: `${BASE}/search`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
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
];

async function fetchPublishedStories(): Promise<MetadataRoute.Sitemap> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || `https://api.${APP_CONFIG.domain}`;
    const res = await fetch(
      `${apiUrl}/stories?page=1&limit=200&status=published`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) return [];

    const json = await res.json();
    const stories: Array<{ id: string; updatedAt?: string }> =
      json?.data?.items || json?.data || [];

    return stories.map((story) => ({
      url: `${BASE}/story/${story.id}`,
      lastModified: story.updatedAt ? new Date(story.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicRoutes = await fetchPublishedStories();
  return [...staticRoutes, ...dynamicRoutes];
}
