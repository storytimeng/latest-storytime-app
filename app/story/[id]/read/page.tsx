import { Metadata } from "next";
import { Suspense, lazy } from "react";
import { Skeleton } from "@heroui/skeleton";


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

import { generateStoryMetadata } from "@/lib/metadata/storyMetadata";

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { id } = await params;
  const sParams = await searchParams;
  const chapterId = sParams.chapterId as string | undefined;
  const episodeId = sParams.episodeId as string | undefined;

  return generateStoryMetadata(id, chapterId, episodeId);
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
