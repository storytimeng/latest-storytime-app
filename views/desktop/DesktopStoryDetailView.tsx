"use client";

import { Suspense, lazy } from "react";
import { Skeleton } from "@heroui/skeleton";

const SingleStory = lazy(() =>
  import("@/views/app/story/singleStory").then((mod) => ({
    default: mod.default,
  })),
);

type DesktopStoryDetailViewProps = {
  storyId: string;
};

export function DesktopStoryDetailView({
  storyId,
}: DesktopStoryDetailViewProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-4">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-8 w-3/4 rounded-lg" />
        </div>
      }
    >
      <SingleStory storyId={storyId} shell="desktop" />
    </Suspense>
  );
}
