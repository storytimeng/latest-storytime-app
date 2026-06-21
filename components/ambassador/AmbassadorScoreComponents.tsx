"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Info,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib";
import {
  Magnetik_Bold,
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import type { AmbassadorTier } from "@/src/lib/ambassadors";
import {
  formatMonthlyDelta,
  formatScoreResetDate,
  formatTierLabel,
  formatTierRange,
  getCategoryProgressColor,
  getTierGradient,
  getTierMedalNumber,
  type AmbassadorScoreBreakdown,
  type ScoreCategory,
} from "@/src/lib/score-breakdown";
import { useAmbassadorRoutes } from "@/components/ambassador/AmbassadorRoutesProvider";

interface ScoreHeaderProps {
  backHref?: string;
}

export function ScoreHeader({
  backHref = "/ambassador/dashboard",
}: ScoreHeaderProps) {
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
          Ambassador Score
        </h1>
      </div>
    </div>
  );
}

function TierMedal({ tier }: { tier: AmbassadorTier }) {
  return (
    <div
      className={cn(
        "w-12 h-12 rounded-full bg-gradient-to-b flex items-center justify-center shrink-0 shadow-sm",
        getTierGradient(tier),
      )}
    >
      <span className={cn(Magnetik_Bold.className, "text-sm text-white")}>
        {getTierMedalNumber(tier)}
      </span>
    </div>
  );
}

interface ScoreSummaryCardProps {
  data: AmbassadorScoreBreakdown;
}

export function ScoreSummaryCard({ data }: ScoreSummaryCardProps) {
  const progressPercent =
    data.nextTier && data.pointsToNextTier > 0
      ? Math.min(
          100,
          ((data.totalScore -
            (data.tiers.find((tier) => tier.tier === data.tier)?.minScore ??
              0)) /
            Math.max(
              1,
              data.totalScore +
                data.pointsToNextTier -
                (data.tiers.find((tier) => tier.tier === data.tier)?.minScore ??
                  0),
            )) *
            100,
        )
      : 100;

  return (
    <div className="mx-4 rounded-2xl bg-white border border-complimentary-colour/50 shadow-sm p-5 space-y-4">
      <div className="flex items-start gap-3">
        <TierMedal tier={data.tier} />
        <div className="flex-1">
          <p
            className={cn(
              Magnetik_Bold.className,
              "text-4xl text-complimentary-colour leading-none",
            )}
          >
            {data.totalScore.toLocaleString()}
          </p>
          <p
            className={cn(
              Magnetik_Regular.className,
              "text-sm text-grey-2 mt-1",
            )}
          >
            Total Score
          </p>
          <p
            className={cn(
              Magnetik_SemiBold.className,
              "text-sm text-primary-colour mt-2 capitalize",
            )}
          >
            {formatTierLabel(data.tier)}
          </p>
        </div>
      </div>

      {data.monthlyPointsDelta > 0 && (
        <p
          className={cn(
            Magnetik_Medium.className,
            "text-sm text-[#34A853] flex items-center gap-1",
          )}
        >
          <TrendingUp className="w-4 h-4" />
          {formatMonthlyDelta(data.monthlyPointsDelta)}
        </p>
      )}

      {data.nextTier && data.pointsToNextTier > 0 && (
        <div className="space-y-2">
          <p className={cn(Magnetik_Regular.className, "text-xs text-grey-2")}>
            {data.pointsToNextTier.toLocaleString()} points to{" "}
            {formatTierLabel(data.nextTier)}
          </p>
          <div className="h-2 rounded-full bg-grey-5 overflow-hidden">
            <div
              className="h-full rounded-full bg-complimentary-colour transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-2">
        {data.categoryLegend.map((legend) => (
          <div key={legend.key} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: legend.color }}
            />
            <span
              className={cn(
                Magnetik_Regular.className,
                "text-[11px] text-grey-2",
              )}
            >
              {legend.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryProgressBar({
  score,
  maxScore,
}: {
  score: number;
  maxScore: number;
}) {
  const percent = maxScore > 0 ? Math.min(100, (score / maxScore) * 100) : 0;
  const color = getCategoryProgressColor(score, maxScore);

  return (
    <div className="h-2 rounded-full bg-grey-5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  );
}

function ScoreCategoryCard({ category }: { category: ScoreCategory }) {
  const [expanded, setExpanded] = useState(false);
  const isComplete = category.score >= category.maxScore;

  return (
    <div className="rounded-2xl bg-white border border-grey-5 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="w-full px-4 py-4 text-left"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <p
              className={cn(
                Magnetik_SemiBold.className,
                "text-sm text-primary-colour",
              )}
            >
              {category.label}
            </p>
            <p
              className={cn(
                Magnetik_SemiBold.className,
                "text-sm",
                isComplete ? "text-[#34A853]" : "text-complimentary-colour",
              )}
            >
              {category.score}/{category.maxScore}
            </p>
            <CategoryProgressBar
              score={category.score}
              maxScore={category.maxScore}
            />
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-grey-3 shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-grey-3 shrink-0" />
          )}
        </div>
      </button>

      {expanded && category.items.length > 0 && (
        <div className="px-4 pb-4 border-t border-grey-5 pt-3 space-y-2">
          {category.items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className={cn(Magnetik_Regular.className, "text-grey-2")}>
                {item.label}: {item.value}
              </span>
              <span
                className={cn(
                  Magnetik_Medium.className,
                  "text-complimentary-colour whitespace-nowrap",
                )}
              >
                +{item.points} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScoreCategoriesSection({
  categories,
}: {
  categories: ScoreCategory[];
}) {
  return (
    <div className="px-4 space-y-3">
      <div className="space-y-1">
        <h2
          className={cn(
            Magnetik_SemiBold.className,
            "text-sm text-primary-colour",
          )}
        >
          Score Categories
        </h2>
        <p className={cn(Magnetik_Regular.className, "text-xs text-grey-2")}>
          Tap each category to see detailed breakdown
        </p>
      </div>
      <div className="space-y-2">
        {categories.map((category) => (
          <ScoreCategoryCard key={category.key} category={category} />
        ))}
      </div>
    </div>
  );
}

export function TierStatusSection({
  tiers,
}: {
  tiers: AmbassadorScoreBreakdown["tiers"];
}) {
  return (
    <div className="px-4 space-y-2">
      {tiers.map((tierInfo) => (
        <div
          key={tierInfo.tier}
          className={cn(
            "rounded-2xl border px-4 py-4 flex items-start gap-3",
            tierInfo.isCurrent
              ? "bg-grey-5 border-grey-4"
              : "bg-white border-complimentary-colour/30",
          )}
        >
          <TierMedal tier={tierInfo.tier} />
          <div className="min-w-0 flex-1 space-y-1">
            <p
              className={cn(
                Magnetik_SemiBold.className,
                "text-sm text-primary-colour",
              )}
            >
              {tierInfo.label}
              {tierInfo.isCurrent && (
                <span className="text-complimentary-colour">
                  {" "}
                  - YOU ARE HERE
                </span>
              )}
            </p>
            <p
              className={cn(Magnetik_Regular.className, "text-xs text-grey-2")}
            >
              {formatTierRange(tierInfo.minScore, tierInfo.maxScore)}
            </p>
            <p
              className={cn(Magnetik_Regular.className, "text-xs text-grey-3")}
            >
              {tierInfo.perks}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ScoreInfoCard() {
  return (
    <div className="mx-4 rounded-2xl bg-white border border-grey-5 shadow-sm px-4 py-3 flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-complimentary-colour/10 flex items-center justify-center shrink-0">
        <Info className="w-4 h-4 text-complimentary-colour" />
      </div>
      <p className={cn(Magnetik_Regular.className, "text-xs text-grey-2")}>
        Your score is recalculated monthly after you submit your activity
        report. Keep engaging with the community to maintain and improve your
        tier!
      </p>
    </div>
  );
}

export function ScoreResetCard({ nextResetDate }: { nextResetDate: string }) {
  return (
    <div className="mx-4 rounded-2xl bg-white border border-grey-5 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-accent-shade-1 flex items-center justify-center shrink-0">
        <CalendarDays className="w-4 h-4 text-complimentary-colour" />
      </div>
      <p className={cn(Magnetik_Regular.className, "text-xs text-grey-2")}>
        Your score updates monthly after activity reports are submitted. Next
        reset:{" "}
        <span className="text-primary-colour">
          {formatScoreResetDate(nextResetDate)}
        </span>
      </p>
    </div>
  );
}

export function ScoreEmptyState({ nextResetDate }: { nextResetDate: string }) {
  const router = useRouter();
  const routes = useAmbassadorRoutes();

  return (
    <div className="px-4 space-y-5">
      <div className="rounded-2xl bg-white border border-grey-5 shadow-sm p-4">
        <p
          className={cn(
            Magnetik_SemiBold.className,
            "text-sm text-primary-colour mb-2",
          )}
        >
          Score Categories
        </p>
        <ul
          className={cn(
            Magnetik_Regular.className,
            "text-xs text-grey-2 space-y-1 list-disc pl-4",
          )}
        >
          <li>Awareness</li>
          <li>Reading</li>
          <li>Writing</li>
          <li>Community</li>
          <li>Consistency</li>
        </ul>
      </div>

      <div className="rounded-2xl bg-white border border-grey-5 shadow-sm px-6 py-10 text-center space-y-4">
        <div className="mx-auto w-28 h-28 rounded-full bg-accent-shade-1 flex items-center justify-center">
          <span className="text-4xl text-complimentary-colour/50">◠</span>
        </div>
        <div className="space-y-2">
          <p
            className={cn(
              Magnetik_SemiBold.className,
              "text-base text-primary-colour",
            )}
          >
            No score yet
          </p>
          <p className={cn(Magnetik_Regular.className, "text-sm text-grey-2")}>
            You haven&apos;t earned points in any categories. Submit your first
            activity report to get started!
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
          Start Earning Points
        </button>
      </div>

      <ScoreResetCard nextResetDate={nextResetDate} />
    </div>
  );
}

export function ScoreSkeleton() {
  return (
    <div className="px-4 space-y-4">
      <div className="h-48 rounded-2xl bg-white border border-grey-5 animate-pulse" />
      <div className="h-32 rounded-2xl bg-white border border-grey-5 animate-pulse" />
      <div className="h-32 rounded-2xl bg-white border border-grey-5 animate-pulse" />
    </div>
  );
}
