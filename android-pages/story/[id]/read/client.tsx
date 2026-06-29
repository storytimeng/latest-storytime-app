"use client";

import { useSearchParams } from "next/navigation";
import { ReadStoryView } from "@/views/app/story/readStoryView";

export default function ReadStoryClient({ storyId }: { storyId: string }) {
  const searchParams = useSearchParams();
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
