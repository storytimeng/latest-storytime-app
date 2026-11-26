import type { Metadata } from "next";
import CategoryView from "@/views/app/home/category/categoryView";
import { APP_CONFIG } from "@/config/app";
import { IS_ANDROID } from "@/lib/platform";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (IS_ANDROID) return { title: "Storytime" };
  const { slug } = await params;
  const raw = decodeURIComponent(slug ?? "");
  const label = raw
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const url = `${APP_CONFIG.url}/category/${encodeURIComponent(raw)}`;
  const description = `Explore ${label} stories on Storytime — read original African fiction, romance, sci-fi, and serialized stories.`;

  return {
    title: `${label} Stories`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${label} Stories | ${APP_CONFIG.name}`,
      description,
      url,
      siteName: APP_CONFIG.name,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const raw = decodeURIComponent(slug ?? "");
  return <CategoryView categorySlug={raw} />;
}
