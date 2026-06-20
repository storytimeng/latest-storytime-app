export type ReferralActivityStatus = "active" | "pending" | "inactive";

export type ReferralFilter = ReferralActivityStatus | "all";

export interface AmbassadorReferralItem {
  id: string;
  source: string;
  signedUpAt: string;
  storiesPublished: number;
  status: ReferralActivityStatus;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    penName?: string;
    avatar?: string;
    lastActiveAt?: string;
  } | null;
}

export interface ReferralImpactStats {
  totalPeopleReferred: number;
  activeThisMonth: number;
  newCount: number;
  activeCount: number;
  pendingCount: number;
  inactiveCount: number;
}

export function formatJoinedAgo(value: string): string {
  const date = new Date(value);
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Joined today";
  if (days === 1) return "Joined 1 day ago";
  if (days < 7) return `Joined ${days} days ago`;
  if (days < 14) return "Joined 1 week ago";
  if (days < 30) return `Joined ${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return "Joined 1 month ago";
  return `Joined ${Math.floor(days / 30)} months ago`;
}

export function getReferralDisplayName(
  user: AmbassadorReferralItem["user"],
): string {
  if (!user) return "Storyteller";
  if (user.penName?.trim()) return user.penName.trim();
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Storyteller";
}

export function getReferralInitials(
  user: AmbassadorReferralItem["user"],
): string {
  const name = getReferralDisplayName(user);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function getReferralActivityLabel(storiesPublished: number): string {
  if (storiesPublished <= 0) return "0 stories yet";
  return `Published ${storiesPublished} stor${storiesPublished === 1 ? "y" : "ies"}`;
}

export function filterReferrals(
  referrals: AmbassadorReferralItem[],
  filter: ReferralFilter,
): AmbassadorReferralItem[] {
  if (filter === "all") return referrals;
  return referrals.filter((referral) => referral.status === filter);
}

export const REFERRAL_FILTER_OPTIONS: Array<{ value: ReferralFilter; label: string }> =
  [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "inactive", label: "Inactive" },
  ];
