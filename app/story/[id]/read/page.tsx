"use client";

import { useParams } from "next/navigation";
import { ReadStoryView } from "@/views/app/story/readStoryView";

export default function ReadStoryPage() {
  const params = useParams();
  const id = params.id as string;

  return <ReadStoryView storyId={id} />;
}
