/**
 * Android override for /edit-story/[id]
 *
 * The web version is `"use client"` which prevents co-located
 * `generateStaticParams`. This wrapper is a server component shell that
 * exports `generateStaticParams` (empty – IDs are runtime values) and
 * re-exports the client component as the default page.
 *
 * Next.js requires `generateStaticParams` to live in a server component, so
 * we can't add it to the original file directly.
 */

import { EditStoryView } from "@/views";

export function generateStaticParams() {
  return [];
}

export default function EditStoryPage() {
  return <EditStoryView />;
}
