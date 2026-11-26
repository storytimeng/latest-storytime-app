import type { Metadata } from "next";
import { APP_CONFIG } from "@/config/app";
import { IS_ANDROID } from "@/lib/platform";

export interface SeoStoryData {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string | null;
  genres?: string[];
  language?: string;
  createdAt?: string;
  updatedAt?: string;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  author?: {
    penName?: string;
    firstName?: string;
    lastName?: string;
  } | null;
}

export function getServerApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://back.storytime.ng"
  ).replace(/\/+$/, "");
}

function resolveAbsoluteImageUrl(imageUrl?: string | null): string {
  if (!imageUrl || !imageUrl.trim()) {
    return `${APP_CONFIG.url}${APP_CONFIG.images.banner}`;
  }
  const trimmed = imageUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `${APP_CONFIG.url}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

function getAuthorDisplayName(author?: SeoStoryData["author"]): string {
  if (!author) return "Storytime Author";
  if (author.penName?.trim()) return author.penName.trim();
  const full = [author.firstName, author.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return full || "Storytime Author";
}

function truncateDescription(text?: string, maxLen = 160): string {
  const cleaned = (text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return "Read this captivating story on Storytime — Home to budding authors and curious readers.";
  }
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1).trimEnd()}…`;
}

export async function fetchPublicStoryForSeo(
  id: string,
): Promise<SeoStoryData | null> {
  if (IS_ANDROID || !id || id === "index") return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${getServerApiBaseUrl()}/stories/${id}`, {
      next: { revalidate: 300 },
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (!res.ok) return null;
    const json = await res.json();
    const story = json?.data ?? json;
    if (!story || typeof story !== "object" || !story.title) return null;
    return story as SeoStoryData;
  } catch {
    return null;
  }
}

export async function buildStoryMetadata(
  id: string,
  options?: { isReader?: boolean },
): Promise<Metadata> {
  if (IS_ANDROID) {
    return { title: "Storytime" };
  }

  const story = await fetchPublicStoryForSeo(id);
  const canonicalUrl = `${APP_CONFIG.url}/story/${id}`;
  const pageUrl = options?.isReader ? `${canonicalUrl}/read` : canonicalUrl;

  if (!story || !story.title) {
    return {
      title: options?.isReader ? "Read Story" : "Story",
      description: APP_CONFIG.shortDescription,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: `Story | ${APP_CONFIG.name}`,
        description: APP_CONFIG.shortDescription,
        url: pageUrl,
        siteName: APP_CONFIG.name,
        images: [
          {
            url: `${APP_CONFIG.url}${APP_CONFIG.images.banner}`,
            width: 1200,
            height: 630,
            alt: APP_CONFIG.name,
          },
        ],
        type: "article",
      },
    };
  }

  const authorName = getAuthorDisplayName(story.author);
  const titleText = options?.isReader
    ? `Read ${story.title} by ${authorName}`
    : `${story.title} by ${authorName}`;
  const description = truncateDescription(story.description);
  const ogImage = resolveAbsoluteImageUrl(story.imageUrl);
  const genres = Array.isArray(story.genres) ? story.genres.filter(Boolean) : [];

  return {
    title: titleText,
    description,
    keywords: [
      ...genres,
      story.title,
      authorName,
      "Storytime",
      "read online",
      "African stories",
    ],
    authors: [{ name: authorName }],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${story.title} — by ${authorName} | ${APP_CONFIG.name}`,
      description,
      url: pageUrl,
      siteName: APP_CONFIG.name,
      type: "book",
      authors: [authorName],
      tags: genres,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${story.title} cover`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: APP_CONFIG.socialMeta.twitterSite,
      title: `${story.title} — by ${authorName}`,
      description,
      images: [ogImage],
    },
  };
}

export function buildStoryJsonLd(story: SeoStoryData) {
  const authorName = getAuthorDisplayName(story.author);
  const storyUrl = `${APP_CONFIG.url}/story/${story.id}`;
  const ogImage = resolveAbsoluteImageUrl(story.imageUrl);

  return [
    {
      "@context": "https://schema.org",
      "@type": "Book",
      "@id": storyUrl,
      name: story.title,
      headline: story.title,
      description: truncateDescription(story.description, 300),
      url: storyUrl,
      image: ogImage,
      inLanguage: story.language || "en",
      genre: story.genres || [],
      datePublished: story.createdAt,
      dateModified: story.updatedAt || story.createdAt,
      author: {
        "@type": "Person",
        name: authorName,
      },
      publisher: {
        "@type": "Organization",
        name: APP_CONFIG.name,
        url: APP_CONFIG.url,
      },
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/LikeAction",
          userInteractionCount: story.likeCount ?? 0,
        },
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/CommentAction",
          userInteractionCount: story.commentCount ?? 0,
        },
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/ReadAction",
          userInteractionCount: story.viewCount ?? 0,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${APP_CONFIG.url}/home`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: story.title || "Story",
          item: storyUrl,
        },
      ],
    },
  ];
}
