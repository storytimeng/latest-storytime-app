"use client";

/**
 * Android override for /category/[slug]
 *
 * The web version is a server component with SSR metadata + JSON-LD breadcrumbs.
 * For the Android static export we swap to a pure client component – metadata
 * and structured-data are web-only concerns; the native app handles titles
 * through its own navigation layer.
 *
 * `generateStaticParams` must return at least the known slugs so Next.js can
 * pre-render the shell pages (the actual data is fetched client-side by
 * CategoryView).
 */

import CategoryView from "@/views/app/home/category/categoryView";
import { useParams } from "next/navigation";

const KNOWN_SLUGS = [
  "recently-added",
  "trending",
  "popular",
  "only-on-storytime",
];

export function generateStaticParams() {
  return KNOWN_SLUGS.map((slug) => ({ slug }));
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const raw = decodeURIComponent(slug ?? "");
  return <CategoryView categorySlug={raw} />;
}
