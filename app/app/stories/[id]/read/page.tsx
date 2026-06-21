import { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@heroui/skeleton";
import { DesktopReadStoryView } from "@/views/desktop/DesktopReadStoryView";
import { generateStoryMetadata } from "@/lib/metadata/storyMetadata";

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
  const chapterId = sParams.chapterId as string | undefined;
  const episodeId = sParams.episodeId as string | undefined;

  return generateStoryMetadata(id, chapterId, episodeId);
}

export default async function DesktopReadStoryPage({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] gap-6">
          <Skeleton className="hidden h-full w-72 shrink-0 rounded-lg lg:block" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      }
    >
      <DesktopReadStoryView storyId={id} />
    </Suspense>
  );
}
