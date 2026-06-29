import StoryPageClient from "@/app/story/[id]/StoryPageClient";

export function generateStaticParams() {
  return [{ id: "index" }];
}

type Props = { params: Promise<{ id: string }> };

export default async function StoryPage({ params }: Props) {
  const { id } = await params;
  return <StoryPageClient id={id ?? ""} />;
}
