import { Metadata } from "next";
import {
  storiesControllerFindOne,
  storiesControllerGetChapterById,
  storiesControllerGetEpisodeById,
} from "@/src/client/sdk.gen";
import { client } from "@/src/client/client.gen";
import { APP_CONFIG } from "@/config/app";

const SITE_URL = APP_CONFIG.url;

// Helper function to strip HTML tags and truncate
const stripHtmlAndTruncate = (
  html: string,
  maxLength: number = 155,
): string => {
  if (!html) return "";

  // Remove HTML tags
  const stripped = html.replace(/<[^>]*>/g, "");

  // Decode HTML entities
  const decoded = stripped
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Trim and truncate
  const trimmed = decoded.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.substring(0, maxLength).trim() + "...";
};

// Helper function to fetch chapter/episode metadata
const fetchContentMetadata = async (
  id: string,
  type: "chapter" | "episode",
) => {
  try {
    const response =
      type === "chapter"
        ? await storiesControllerGetChapterById({ path: { chapterId: id } })
        : await storiesControllerGetEpisodeById({ path: { episodeId: id } });

    if (!response.error && response.data) {
      const data = response.data as any;
      const content = data?.data || data;
      return {
        number: content.episodeNumber || content.chapterNumber || "",
        title: content.title?.trim(),
        content: content.content,
      };
    }
  } catch (e) {
    console.error(`Error fetching ${type} metadata:`, e);
  }
  return null;
};

export async function generateStoryMetadata(
  id: string,
  chapterId?: string,
  episodeId?: string
): Promise<Metadata> {
  if (!id) {
    return {
      title: "Story",
      description: APP_CONFIG.shortDescription,
    };
  }

  try {
    // Configure client for server-side rendering (bypass proxy, use direct API URL)
    client.setConfig({
      baseUrl: process.env.NEXT_PUBLIC_API_URL || `https://api.${APP_CONFIG.domain}`,
    });

    const response = await storiesControllerFindOne({
      path: { id },
    });

    if (!response.error && response.data) {
      const data = response?.data as any;
      const story = data?.data as any;
      let displayTitle = story.title || "Story";
      let description =
        story.description || "Read this amazing story on Storytime";
      const imageUrl =
        story.imageUrl || story.coverImage || "/images/storytime-fallback.png";
      const authorName = story.author?.penName || "Anonymous";

      // Fetch chapter or episode metadata if viewing specific content
      if (chapterId) {
        const contentData = await fetchContentMetadata(chapterId, "chapter");
        if (contentData) {
          if (contentData.content) {
            description = stripHtmlAndTruncate(contentData.content);
          }
          displayTitle = contentData.title
            ? `${story.title} - "Chapter ${contentData.number}: ${contentData.title}"`
            : `${story.title} - Chapter ${contentData.number}`;
        }
      } else if (episodeId) {
        const contentData = await fetchContentMetadata(episodeId, "episode");
        if (contentData) {
          if (contentData.content) {
            description = stripHtmlAndTruncate(contentData.content);
          }
          displayTitle = contentData.title
            ? `${story.title} - "Episode ${contentData.number}: ${contentData.title}"`
            : `${story.title} - Episode ${contentData.number}`;
        }
      }

      const fullTitle = `${displayTitle} - ${authorName} | Storytime`;

      // Ensure absolute URLs for images
      const absoluteImageUrl = imageUrl.startsWith("http")
        ? imageUrl
        : `${SITE_URL}${imageUrl}`;
      let storyUrl = `${SITE_URL}/story/${id}/read`;
      if (chapterId) {
        storyUrl += `?chapterId=${chapterId}`;
      } else if (episodeId) {
        storyUrl += `?episodeId=${episodeId}`;
      }

      return {
        title: fullTitle,
        description: description,
        alternates: { canonical: storyUrl },
        openGraph: {
          title: displayTitle,
          description: description,
          url: storyUrl,
          siteName: APP_CONFIG.name,
          images: [
            {
              url: absoluteImageUrl,
              width: 1200,
              height: 630,
              alt: displayTitle,
            },
          ],
          type: "article",
        },
        twitter: {
          card: "summary_large_image",
          title: displayTitle,
          description: description,
          images: [absoluteImageUrl],
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "Read Story",
    description: APP_CONFIG.shortDescription,
  };
}

/** Build an Article JSON-LD object for a story page. Returns null on error. */
export async function buildStoryJsonLd(id: string): Promise<object | null> {
  try {
    client.setConfig({
      baseUrl: process.env.NEXT_PUBLIC_API_URL || `https://api.${APP_CONFIG.domain}`,
    });

    const response = await storiesControllerFindOne({ path: { id } });
    if (response.error || !response.data) return null;

    const data = (response.data as any)?.data ?? response.data;
    const authorName = data.author?.penName || "Anonymous";
    const imageUrl = data.imageUrl || data.coverImage;
    const absoluteImage = imageUrl?.startsWith("http")
      ? imageUrl
      : imageUrl
      ? `${SITE_URL}${imageUrl}`
      : `${SITE_URL}${APP_CONFIG.images.banner}`;
    const genres: string[] = (data.genres || []).map((g: any) =>
      typeof g === "string" ? g : g.name || g
    );

    return {
      "@context": "https://schema.org",
      "@type": "Book",
      name: data.title,
      description: stripHtmlAndTruncate(data.description || "", 200),
      url: `${SITE_URL}/story/${id}`,
      image: absoluteImage,
      author: {
        "@type": "Person",
        name: authorName,
      },
      publisher: {
        "@type": "Organization",
        name: APP_CONFIG.name,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}${APP_CONFIG.images.logo}`,
        },
      },
      inLanguage: data.language || "en",
      genre: genres,
      datePublished: data.createdAt,
      dateModified: data.updatedAt || data.createdAt,
      ...(data.storyStatus === "complete" && { bookFormat: "EBook" }),
    };
  } catch {
    return null;
  }
}
