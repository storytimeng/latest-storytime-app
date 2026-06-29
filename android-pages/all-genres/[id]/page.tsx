import { CategoryView } from "@/views";

export function generateStaticParams() {
  // No genres are known at build time; the app fetches them at runtime.
  return [];
}

type Props = { params: Promise<{ id: string }> };

export default async function GenrePage({ params }: Props) {
  const { id } = await params;
  const raw = decodeURIComponent(id ?? "");
  return <CategoryView categorySlug={raw} type="genre" />;
}
