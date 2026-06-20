export type LeaderboardScope = "campus" | "city" | "global";

export interface AmbassadorLeaderboardEntry {
  rank: number;
  ambassadorId: string;
  type: "campus" | "community";
  totalScore: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  affiliation: string;
  referralCode: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    penName?: string;
    avatar?: string;
  } | null;
}

export interface AmbassadorLeaderboardResponse {
  leaderboard: AmbassadorLeaderboardEntry[];
  scope: LeaderboardScope;
  total: number;
  hasMore: boolean;
  nextResetDate: string;
  limit: number;
  offset: number;
}

export const LEADERBOARD_SCOPE_OPTIONS: Array<{
  value: LeaderboardScope;
  label: string;
}> = [
  { value: "campus", label: "Campus" },
  { value: "city", label: "City" },
  { value: "global", label: "Global" },
];

export const LEADERBOARD_PAGE_SIZE = 7;

export function getDefaultLeaderboardScope(
  ambassadorType: "campus" | "community",
): LeaderboardScope {
  return ambassadorType === "community" ? "city" : "campus";
}

export function getLeaderboardDisplayName(
  user: AmbassadorLeaderboardEntry["user"],
): string {
  if (!user) return "Ambassador";
  return (
    user.penName?.trim() ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "Ambassador"
  );
}

export function formatLeaderboardPoints(score: number): string {
  return `${score.toLocaleString()} points`;
}

export function formatLeaderboardResetDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
