import { DesktopCategoryView } from "@/views/desktop";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function DesktopCategoryPage({ params }: Props) {
  const { slug } = await params;
  return <DesktopCategoryView categorySlug={slug} />;
}
