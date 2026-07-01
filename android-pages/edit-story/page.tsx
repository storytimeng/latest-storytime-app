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

import { Suspense } from "react";
import EditStoryClient from "./[id]/client";

export function generateStaticParams() {
  return [{ id: "index" }];
}

export default function EditStoryPage() {
  return (
    <Suspense fallback={null}>
      <EditStoryClient />
    </Suspense>
  );
}
