import { Metadata } from "next";
import StoryPageClient from "./StoryPageClient";
import { storiesControllerFindOne } from "@/src/client/sdk.gen";
import { client } from "@/src/client/client.gen";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    // Configure client for server-side rendering (bypass proxy, use direct API URL)
    client.setConfig({
      baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.storytime.ng",
    });

    const response = await storiesControllerFindOne({
      path: { id },
    });

    if (!response.error && response.data) {
      const story = response.data as any;
      const title = story.title || "Story";
      const description =
        story.description || "Read this amazing story on Storytime";
      const imageUrl =
        story.imageUrl || story.coverImage || "/images/storytime-fallback.png";
      const authorName = story.author?.penName || "Unknown Author";

      // Ensure absolute URLs for images
      const absoluteImageUrl = imageUrl.startsWith("http")
        ? imageUrl
        : `https://storytime.ng${imageUrl}`;

      const storyUrl = `https://storytime.ng/story/${id}`;

      return {
        title: `${title} - ${authorName} | Storytime`,
        description: description.slice(0, 160),
        openGraph: {
          title,
          description: description.slice(0, 160),
          url: storyUrl,
          siteName: "Storytime",
          images: [
            {
              url: absoluteImageUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
          type: "article",
        },
        twitter: {
          card: "summary_large_image",
          title,
          description: description.slice(0, 160),
          images: [absoluteImageUrl],
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "Story | Storytime",
    description: "Read amazing stories on Storytime",
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <StoryPageClient id={id} />;
}
