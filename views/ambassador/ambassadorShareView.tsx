"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  HowReferralsWorkModal,
  RecentReferralsSection,
  ReferralEmptyState,
  ReferralImpactCard,
  ReferralLinkCard,
  ShareGrowHeader,
} from "@/components/ambassador/AmbassadorShareComponents";
import { fetchAmbassadorReferrals } from "@/src/lib/ambassadors";
import { useRequireAmbassador } from "@/src/hooks/useRequireAmbassador";
import { useAmbassadorRoutes } from "@/components/ambassador/AmbassadorRoutesProvider";
import {
  filterReferrals,
  type AmbassadorReferralItem,
  type ReferralFilter,
  type ReferralImpactStats,
} from "@/src/lib/referrals";
import { shareReferralLink } from "@/lib/share";
import { showToast } from "@/lib/showNotification";

const EMPTY_STATS: ReferralImpactStats = {
  totalPeopleReferred: 0,
  activeThisMonth: 0,
  newCount: 0,
  activeCount: 0,
  pendingCount: 0,
  inactiveCount: 0,
};

function buildVanityShareUrl(displaySharePath: string): string {
  if (typeof window === "undefined") {
    return displaySharePath;
  }
  return `${window.location.origin}${displaySharePath}`;
}

export default function AmbassadorShareView() {
  const routes = useAmbassadorRoutes();
  const { isLoading: guardLoading, isAmbassador } = useRequireAmbassador();
  const [shareUrl, setShareUrl] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [displaySharePath, setDisplaySharePath] = useState("");
  const [referrals, setReferrals] = useState<AmbassadorReferralItem[]>([]);
  const [stats, setStats] = useState<ReferralImpactStats>(EMPTY_STATS);
  const [filter, setFilter] = useState<ReferralFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    if (guardLoading || !isAmbassador) return;

    fetchAmbassadorReferrals()
      .then((data) => {
        setShareUrl(data.shareUrl);
        setReferralCode(data.referralCode);
        setDisplaySharePath(data.displaySharePath);
        setReferrals(data.referrals);
        setStats(data.stats);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load referral data");
        showToast({ type: "error", message: "Failed to load referral data" });
      })
      .finally(() => setLoading(false));
  }, [guardLoading, isAmbassador]);

  const filteredReferrals = useMemo(
    () => filterReferrals(referrals, filter),
    [referrals, filter],
  );

  const vanityShareUrl = useMemo(
    () => (displaySharePath ? buildVanityShareUrl(displaySharePath) : shareUrl),
    [displaySharePath, shareUrl],
  );

  const hasReferrals = stats.totalPeopleReferred > 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(vanityShareUrl);
      setCopied(true);
      showToast({ type: "success", message: "Link copied!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ type: "error", message: "Could not copy link" });
    }
  };

  const handleShare = () => {
    void shareReferralLink(vanityShareUrl, referralCode);
  };

  if (guardLoading || loading || !isAmbassador) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-colour" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto px-4 py-8 text-center text-grey-2">
        <p>{error}</p>
        <button
          type="button"
          className="mt-4 text-primary-colour underline"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto pb-10">
      <ShareGrowHeader
        onInfoClick={() => setInfoOpen(true)}
        backHref={routes.dashboard}
      />

      <div className="space-y-5 pt-2">
        <ReferralLinkCard
          displaySharePath={displaySharePath}
          shareUrl={vanityShareUrl}
          referralCode={referralCode}
          copied={copied}
          onCopy={handleCopy}
        />

        {hasReferrals ? (
          <>
            <ReferralImpactCard stats={stats} />
            <RecentReferralsSection
              referrals={filteredReferrals}
              filter={filter}
              onFilterChange={setFilter}
            />
          </>
        ) : (
          <ReferralEmptyState onShare={handleShare} />
        )}
      </div>

      <HowReferralsWorkModal
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
    </div>
  );
}
