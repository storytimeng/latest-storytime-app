import type { AmbassadorTier } from "@/src/lib/ambassadors";

export interface ScoreBreakdownItem {
  label: string;
  value: string;
  points: number;
}

export interface ScoreCategory {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  items: ScoreBreakdownItem[];
}

export interface ScoreCategoryLegend {
  key: string;
  label: string;
  color: string;
}

export interface ScoreTierInfo {
  tier: AmbassadorTier;
  label: string;
  minScore: number;
  maxScore: number;
  perks: string;
  isCurrent: boolean;
}

export interface AmbassadorScoreBreakdown {
  totalScore: number;
  hasScore: boolean;
  tier: AmbassadorTier;
  nextTier: AmbassadorTier | null;
  pointsToNextTier: number;
  monthlyPointsDelta: number;
  nextResetDate: string;
  referralCount: number;
  categories: ScoreCategory[];
  categoryLegend: ScoreCategoryLegend[];
  tiers: ScoreTierInfo[];
}

const TIER_MEDAL: Record<AmbassadorTier, string> = {
  bronze: "3",
  silver: "2",
  gold: "1",
  platinum: "1",
};

const TIER_GRADIENT: Record<AmbassadorTier, string> = {
  bronze: "from-[#D48B5C] to-[#A65A2A]",
  silver: "from-[#D9D9D9] to-[#9E9E9E]",
  gold: "from-[#F6C343] to-[#D89B1D]",
  platinum: "from-[#F6C343] to-[#D89B1D]",
};

export function getTierMedalNumber(tier: AmbassadorTier): string {
  return TIER_MEDAL[tier];
}

export function getTierGradient(tier: AmbassadorTier): string {
  return TIER_GRADIENT[tier];
}

export function formatTierLabel(tier: AmbassadorTier): string {
  return `${tier.charAt(0).toUpperCase()}${tier.slice(1)} Ambassador`;
}

export function formatTierRange(minScore: number, maxScore: number): string {
  return `${minScore.toLocaleString()} - ${maxScore.toLocaleString()} points`;
}

export function formatScoreResetDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getCategoryProgressColor(
  score: number,
  maxScore: number,
): string {
  return score >= maxScore ? "#34A853" : "#E86C00";
}

export function formatMonthlyDelta(delta: number): string {
  if (delta <= 0) return "No change this month";
  return `+${delta.toLocaleString()} points this month`;
}
