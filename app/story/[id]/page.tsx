import { Metadata } from "next";
import StoryPageClient from "./StoryPageClient";


type Props = {
  params: Promise<{ id: string }>;
};

import { generateStoryMetadata } from "@/lib/metadata/storyMetadata";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return generateStoryMetadata(id);
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <StoryPageClient id={id} />;
}
