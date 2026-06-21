"use client";

import { Suspense, lazy } from "react";
import { Skeleton } from "@heroui/skeleton";

const DesktopStoryDetailView = lazy(() =>
  import("@/views/desktop/DesktopStoryDetailView").then((mod) => ({
    default: mod.DesktopStoryDetailView,
  })),
);

type StoryPageClientProps = {
  id: string;
};

export default function StoryPageClient({ id }: StoryPageClientProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-4">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      }
    >
      <DesktopStoryDetailView storyId={id} />
    </Suspense>
  );
}
