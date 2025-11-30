import CategoryView from "@/views/app/home/category/categoryView";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <CategoryView categorySlug={slug} />;
}
