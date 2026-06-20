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

export default function AmbassadorShareView() {
  const [shareUrl, setShareUrl] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [displaySharePath, setDisplaySharePath] = useState("");
  const [referrals, setReferrals] = useState<AmbassadorReferralItem[]>([]);
  const [stats, setStats] = useState<ReferralImpactStats>(EMPTY_STATS);
  const [filter, setFilter] = useState<ReferralFilter>("all");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    fetchAmbassadorReferrals()
      .then((data) => {
        setShareUrl(data.shareUrl);
        setReferralCode(data.referralCode);
        setDisplaySharePath(data.displaySharePath);
        setReferrals(data.referrals);
        setStats(data.stats);
      })
      .catch(() => {
        showToast({ type: "error", message: "Failed to load referral data" });
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredReferrals = useMemo(
    () => filterReferrals(referrals, filter),
    [referrals, filter],
  );

  const hasReferrals = stats.totalPeopleReferred > 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast({ type: "success", message: "Link copied!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ type: "error", message: "Could not copy link" });
    }
  };

  const handleShare = () => {
    void shareReferralLink(shareUrl, referralCode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-colour" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto pb-10">
      <ShareGrowHeader onInfoClick={() => setInfoOpen(true)} />

      <div className="space-y-5 pt-2">
        <ReferralLinkCard
          displaySharePath={displaySharePath}
          shareUrl={shareUrl}
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
