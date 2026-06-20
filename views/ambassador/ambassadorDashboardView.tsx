"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  AmbassadorCelebrationModal,
  AmbassadorCertificateModal,
  AmbassadorHubHeader,
  ImpactStatsGrid,
  MilestoneCard,
  MonthlyProgressCard,
  QuickActionsList,
} from "@/components/ambassador/AmbassadorHubComponents";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import {
  buildMonthlyGoals,
  formatTrendDelta,
  getAmbassadorLevelLabel,
  getCurrentMonthLabel,
  getDaysRemainingInMonth,
  getMonthlyProgressPercent,
  getSixMonthCertificateDate,
  isSixMonthMilestone,
} from "@/src/lib/ambassador-dashboard";
import {
  fetchAmbassadorDashboard,
  fetchAmbassadorLeaderboard,
  type AmbassadorDashboard,
} from "@/src/lib/ambassadors";
import { getDefaultLeaderboardScope } from "@/src/lib/leaderboard";
import { showToast } from "@/lib/showNotification";

const CELEBRATION_SEEN_KEY = "storytime-ambassador-6month-celebration-seen";

export default function AmbassadorDashboardView() {
  const router = useRouter();
  const { user } = useUserProfile();
  const [data, setData] = useState<AmbassadorDashboard | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const dashboard = await fetchAmbassadorDashboard();
        if (cancelled) return;

        setData(dashboard);

        const leaderboard = await fetchAmbassadorLeaderboard({
          scope: getDefaultLeaderboardScope(dashboard.ambassador.type),
          limit: 100,
        });
        if (cancelled) return;

        const userRank = leaderboard.leaderboard.find(
          (entry) => entry.ambassadorId === dashboard.ambassador.id,
        )?.rank;
        setRank(userRank ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = useMemo(() => {
    if (!user) return "Ambassador";
    return (
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.penName ||
      "Ambassador"
    );
  }, [user]);

  const avatarUrl =
    user?.profilePicture ||
    user?.avatar ||
    "/person-with-sunglasses-smiling.jpg";

  const monthlyGoals = useMemo(() => {
    if (!data) return [];
    return buildMonthlyGoals(data.currentMonthlyReport, data.ambassador.type);
  }, [data]);

  const progressPercent = getMonthlyProgressPercent(monthlyGoals);
  const showMilestone = data
    ? isSixMonthMilestone(data.ambassador.acceptedAt)
    : false;
  const certificateDate = data
    ? getSixMonthCertificateDate(data.ambassador.acceptedAt)
    : "";

  useEffect(() => {
    if (!showMilestone || loading) return;
    const seen = localStorage.getItem(CELEBRATION_SEEN_KEY) === "true";
    if (!seen) {
      setCelebrationOpen(true);
    }
  }, [showMilestone, loading]);

  const handleProgressAction = () => {
    if (progressPercent >= 100) return;
    router.push("/ambassador/report");
  };

  const handleCertificateDone = () => {
    showToast({
      type: "success",
      message: "Certificate 1 was saved to your device successfully.",
      duration: 3000,
    });
  };

  const handleCelebrationViewDetails = () => {
    localStorage.setItem(CELEBRATION_SEEN_KEY, "true");
    setCelebrationOpen(false);
    setCertificateOpen(true);
  };

  const handleCelebrationClose = () => {
    localStorage.setItem(CELEBRATION_SEEN_KEY, "true");
    setCelebrationOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-colour" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto px-4 py-8 text-center text-grey-2">
        <p>{error || "Unable to load dashboard."}</p>
        <button
          type="button"
          className="mt-4 text-primary-colour underline"
          onClick={() => router.push("/profile")}
        >
          Go back
        </button>
      </div>
    );
  }

  const { ambassador, stats, currentMonthlyReport } = data;
  const referralsThisMonth = currentMonthlyReport?.newReferrals ?? 0;
  const storiesThisMonth =
    currentMonthlyReport?.referralStoriesPublished ??
    currentMonthlyReport?.storiesWritten ??
    0;
  const eventsThisMonth = currentMonthlyReport?.eventsHosted ?? 0;
  const referralTrend = formatTrendDelta(referralsThisMonth);
  const storiesTrend = formatTrendDelta(storiesThisMonth);
  const eventsTrend = formatTrendDelta(eventsThisMonth);

  const impactStats = [
    {
      value: referralsThisMonth,
      label: "Total Referrals",
      trend: referralTrend.text,
      positive: referralTrend.positive,
    },
    {
      value: storiesThisMonth,
      label: "Stories via Referrals",
      trend: storiesTrend.text,
      positive: storiesTrend.positive,
    },
    {
      value: eventsThisMonth,
      label: "Events Hosted",
      trend: eventsTrend.text,
      positive: eventsTrend.positive,
    },
    {
      value: stats.totalScore,
      label: "Ambassador Score",
      trend: rank ? `↑ Rank #${rank}` : "↑ Rank —",
      positive: true,
    },
  ];

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto pb-10">
      <AmbassadorHubHeader
        displayName={displayName}
        avatarUrl={avatarUrl}
        levelLabel={getAmbassadorLevelLabel(ambassador.type)}
      />

      <div className="space-y-6 pt-2">
        <MonthlyProgressCard
          monthLabel={getCurrentMonthLabel()}
          daysRemaining={getDaysRemainingInMonth()}
          goals={monthlyGoals}
          progressPercent={progressPercent}
          onAction={handleProgressAction}
        />

        <ImpactStatsGrid stats={impactStats} />

        <QuickActionsList />

        {showMilestone && (
          <MilestoneCard onDownload={() => setCertificateOpen(true)} />
        )}
      </div>

      <AmbassadorCelebrationModal
        isOpen={celebrationOpen}
        onClose={handleCelebrationClose}
        onViewDetails={handleCelebrationViewDetails}
      />

      <AmbassadorCertificateModal
        isOpen={certificateOpen}
        onClose={() => setCertificateOpen(false)}
        recipientName={displayName.toUpperCase()}
        obtainedDate={certificateDate}
        onDone={handleCertificateDone}
      />
    </div>
  );
}
