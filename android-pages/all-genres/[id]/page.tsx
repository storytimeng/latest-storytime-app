"use client";

/**
 * Android override for /all-genres/[id]
 *
 * The web version is a server component with SSR metadata + JSON-LD breadcrumbs.
 * For the Android static export we use a client component. Genre IDs are
 * user-driven so generateStaticParams returns [] – the shell is pre-rendered
 * and data is fetched client-side by CategoryView.
 */

import { CategoryView } from "@/views";
import { useParams } from "next/navigation";

export function generateStaticParams() {
  // No genres are known at build time; the app fetches them at runtime.
  return [];
}

export default function GenrePage() {
  const { id } = useParams<{ id: string }>();
  const raw = decodeURIComponent(id ?? "");
  return <CategoryView categorySlug={raw} type="genre" />;
}
