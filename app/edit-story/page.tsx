/**
 * Static /edit-story page (Capacitor + Serwist-friendly).
 *
 * The web build keeps `/edit-story/[id]` as a server component route.
 * This page mirrors it but reads the id from a query parameter so the
 * static export produces ONE `edit-story.html` regardless of how many
 * stories exist, which is the only way `output: "export"` + Capacitor
 * can resolve navigation reliably inside the WebView.
 */

import { Suspense } from "react";
import { Skeleton } from "@heroui/skeleton";
import EditStoryClient from "./client";

export const metadata = {
  title: "Edit Story | Storytime",
  description: "Edit your story on Storytime.",
};

export default function EditStoryIndexPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-accent-shade-1 p-4 space-y-4">
          <Skeleton className="w-full h-12 rounded-lg" />
          <Skeleton className="w-full h-64 rounded-lg" />
        </div>
      }
    >
      <EditStoryClient />
    </Suspense>
  );
}
