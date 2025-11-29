import CategoryView from "@/views/app/home/category/categoryView";

export default function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  return <CategoryView />;
}
