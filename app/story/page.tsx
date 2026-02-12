import { Metadata } from "next";
import { Suspense, lazy } from "react";
import { Skeleton } from "@heroui/skeleton";
import { generateStoryMetadata } from "@/lib/metadata/storyMetadata";

// Lazy load ReadStoryView
const ReadStoryView = lazy(() =>
  import("@/views/app/story/readStoryView").then((mod) => ({
    default: mod.ReadStoryView,
  })),
);

// Lazy load SingleStory (Details View)
const SingleStory = lazy(() =>
  import("@/views").then((mod) => ({ default: mod.SingleStory })),
);

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const sParams = await searchParams;
  const id = sParams.id as string | undefined;
  const chapterId = sParams.chapterId as string | undefined;
  const episodeId = sParams.episodeId as string | undefined;

  // efficient metadata generation using the shared utility
  return generateStoryMetadata(id || "", chapterId, episodeId);
}

export default async function StoryPage({ searchParams }: Props) {
  const sParams = await searchParams;
  const id = sParams.id as string | undefined;
  const mode = sParams.mode as string | undefined;

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-accent-shade-1">
        <p className="text-primary">Please select a story to view.</p>
      </div>
    );
  }

  // Render Reader Mode if mode=read
  if (mode === "read") {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen p-4 space-y-4 bg-accent-shade-1">
            <Skeleton className="w-full h-12 rounded-lg" />
            <Skeleton className="w-full rounded-lg h-96" />
          </div>
        }
      >

        <ReadStoryView storyId={id} />
      </Suspense>
    );
  }

  // Default: Render Story Details
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-4 space-y-4 bg-accent-shade-1">
          <Skeleton className="w-full h-64 rounded-lg" />
          <Skeleton className="w-full h-32 rounded-lg" />
          <Skeleton className="w-3/4 h-8 rounded-lg" />
        </div>
      }
    >
      <SingleStory storyId={id} />
    </Suspense>
  );
}
