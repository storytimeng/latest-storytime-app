// components/reusables/OfflineAwareStoryCard.tsx
"use client";
import { StoryCard } from "@/components/reusables";
import { useOfflineCoverImage } from "@/src/hooks/useOfflineCoverImage";

interface Props {
  story: any;
  hideStats?: boolean;
  isOffline?: boolean;
}

export function OfflineAwareStoryCard({ story, hideStats, isOffline }: Props) {
  // Only bother resolving the blob when we're actually offline and a
  // blob exists — otherwise just pass the remote URL straight through,
  // same as before, no behavior change for the common case.
  const resolvedSrc = useOfflineCoverImage(
    isOffline ? story.coverImageBlob : undefined,
    story.imageUrl,
  );

  return (
    <StoryCard
      story={{ ...story, imageUrl: resolvedSrc, coverImage: resolvedSrc }}
      hideStats={hideStats}
    />
  );
}
