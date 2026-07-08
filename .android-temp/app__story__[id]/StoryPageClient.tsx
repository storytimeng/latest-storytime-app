"use client";

import { Suspense, lazy } from "react";
import { Skeleton } from "@heroui/skeleton";

// Lazy load SingleStory for code splitting
const SingleStory = lazy(() =>
  import("@/views").then((mod) => ({ default: mod.SingleStory })),
);

type Props = {
  id: string;
};

export default function StoryPageClient({ id }: Props) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-accent-shade-1 p-4 space-y-4">
          <Skeleton className="w-full h-64 rounded-lg" />
          <Skeleton className="w-full h-32 rounded-lg" />
          <Skeleton className="w-3/4 h-8 rounded-lg" />
        </div>
      }
    >
      <SingleStory storyId={id} />
    </Suspense>
  );
}
