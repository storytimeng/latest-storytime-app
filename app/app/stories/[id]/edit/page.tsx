import { DesktopEditStoryView } from "@/views/desktop";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DesktopEditStoryPage({ params }: Props) {
  const { id } = await params;
  return <DesktopEditStoryView storyId={id} />;
}
