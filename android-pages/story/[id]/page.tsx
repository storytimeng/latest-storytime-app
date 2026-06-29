import StoryPageClient from "@/app/story/[id]/StoryPageClient";

export function generateStaticParams() {
  // Story IDs are runtime values – pre-render the empty shell only.
  return [];
}

type Props = { params: Promise<{ id: string }> };

export default async function StoryPage({ params }: Props) {
  const { id } = await params;
  return <StoryPageClient id={id ?? ""} />;
}
