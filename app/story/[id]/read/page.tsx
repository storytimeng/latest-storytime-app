"use client";

import { useParams } from "next/navigation";
import { StoryPremium } from "@/components/StoryPremium/StoryPremium";

export default function ReadStoryPage() {
  const params = useParams();
  const id = params.id as string;

  return <StoryPremium />;   
}
