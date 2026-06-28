"use client";

/**
 * Android override for /story/[id]
 *
 * The web version fetches story metadata server-side and embeds JSON-LD.
 * For the Android static export we swap to a client component – metadata is
 * not useful in a Capacitor WebView and the story data is fetched by
 * StoryPageClient at runtime anyway.
 */

import StoryPageClient from "@/app/story/[id]/StoryPageClient";
import { useParams } from "next/navigation";

export function generateStaticParams() {
  // Story IDs are runtime values – pre-render the empty shell only.
  return [];
}

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  return <StoryPageClient id={id ?? ""} />;
}
