import { Metadata } from "next";
import StoryPageClient from "./StoryPageClient";
import { generateStoryMetadata, buildStoryJsonLd } from "@/lib/metadata/storyMetadata";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return generateStoryMetadata(id);
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const jsonLd = await buildStoryJsonLd(id);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <StoryPageClient id={id} />
    </>
  );
}

export function generateStaticParams() {
  return [];
}
