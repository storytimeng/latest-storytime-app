import CategoryView from "@/views/app/home/category/categoryView";

const KNOWN_SLUGS = [
  "recently-added",
  "trending",
  "popular",
  "only-on-storytime",
];

export function generateStaticParams() {
  return KNOWN_SLUGS.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const raw = decodeURIComponent(slug ?? "");
  return <CategoryView categorySlug={raw} />;
}
