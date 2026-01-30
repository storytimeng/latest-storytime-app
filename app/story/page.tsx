import { Metadata } from "next";
import { Suspense, lazy } from "react";
import { Skeleton } from "@heroui/skeleton";
import { generateStoryMetadata } from "@/lib/metadata/storyMetadata";

// Lazy load ReadStoryView for code splitting
const ReadStoryView = lazy(() =>
  import("@/views/app/story/readStoryView").then((mod) => ({
    default: mod.ReadStoryView,
  })),
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

  if (!id) {
    return {
      title: "Story | Storytime",
      description: "Read amazing stories on Storytime",
    };
  }

  return generateStoryMetadata(id, chapterId, episodeId);
}

export default async function StoryPage({ searchParams }: Props) {
  const sParams = await searchParams;
  const id = sParams.id as string | undefined;

  if (!id) {
    // Optionally redirect to home or show an error
    // For now, let's show a friendly message or skeleton
    return (
        <div className="flex items-center justify-center min-h-screen bg-accent-shade-1">
          <p className="text-primary">
            Please select a story to read.
          </p>
        </div>
    );
  }

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
