import type { Metadata } from "next";
import StoryPageClient from "@/app/story/[id]/StoryPageClient";
import {
  buildStoryJsonLd,
  buildStoryMetadata,
  fetchPublicStoryForSeo,
} from "@/lib/seo/storyMetadata";

export function generateStaticParams() {
  return [{ id: "index" }];
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return buildStoryMetadata(id ?? "");
}

export default async function StoryPage({ params }: Props) {
  const { id } = await params;
  const story = await fetchPublicStoryForSeo(id ?? "");

  return (
    <>
      {story && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildStoryJsonLd(story)),
          }}
        />
      )}
      <StoryPageClient id={id ?? ""} />
    </>
  );
}
