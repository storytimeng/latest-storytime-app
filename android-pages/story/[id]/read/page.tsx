"use client";

/**
 * Android override for /story/[id]/read
 *
 * The web version reads `searchParams` (chapterId / episodeId) server-side
 * to generate per-chapter metadata. For the Android static export we read
 * those params client-side from `useSearchParams` and pass them straight to
 * ReadStoryView – fully compatible with `output: export`.
 */

import { Suspense } from "react";
import { Skeleton } from "@heroui/skeleton";
import { ReadStoryView } from "@/views/app/story/readStoryView";
import { useParams, useSearchParams } from "next/navigation";

export function generateStaticParams() {
  return [];
}

function ReadStoryContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const storyId = id ?? "";
  const chapterId = searchParams.get("chapterId") ?? undefined;
  const episodeId = searchParams.get("episodeId") ?? undefined;

  return (
    <ReadStoryView
      storyId={storyId}
      chapterId={chapterId}
      episodeId={episodeId}
    />
  );
}

export default function ReadStoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-accent-shade-1 p-4 space-y-4">
          <Skeleton className="w-full h-12 rounded-lg" />
          <Skeleton className="w-full h-96 rounded-lg" />
        </div>
      }
    >
      <ReadStoryContent />
    </Suspense>
  );
}
