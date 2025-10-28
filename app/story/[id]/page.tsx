"use client";

import { useParams } from "next/navigation";
import SingleStory from "@/view/story/singleStory";

export default function StoryPage() {
  const params = useParams();
  const id = params.id as string;

  return <SingleStory storyId={id} />;
}
