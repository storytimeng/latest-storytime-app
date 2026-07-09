import { Suspense } from "react";
import { Skeleton } from "@heroui/skeleton";
import ReadStoryClient from "./client";

export function generateStaticParams() {
  return [{ id: "index" }];
}

type Props = { params: Promise<{ id: string }> };

export default async function ReadStoryPage({ params }: Props) {
  const { id } = await params;
  
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-accent-shade-1 p-4 space-y-4">
          <Skeleton className="w-full h-12 rounded-lg" />
          <Skeleton className="w-full h-96 rounded-lg" />
        </div>
      }
    >
      <ReadStoryClient storyId={id} />
    </Suspense>
  );
}
