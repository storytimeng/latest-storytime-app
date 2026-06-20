import Cookies from "js-cookie";
import { getAuthToken } from "@/src/stores/useAuthStore";
import { prepareAuthSession } from "@/src/lib/authSession";
import { refreshTokens } from "@/src/lib/tokenManager";

export type AmbassadorType = "campus" | "community";
export type ApplicationStatus = "pending" | "accepted" | "declined";
export type AmbassadorTier = "bronze" | "silver" | "gold" | "platinum";
export type MonthlyReportStatus =
  | "inactive"
  | "draft"
  | "submitted"
  | "processing"
  | "completed";

export interface AmbassadorApplication {
  id: string;
  applicationReference: string;
  userId: string;
  type: AmbassadorType;
  status: ApplicationStatus;
  fullName: string;
  email: string;
  phone?: string;
  city: string;
  country: string;
  institution?: string;
  profileTypes: string[];
  otherProfileType?: string;
  whyJoin: string;
  promotionMethods: string[];
  otherPromotionDetail?: string;
  partOfOrganizedCommunity: boolean;
  storytimeRole?: string;
  conflictHandling?: string;
  agreedToResponsibility: boolean;
  agreedToIntegrity: boolean;
  agreedToMonthlyReports: boolean;
  agreedToPerformanceReview: boolean;
  readingExperience: string;
  writingExperience?: string;
  favoriteGenres: string[];
  communityDescription: string;
  estimatedReach: number;
  hasLedCommunityBefore: boolean;
  communityPlatforms: string[];
  weeklyHoursCommitment: number;
  declineReason?: string;
  reviewDeadline: string;
  reviewedAt?: string;
  canReapply: boolean;
  reapplyDaysRemaining: number;
  daysRemaining: number;
  hoursRemaining: number;
  createdAt: string;
}

export interface AmbassadorProfile {
  id: string;
  userId: string;
  type: AmbassadorType;
  referralCode: string;
  shareUrl: string;
  isActive: boolean;
  totalScore: number;
  tier: AmbassadorTier;
  acceptedAt: string;
  lastReportAt?: string;
}

export interface AmbassadorOverview {
  hasApplication: boolean;
  application: AmbassadorApplication | null;
  isAmbassador: boolean;
  ambassador: AmbassadorProfile | null;
}

export interface AmbassadorDashboard {
  ambassador: AmbassadorProfile;
  stats: {
    totalReferrals: number;
    totalScore: number;
    tier: AmbassadorTier;
    scores: {
      awareness: number;
      reading: number;
      writing: number;
      community: number;
      consistency: number;
    };
  };
  currentMonthlyReport: MonthlyReport | null;
  shareUrl: string;
}

export interface MonthlyReport {
  id: string;
  year: number;
  month: number;
  monthLabel: string;
  status: MonthlyReportStatus;
  storiesRead: number;
  storiesWritten: number;
  newReferrals: number;
  eventsHosted: number;
  studentsReached: number;
  readingSessionsOrganized: number;
  socialPostsCount: number;
  communityEvents: number;
  onlineReach: number;
  highlights?: string;
  referralStoriesPublished: number;
  activitiesDescription?: string;
  programFeedback?: string;
  submittedAt?: string;
  processedAt?: string;
}

export interface CreateApplicationPayload {
  type: AmbassadorType;
  city: string;
  country: string;
  institution?: string;
  profileTypes: string[];
  otherProfileType?: string;
  whyJoin: string;
  promotionMethods: string[];
  otherPromotionDetail?: string;
  partOfOrganizedCommunity: boolean;
  storytimeRole: string;
  conflictHandling: string;
  agreedToResponsibility: boolean;
  agreedToIntegrity: boolean;
  agreedToMonthlyReports: boolean;
  agreedToPerformanceReview: boolean;
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_PROXY === "true"
    ? "/api/proxy"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
}

function unwrapData<T>(payload: unknown): T {
  if (!payload || typeof payload !== "object") {
    return payload as T;
  }
  const record = payload as Record<string, unknown>;
  if ("data" in record && record.data && typeof record.data === "object") {
    const nested = record.data as Record<string, unknown>;
    if ("data" in nested) {
      return nested.data as T;
    }
    return nested as T;
  }
  return record as T;
}

async function ambassadorFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const buildHeaders = (accessToken?: string) => {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "application/json");
    if (accessToken) {
      headers.set(
        "Authorization",
        accessToken.startsWith("Bearer")
          ? accessToken
          : `Bearer ${accessToken}`,
      );
    }
    return headers;
  };

  const request = async (accessToken?: string) => {
    const token =
      accessToken ||
      (await prepareAuthSession()) ||
      (typeof getAuthToken === "function" ? getAuthToken() : undefined) ||
      Cookies.get("authToken");

    return fetch(`${getBaseUrl()}${path}`, {
      ...init,
      headers: buildHeaders(token),
    });
  };

  let response = await request();

  if (response.status === 401) {
    const refreshed = await refreshTokens();
    if (refreshed?.token) {
      response = await request(refreshed.token);
    }
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (json as { message?: string })?.message ||
      (json as { data?: { message?: string } })?.data?.message ||
      response.statusText;
    throw new Error(message || "Ambassador request failed");
  }

  return unwrapData<T>(json);
}

export async function fetchAmbassadorOverview() {
  return ambassadorFetch<AmbassadorOverview>("/ambassadors/overview");
}

export async function submitAmbassadorApplication(
  payload: CreateApplicationPayload,
) {
  return ambassadorFetch<{ application: AmbassadorApplication }>(
    "/ambassadors/applications",
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function fetchMyAmbassadorApplication() {
  return ambassadorFetch<{ application: AmbassadorApplication }>(
    "/ambassadors/applications/me",
  );
}

export async function withdrawAmbassadorApplication() {
  return ambassadorFetch<{ success: boolean }>("/ambassadors/applications/me", {
    method: "DELETE",
  });
}

export function formatAmbassadorTypeLabel(type: AmbassadorType): string {
  return type === "campus" ? "Campus Ambassador" : "Community Ambassador";
}

export const AMBASSADOR_WELCOME_SEEN_KEY = "storytime-ambassador-welcome-seen";

export function hasSeenAmbassadorWelcome(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AMBASSADOR_WELCOME_SEEN_KEY) === "true";
}

export function markAmbassadorWelcomeSeen(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AMBASSADOR_WELCOME_SEEN_KEY, "true");
}

export function getAmbassadorEntryPath(): string {
  return hasSeenAmbassadorWelcome()
    ? "/ambassador/dashboard"
    : "/ambassador/welcome";
}

export function formatApplicationDate(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatApplicationDateShort(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export const REAPPLY_COOLDOWN_DAYS = 30;

export function getReapplyDaysRemaining(reviewedAt?: string | null): number {
  if (!reviewedAt) return 0;

  const eligibleAt = new Date(reviewedAt);
  eligibleAt.setDate(eligibleAt.getDate() + REAPPLY_COOLDOWN_DAYS);
  const msRemaining = eligibleAt.getTime() - Date.now();

  if (msRemaining <= 0) return 0;
  return Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
}

export function getDecisionCountdown(reviewDeadline: string): {
  days: number;
  hours: number;
} {
  const msRemaining = Math.max(
    0,
    new Date(reviewDeadline).getTime() - Date.now(),
  );
  const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );

  return { days, hours };
}

export async function fetchAmbassadorDashboard() {
  return ambassadorFetch<AmbassadorDashboard>("/ambassadors/dashboard");
}

export async function fetchAmbassadorReferrals() {
  return ambassadorFetch<{
    referrals: Array<{
      id: string;
      source: string;
      signedUpAt: string;
      storiesPublished: number;
      status: "active" | "pending" | "inactive";
      user: {
        id: string;
        firstName: string;
        lastName: string;
        penName?: string;
        avatar?: string;
        lastActiveAt?: string;
      } | null;
    }>;
    stats: {
      totalPeopleReferred: number;
      activeThisMonth: number;
      newCount: number;
      activeCount: number;
      pendingCount: number;
      inactiveCount: number;
    };
    shareUrl: string;
    referralCode: string;
    displaySharePath: string;
  }>("/ambassadors/referrals");
}

export async function fetchAmbassadorLeaderboard(type?: AmbassadorType) {
  const query = type ? `?type=${type}` : "";
  return ambassadorFetch<{
    leaderboard: Array<{
      rank: number;
      ambassadorId: string;
      type: AmbassadorType;
      totalScore: number;
      tier: AmbassadorTier;
      referralCode: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        penName?: string;
        avatar?: string;
      } | null;
    }>;
  }>(`/ambassadors/leaderboard${query}`);
}

export async function fetchAmbassadorBreakdown() {
  return ambassadorFetch<{
    totalScore: number;
    tier: AmbassadorTier;
    nextTier: AmbassadorTier | null;
    pointsToNextTier: number;
    referralCount: number;
    categories: Array<{
      key: string;
      label: string;
      score: number;
      maxScore: number;
      tip: string;
    }>;
    tiers: Array<{ tier: string; minScore: number; isCurrent: boolean }>;
  }>("/ambassadors/breakdown");
}

export async function fetchMonthlyReport(year: number, month: number) {
  return ambassadorFetch<{ report: MonthlyReport }>(
    `/ambassadors/reports/monthly?year=${year}&month=${month}`,
  );
}

export const MONTHLY_REPORT_ACTIVITIES_MIN_LENGTH = 250;

export async function submitMonthlyReport(payload: {
  year: number;
  month: number;
  asDraft?: boolean;
  newReferrals: number;
  referralStoriesPublished: number;
  activitiesDescription?: string;
  programFeedback?: string;
}) {
  return ambassadorFetch<{
    report: MonthlyReport;
    summary: {
      totalReferrals: number;
      totalEventsHosted: number;
      monthsActive: number;
      firstName: string;
    } | null;
  }>("/ambassadors/reports/monthly", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
