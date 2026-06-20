"use client";

import { CheckCircle2, Clock, FilePen } from "lucide-react";
import { cn } from "@/lib/utils";

export type StoryStatusKind = "ongoing" | "completed" | "draft" | "unknown";

export function normalizeStoryStatus(
  status: string | undefined,
): StoryStatusKind {
  if (!status) return "unknown";

  switch (status.toLowerCase()) {
    case "complete":
    case "completed":
      return "completed";
    case "ongoing":
      return "ongoing";
    case "draft":
    case "drafts":
      return "draft";
    default:
      return "unknown";
  }
}

const STATUS_CONFIG: Record<
  StoryStatusKind,
  {
    label: string;
    icon: typeof Clock;
    className: string;
  }
> = {
  ongoing: {
    label: "Ongoing",
    icon: Clock,
    className: "text-orange-600",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "text-green-600",
  },
  draft: {
    label: "Draft",
    icon: FilePen,
    className: "text-red-500",
  },
  unknown: {
    label: "Unknown",
    icon: Clock,
    className: "text-gray-500",
  },
};

interface StoryStatusIconProps {
  status: string | undefined;
  className?: string;
  iconClassName?: string;
}

export function StoryStatusIcon({
  status,
  className,
  iconClassName,
}: StoryStatusIconProps) {
  const kind = normalizeStoryStatus(status);
  const config = STATUS_CONFIG[kind];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        className,
      )}
      title={config.label}
      aria-label={config.label}
      role="img"
    >
      <Icon
        className={cn("h-3.5 w-3.5", config.className, iconClassName)}
        aria-hidden
      />
    </span>
  );
}
