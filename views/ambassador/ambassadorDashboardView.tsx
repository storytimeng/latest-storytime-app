"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Magnetik_Medium, Magnetik_SemiBold } from "@/lib/font";
import { AmbassadorHeader } from "@/components/ambassador/AmbassadorHeader";
import {
  QuickActionCard,
  ScoreProgressBar,
} from "@/components/ambassador/AmbassadorComponents";
import {
  fetchAmbassadorDashboard,
  type AmbassadorDashboard,
} from "@/src/lib/ambassadors";

const TIER_EMOJI: Record<string, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
};

export default function AmbassadorDashboardView() {
  const router = useRouter();
  const [data, setData] = useState<AmbassadorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAmbassadorDashboard()
      .then(setData)
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-colour" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto">
        <AmbassadorHeader title="Ambassador Dashboard" />
        <div className="px-4 py-8 text-center text-grey-2">
          <p>{error || "Unable to load dashboard."}</p>
          <button
            className="mt-4 text-primary-colour underline"
            onClick={() => router.push("/ambassador")}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const { ambassador, stats } = data;
  const typeLabel =
    ambassador.type === "campus" ? "Campus Ambassador" : "Community Ambassador";

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto pb-24">
      <AmbassadorHeader title="Ambassador Dashboard" />

      <div className="px-4 py-6 space-y-6">
        <div className="bg-primary-colour rounded-xl p-5 text-white">
          <p className="text-sm opacity-90">{typeLabel}</p>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className={`${Magnetik_SemiBold.className} text-2xl`}>
                {stats.totalScore} pts
              </p>
              <p className="text-sm capitalize">
                {TIER_EMOJI[stats.tier]} {stats.tier} tier
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-magnetik-bold">
                {stats.totalReferrals}
              </p>
              <p className="text-xs opacity-90">referrals</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
          <p className={`${Magnetik_Medium.className} text-primary-colour`}>
            Your impact scores
          </p>
          <ScoreProgressBar
            label="Awareness"
            score={stats.scores.awareness}
            maxScore={300}
          />
          <ScoreProgressBar
            label="Reading"
            score={stats.scores.reading}
            maxScore={250}
          />
          <ScoreProgressBar
            label="Writing"
            score={stats.scores.writing}
            maxScore={250}
          />
          <ScoreProgressBar
            label="Community"
            score={stats.scores.community}
            maxScore={200}
          />
          <ScoreProgressBar
            label="Consistency"
            score={stats.scores.consistency}
            maxScore={200}
          />
        </div>

        <div>
          <p
            className={`${Magnetik_Medium.className} text-primary-colour mb-3`}
          >
            Quick actions
          </p>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              icon="🔗"
              label="Share Your Link"
              href="/ambassador/share"
            />
            <QuickActionCard
              icon="📋"
              label="Monthly Report"
              href="/ambassador/report"
            />
            <QuickActionCard
              icon="🏆"
              label="Leaderboard"
              href="/ambassador/leaderboard"
            />
            <QuickActionCard
              icon="📊"
              label="Score Breakdown"
              href="/ambassador/breakdown"
            />
          </div>
        </div>

        {data.currentMonthlyReport && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className={`${Magnetik_Medium.className} text-primary-colour`}>
              This month&apos;s report
            </p>
            <p className="text-sm text-grey-2 mt-1 capitalize">
              Status: {data.currentMonthlyReport.status}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
