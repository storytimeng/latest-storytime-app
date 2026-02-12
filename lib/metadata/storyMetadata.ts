import { Metadata } from "next";
import {
  storiesControllerFindOne,
  storiesControllerGetChapterById,
  storiesControllerGetEpisodeById,
} from "@/src/client/sdk.gen";
import { client } from "@/src/client/client.gen";

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
      title: "Story | Storytime",
      description: "Read amazing stories on Storytime",
    };
  }

  try {
    // Configure client for server-side rendering (bypass proxy, use direct API URL)
    client.setConfig({
      baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.storytime.ng",
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
        : `https://storytime.ng${imageUrl}`;   
      let storyUrl = `https://storytime.ng/story/${id}/read`;
      if (chapterId) {
        storyUrl += `?chapterId=${chapterId}`;
      } else if (episodeId) {
        storyUrl += `?episodeId=${episodeId}`;
      }

      return {
        title: fullTitle,
        description: description,
        openGraph: {
          title: displayTitle,
          description: description,
          url: storyUrl,
          siteName: "Storytime",
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
    title: "Read Story | Storytime",
    description: "Read amazing stories on Storytime",
  };
}
