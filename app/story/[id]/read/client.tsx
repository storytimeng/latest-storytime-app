"use client";

import { ReadStoryView } from "@/views/app/story/readStoryView";

export default function ReadStoryClient({ storyId }: { storyId: string }) {
  return <ReadStoryView storyId={storyId} />;
}
