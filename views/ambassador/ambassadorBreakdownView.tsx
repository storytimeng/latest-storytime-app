"use client";

import { useEffect, useState } from "react";
import {
  ScoreCategoriesSection,
  ScoreEmptyState,
  ScoreHeader,
  ScoreInfoCard,
  ScoreResetCard,
  ScoreSkeleton,
  ScoreSummaryCard,
  TierStatusSection,
} from "@/components/ambassador/AmbassadorScoreComponents";
import { fetchAmbassadorBreakdown } from "@/src/lib/ambassadors";
import type { AmbassadorScoreBreakdown } from "@/src/lib/score-breakdown";
import { useRequireAmbassador } from "@/src/hooks/useRequireAmbassador";
import { Loader2 } from "lucide-react";
import { showToast } from "@/lib/showNotification";

export default function AmbassadorBreakdownView() {
  const { isLoading: guardLoading, isAmbassador } = useRequireAmbassador();
  const [data, setData] = useState<AmbassadorScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAmbassadorBreakdown()
      .then(setData)
      .catch(() => {
        showToast({
          type: "error",
          message: "Failed to load ambassador score",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (guardLoading || !isAmbassador) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-colour" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto pb-10">
      <ScoreHeader />

      {loading ? (
        <ScoreSkeleton />
      ) : !data ? (
        <p className="text-center text-grey-2 py-8 text-sm">
          Unable to load ambassador score.
        </p>
      ) : !data.hasScore ? (
        <ScoreEmptyState nextResetDate={data.nextResetDate} />
      ) : (
        <div className="space-y-5">
          <ScoreSummaryCard data={data} />
          <ScoreCategoriesSection categories={data.categories} />
          <TierStatusSection tiers={data.tiers} />
          <ScoreInfoCard />
          <ScoreResetCard nextResetDate={data.nextResetDate} />
        </div>
      )}
    </div>
  );
}
