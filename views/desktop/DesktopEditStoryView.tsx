"use client";

import StoryView from "@/components/reusables/storyView";

type DesktopEditStoryViewProps = {
  storyId: string;
};

export function DesktopEditStoryView({ storyId }: DesktopEditStoryViewProps) {
  return <StoryView mode="edit" storyId={storyId} shell="desktop" />;
}
