"use client";

import { useParams } from "next/navigation";
import { SingleStory } from "@/views";

export default function StoryPage() {
  const params = useParams();
  const id = params.id as string;

  return <SingleStory storyId={id} />;
}
