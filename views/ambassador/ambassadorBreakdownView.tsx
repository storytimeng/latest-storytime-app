"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Magnetik_Medium, Magnetik_SemiBold } from "@/lib/font";
import { AmbassadorHeader } from "@/components/ambassador/AmbassadorHeader";
import { ScoreProgressBar } from "@/components/ambassador/AmbassadorComponents";
import { fetchAmbassadorBreakdown } from "@/src/lib/ambassadors";

const TIER_EMOJI: Record<string, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
};

export default function AmbassadorBreakdownView() {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof fetchAmbassadorBreakdown>
  > | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAmbassadorBreakdown()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-colour" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto">
        <AmbassadorHeader
          title="Score Breakdown"
          backHref="/ambassador/dashboard"
        />
        <p className="text-center text-grey-2 py-8">
          Unable to load breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto pb-24">
      <AmbassadorHeader
        title="Score Breakdown"
        backHref="/ambassador/dashboard"
      />

      <div className="px-4 py-6 space-y-6">
        <div className="bg-primary-colour rounded-xl p-5 text-white text-center">
          <p className={`${Magnetik_SemiBold.className} text-3xl`}>
            {data.totalScore}
          </p>
          <p className="text-sm capitalize">
            {TIER_EMOJI[data.tier]} {data.tier} Ambassador
          </p>
          {data.nextTier && (
            <p className="text-xs mt-2 opacity-90">
              {data.pointsToNextTier} pts to {data.nextTier}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 space-y-4 shadow-sm">
          <p className={`${Magnetik_Medium.className} text-primary-colour`}>
            Score categories
          </p>
          {data.categories.map((cat) => (
            <div key={cat.key}>
              <ScoreProgressBar
                label={cat.label}
                score={cat.score}
                maxScore={cat.maxScore}
              />
              <p className="text-xs text-grey-3 mt-1">{cat.tip}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p
            className={`${Magnetik_Medium.className} text-primary-colour mb-3`}
          >
            Tier levels
          </p>
          <div className="space-y-2">
            {data.tiers.map((t) => (
              <div
                key={t.tier}
                className={`flex justify-between text-sm p-2 rounded-lg ${
                  t.isCurrent ? "bg-primary-shade-2" : ""
                }`}
              >
                <span className="capitalize text-primary-colour">
                  {TIER_EMOJI[t.tier]} {t.tier}
                </span>
                <span className="text-grey-2">{t.minScore}+ pts</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <p className="text-2xl font-magnetik-bold text-primary-colour">
            {data.referralCount}
          </p>
          <p className="text-sm text-grey-2">Total referrals</p>
        </div>
      </div>
    </div>
  );
}
