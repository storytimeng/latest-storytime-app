"use client";

import { WifiOff } from "lucide-react";
import PageHeader from "@/components/reusables/customUI/pageHeader";

interface StoryOfflineEmptyStateProps {
  /**
   * Where the back button should take the user when they dismiss this
   * state. Read mode and details mode want different landing spots,
   * so callers have to opt in explicitly.
   */
  backLink: string;
  /**
   * Optional override of the headline copy. The default covers the
   * common case: server is unreachable AND the story isn't on the
   * device. Callers can pass a shorter copy if they only need to
   * cover the "no record at all" branch.
   */
  title?: string;
  /** Optional override of the secondary line of helper text. */
  hint?: string;
}

/**
 * Shared "the network is dead and the story isn't downloaded" panel.
 *
 * Both the SingleStory details view and the ReadStoryView used to
 * render slightly different placeholder text for the same situation
 * (SingleStory had the friendly WifiOff state; ReadStoryView just
 * printed "Story not found"). Centralising it here means there's
 * exactly one copy to update, and a user who navigates from a
 * downloaded story's read view to an un-downloaded one sees the
 * same UI on both surfaces.
 */
export function StoryOfflineEmptyState({
  backLink,
  title,
  hint,
}: StoryOfflineEmptyStateProps) {
  return (
    <div className="min-h-screen bg-accent-shade-1">
      <PageHeader backLink={backLink} showBackButton />
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-20">
        <WifiOff size={32} className="text-primary/30" />
        <p className="text-center text-primary">
          {title ??
            "Couldn't reach the server, and this story isn't downloaded yet."}
        </p>
        <p className="text-center text-sm text-primary/50">
          {hint ??
            "Download stories for offline reading so they're always available."}
        </p>
      </div>
    </div>
  );
}
