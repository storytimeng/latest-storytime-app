import { Metadata } from "next";
import { Suspense, lazy } from "react";
import { Skeleton } from "@heroui/skeleton";
import {
  storiesControllerFindOne,
  storiesControllerGetChapterById,
  storiesControllerGetEpisodeById,
} from "@/src/client/sdk.gen";
import { client } from "@/src/client/client.gen";

// Lazy load ReadStoryView for code splitting
const ReadStoryView = lazy(() =>
  import("@/views/app/story/readStoryView").then((mod) => ({
    default: mod.ReadStoryView,
  })),
);

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { id } = await params;
  const sParams = await searchParams;
  const chapterId = sParams.chapterId;
  const episodeId = sParams.episodeId;

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

      // If viewing a specific chapter, try to fetch its title/number
      if (chapterId && typeof chapterId === "string") {
        try {
          const chapterResponse = await storiesControllerGetChapterById({
            path: { chapterId },
          });
          if (!chapterResponse.error && chapterResponse.data) {
            const chapterData = chapterResponse.data as any;
            const chapter = chapterData?.data || chapterData;
            const chapterNum =
              chapter.episodeNumber || chapter.chapterNumber || "";
            const chapterTitle = chapter.title?.trim();

            // Use chapter content for description if available
            if (chapter.content) {
              description = stripHtmlAndTruncate(chapter.content);
            }

            if (chapterTitle) {
              displayTitle = `${story.title} - Chapter ${chapterNum}: ${chapterTitle}`;
            } else {
              displayTitle = `${story.title} - Chapter ${chapterNum}`;
            }
          }
        } catch (e) {
          console.error("Error fetching chapter metadata:", e);
        }
      }
      // If viewing a specific episode, try to fetch its title/number
      else if (episodeId && typeof episodeId === "string") {
        try {
          const episodeResponse = await storiesControllerGetEpisodeById({
            path: { episodeId },
          });
          if (!episodeResponse.error && episodeResponse.data) {
            const episodeData = episodeResponse.data as any;
            const episode = episodeData?.data || episodeData;
            const episodeNum = episode.episodeNumber || "";
            const episodeTitle = episode.title?.trim();

            // Use episode content for description if available
            if (episode.content) {
              description = stripHtmlAndTruncate(episode.content);
            }

            if (episodeTitle) {
              displayTitle = `${story.title} - Episode ${episodeNum}: ${episodeTitle}`;
            } else {
              displayTitle = `${story.title} - Episode ${episodeNum}`;
            }
          }
        } catch (e) {
          console.error("Error fetching episode metadata:", e);
        }
      }

      const fullTitle = `${displayTitle} - ${authorName} | Storytime`;

      // Ensure absolute URLs for images
      const absoluteImageUrl = imageUrl.startsWith("http")
        ? imageUrl
        : `https://storytime.ng${imageUrl}`;

      // Build the story URL with query params if present
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

export default async function ReadStoryPage({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-accent-shade-1 p-4 space-y-4">
          <Skeleton className="w-full h-12 rounded-lg" />
          <Skeleton className="w-full h-96 rounded-lg" />
        </div>
      }
    >
      <ReadStoryView storyId={id} />
    </Suspense>
  );
}
