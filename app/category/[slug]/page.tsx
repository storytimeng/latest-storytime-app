import { Metadata } from "next";
import CategoryView from "@/views/app/home/category/categoryView";
import { APP_CONFIG } from "@/config/app";

type Props = { params: Promise<{ slug: string }> };

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  "recently-added": {
    title: "Recently Added Stories",
    description: "Explore the newest stories added to Storytime. Fresh fiction from talented authors — updated daily.",
  },
  trending: {
    title: "Trending Stories on Storytime",
    description: "The hottest stories everyone is reading right now. Discover what's trending on Storytime today.",
  },
  popular: {
    title: "Popular Stories This Week",
    description: "Storytime's most-loved stories of the week. Highly rated fiction across all genres.",
  },
  "only-on-storytime": {
    title: "Only on Storytime — Exclusive Stories",
    description: "Stories you can only find on Storytime. Original, exclusive fiction from our community of authors.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const raw = decodeURIComponent(slug);

  const known = CATEGORY_META[raw];
  const isGenre = !known;

  const genreName = isGenre
    ? raw.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : null;

  const title = known?.title ?? `${genreName} Stories`;
  const description =
    known?.description ??
    `Discover the best ${genreName!.toLowerCase()} stories on Storytime. Read and explore ${genreName!.toLowerCase()} fiction from talented authors.`;
  const url = `${APP_CONFIG.url}/category/${encodeURIComponent(raw)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: APP_CONFIG.name,
      images: [{ url: `${APP_CONFIG.url}${APP_CONFIG.images.banner}`, width: 1200, height: 630, alt: title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${APP_CONFIG.url}${APP_CONFIG.images.banner}`],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  return <CategoryView categorySlug={decodeURIComponent(slug)} />;
}
