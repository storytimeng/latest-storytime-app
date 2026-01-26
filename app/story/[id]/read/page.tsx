import { Metadata } from "next";
import { Suspense, lazy } from "react";
import { Skeleton } from "@heroui/skeleton";
import {
  storiesControllerFindOne,
  storiesControllerGetChapterById,
  storiesControllerGetEpisodeById,
} from "@/src/client/sdk.gen";

// Lazy load ReadStoryView for code splitting
const ReadStoryView = lazy(() =>
  import("@/views/app/story/readStoryView").then((mod) => ({
    default: mod.ReadStoryView,
  }))
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
    const response = await storiesControllerFindOne({
      path: { id },
    });

    if (!response.error && response.data) {
      const story = response.data as any;
      let displayTitle = story.title || "Story";
      const description =
        story.description || "Read this amazing story on Storytime";
      const imageUrl =
        story.imageUrl || story.coverImage || "/images/storytime-fallback.png";
      const authorName = story.author?.penName || "Unknown Author";

      // If viewing a specific chapter, try to fetch its title/number
      if (chapterId && typeof chapterId === "string") {
        try {
          const chapterResponse = await storiesControllerGetChapterById({
            path: { chapterId },
          });
          if (!chapterResponse.error && chapterResponse.data) {
            const chapter = chapterResponse.data as any;
            displayTitle = `${story.title}: Chapter ${chapter.chapterNumber}${chapter.title ? ` - ${chapter.title}` : ""}`;
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
            const episode = episodeResponse.data as any;
            displayTitle = `${story.title}: Episode ${episode.episodeNumber}${episode.title ? ` - ${episode.title}` : ""}`;
          }
        } catch (e) {
          console.error("Error fetching episode metadata:", e);
        }
      }

      const fullTitle = `${displayTitle} - ${authorName} | Storytime`;

      return {
        title: fullTitle,
        description: description.slice(0, 160),
        openGraph: {
          title: displayTitle,
          description: description.slice(0, 160),
          images: [
            {
              url: imageUrl,
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
          description: description.slice(0, 160),
          images: [imageUrl],
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
