import { Metadata } from "next";
import StoryPageClient from "./StoryPageClient";
import { generateStoryMetadata } from "@/lib/metadata/storyMetadata";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return generateStoryMetadata(id);
}

export default async function DesktopStoryPage({ params }: Props) {
  const { id } = await params;
  return <StoryPageClient id={id} />;
}
