"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { cn } from "@/lib";
import {
  Magnetik_Bold,
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import {
  formatLeaderboardPoints,
  formatLeaderboardResetDate,
  getLeaderboardDisplayName,
  LEADERBOARD_SCOPE_OPTIONS,
  type AmbassadorLeaderboardEntry,
  type LeaderboardScope,
} from "@/src/lib/leaderboard";
import { useAmbassadorRoutes } from "@/components/ambassador/AmbassadorRoutesProvider";

interface LeaderboardHeaderProps {
  backHref?: string;
}

export function LeaderboardHeader({
  backHref = "/ambassador/dashboard",
}: LeaderboardHeaderProps) {
  return (
    <div className="px-4 pt-5 pb-4">
      <div className="max-w-md mx-auto relative flex items-center justify-center">
        <Link href={backHref} className="absolute left-0 text-primary-colour">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1
          className={cn(
            Magnetik_Medium.className,
            "text-lg text-primary-colour",
          )}
        >
          Leaderboard
        </h1>
      </div>
    </div>
  );
}

interface LeaderboardFilterCardProps {
  scope: LeaderboardScope;
  onScopeChange: (scope: LeaderboardScope) => void;
}

export function LeaderboardFilterCard({
  scope,
  onScopeChange,
}: LeaderboardFilterCardProps) {
  return (
    <div className="mx-4 rounded-2xl bg-white border border-grey-5 shadow-sm p-4 space-y-4">
      <div className="space-y-1">
        <h2
          className={cn(
            Magnetik_SemiBold.className,
            "text-sm text-primary-colour",
          )}
        >
          Top Ambassadors
        </h2>
        <p className={cn(Magnetik_Regular.className, "text-xs text-grey-2")}>
          Ranked by total impact score
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {LEADERBOARD_SCOPE_OPTIONS.map((option) => {
          const active = scope === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onScopeChange(option.value)}
              className={cn(
                "rounded-full border px-3 py-2 text-sm transition-colors",
                Magnetik_Medium.className,
                active
                  ? "bg-complimentary-colour border-complimentary-colour text-white"
                  : "bg-white border-grey-4 text-primary-colour",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const MEDAL_STYLES: Record<number, string> = {
  1: "from-[#F6C343] to-[#D89B1D]",
  2: "from-[#D9D9D9] to-[#9E9E9E]",
  3: "from-[#D48B5C] to-[#A65A2A]",
};

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <div
        className={cn(
          "w-10 h-10 rounded-full bg-gradient-to-b flex items-center justify-center shrink-0 shadow-sm",
          MEDAL_STYLES[rank],
        )}
      >
        <span className={cn(Magnetik_Bold.className, "text-sm text-white")}>
          {rank}
        </span>
      </div>
    );
  }

  return (
    <div className="w-10 flex items-center justify-center shrink-0">
      <span
        className={cn(
          Magnetik_Bold.className,
          "text-2xl text-complimentary-colour leading-none",
        )}
      >
        {rank}
      </span>
    </div>
  );
}

function LeaderboardAvatar({
  name,
  avatar,
}: {
  name: string;
  avatar?: string;
}) {
  if (avatar) {
    return (
      <div className="relative w-11 h-11 rounded-full overflow-hidden bg-grey-5 shrink-0">
        <Image src={avatar} alt={name} fill className="object-cover" />
      </div>
    );
  }

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="w-11 h-11 rounded-full bg-grey-5 text-primary-colour flex items-center justify-center shrink-0">
      <span className={cn(Magnetik_SemiBold.className, "text-sm")}>
        {initials || "A"}
      </span>
    </div>
  );
}

interface LeaderboardEntryCardProps {
  entry: AmbassadorLeaderboardEntry;
  isCurrentUser?: boolean;
}

export function LeaderboardEntryCard({
  entry,
  isCurrentUser = false,
}: LeaderboardEntryCardProps) {
  const displayName = getLeaderboardDisplayName(entry.user);

  return (
    <div
      className={cn(
        "rounded-2xl bg-white border shadow-sm px-3 py-3 flex items-center gap-3",
        isCurrentUser
          ? "border-complimentary-colour ring-1 ring-complimentary-colour/30"
          : "border-grey-5",
      )}
    >
      <RankBadge rank={entry.rank} />
      <LeaderboardAvatar name={displayName} avatar={entry.user?.avatar} />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            Magnetik_SemiBold.className,
            "text-sm text-primary-colour truncate",
          )}
        >
          {displayName}
        </p>
        <p
          className={cn(
            Magnetik_Regular.className,
            "text-xs text-grey-2 truncate",
          )}
        >
          {entry.affiliation}
        </p>
      </div>
      <p
        className={cn(
          Magnetik_SemiBold.className,
          "text-sm text-complimentary-colour whitespace-nowrap",
        )}
      >
        {formatLeaderboardPoints(entry.totalScore)}
      </p>
    </div>
  );
}

export function LeaderboardSkeletonList() {
  return (
    <div className="mx-4 space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl bg-white border border-grey-5 px-3 py-3 h-[68px] animate-pulse"
        />
      ))}
    </div>
  );
}

export function LeaderboardEmptyState() {
  const router = useRouter();
  const routes = useAmbassadorRoutes();

  return (
    <div className="mx-4 rounded-2xl bg-white border border-grey-5 shadow-sm px-6 py-10 text-center space-y-4">
      <div className="mx-auto w-28 h-28 rounded-full bg-accent-shade-1 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-complimentary-colour/15 flex items-center justify-center">
          <span className="text-3xl">🏅</span>
        </div>
      </div>
      <div className="space-y-2">
        <p
          className={cn(
            Magnetik_SemiBold.className,
            "text-base text-primary-colour",
          )}
        >
          No rankings yet
        </p>
        <p className={cn(Magnetik_Regular.className, "text-sm text-grey-2")}>
          Complete activities to start earning your place on the leaderboard.
          Rankings update monthly.
        </p>
      </div>
      <button
        type="button"
        onClick={() => router.push(routes.report)}
        className={cn(
          Magnetik_Medium.className,
          "w-full rounded-full border border-complimentary-colour text-complimentary-colour py-3 text-sm",
        )}
      >
        Complete task
      </button>
    </div>
  );
}

interface LeaderboardResetCardProps {
  nextResetDate: string;
}

export function LeaderboardResetCard({
  nextResetDate,
}: LeaderboardResetCardProps) {
  return (
    <div className="mx-4 rounded-2xl bg-white border border-grey-5 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-accent-shade-1 flex items-center justify-center shrink-0">
        <CalendarDays className="w-4 h-4 text-complimentary-colour" />
      </div>
      <p className={cn(Magnetik_Regular.className, "text-xs text-grey-2")}>
        Rankings update monthly. Next reset:{" "}
        <span className="text-primary-colour">
          {formatLeaderboardResetDate(nextResetDate)}
        </span>
      </p>
    </div>
  );
}

interface ViewMoreRankingsButtonProps {
  loading: boolean;
  onClick: () => void;
}

export function ViewMoreRankingsButton({
  loading,
  onClick,
}: ViewMoreRankingsButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        Magnetik_Medium.className,
        "mx-4 w-[calc(100%-2rem)] rounded-full border border-complimentary-colour text-complimentary-colour py-3 text-sm disabled:opacity-60",
      )}
    >
      {loading ? "Loading..." : "View More Rankings"}
    </button>
  );
}
