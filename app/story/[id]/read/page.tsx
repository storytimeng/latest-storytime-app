"use client";

import { useParams } from "next/navigation";
import { Suspense, lazy } from "react";
import { Skeleton } from "@heroui/skeleton";

// Lazy load ReadStoryView for code splitting
const ReadStoryView = lazy(() =>
  import("@/views/app/story/readStoryView").then((mod) => ({
    default: mod.ReadStoryView,
  }))
);

export default function ReadStoryPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-accent-shade-1 p-4 space-y-4">
          <Skeleton className="w-full h-12 rounded-lg" />
          <Skeleton className="w-full h-96 rounded-lg" />
        </div>
      }
    >
      <ReadStoryView storyId={id} />
    </Suspense>
  );
}
