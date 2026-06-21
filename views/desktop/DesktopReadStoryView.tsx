"use client";

import { Suspense, lazy } from "react";
import { Skeleton } from "@heroui/skeleton";

const ReadStoryView = lazy(() =>
  import("@/views/app/story/readStoryView").then((mod) => ({
    default: mod.ReadStoryView,
  })),
);

type DesktopReadStoryViewProps = {
  storyId: string;
};

export function DesktopReadStoryView({ storyId }: DesktopReadStoryViewProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] gap-6">
          <Skeleton className="hidden h-full w-72 shrink-0 rounded-lg lg:block" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      }
    >
      <ReadStoryView storyId={storyId} shell="desktop" />
    </Suspense>
  );
}
