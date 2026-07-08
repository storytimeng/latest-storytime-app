import { CategoryView } from "@/views";

export function generateStaticParams() {
  // Return a dummy param so Next.js doesn't fail the static export.
  return [{ id: "index" }];
}

type Props = { params: Promise<{ id: string }> };

export default async function GenrePage({ params }: Props) {
  const { id } = await params;
  const raw = decodeURIComponent(id ?? "");
  return <CategoryView categorySlug={raw} type="genre" />;
}
