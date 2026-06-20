"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LeaderboardEmptyState,
  LeaderboardEntryCard,
  LeaderboardFilterCard,
  LeaderboardHeader,
  LeaderboardResetCard,
  LeaderboardSkeletonList,
  ViewMoreRankingsButton,
} from "@/components/ambassador/AmbassadorLeaderboardComponents";
import {
  fetchAmbassadorDashboard,
  fetchAmbassadorLeaderboard,
} from "@/src/lib/ambassadors";
import {
  getDefaultLeaderboardScope,
  LEADERBOARD_PAGE_SIZE,
  type AmbassadorLeaderboardEntry,
  type LeaderboardScope,
} from "@/src/lib/leaderboard";
import { useRequireAmbassador } from "@/src/hooks/useRequireAmbassador";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { Loader2 } from "lucide-react";
import { showToast } from "@/lib/showNotification";

export default function AmbassadorLeaderboardView() {
  const { isLoading: guardLoading, isAmbassador } = useRequireAmbassador();
  const { user } = useUserProfile();
  const [scope, setScope] = useState<LeaderboardScope>("campus");
  const [entries, setEntries] = useState<AmbassadorLeaderboardEntry[]>([]);
  const [nextResetDate, setNextResetDate] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [scopeReady, setScopeReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchAmbassadorDashboard()
      .then((dashboard) => {
        if (cancelled) return;
        setScope(getDefaultLeaderboardScope(dashboard.ambassador.type));
        setScopeReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setScopeReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loadLeaderboard = useCallback(
    async (nextScope: LeaderboardScope, offset = 0, append = false) => {
      if (offset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const data = await fetchAmbassadorLeaderboard({
          scope: nextScope,
          limit: LEADERBOARD_PAGE_SIZE,
          offset,
        });

        setEntries((current) =>
          append ? [...current, ...data.leaderboard] : data.leaderboard,
        );
        setNextResetDate(data.nextResetDate);
        setHasMore(data.hasMore);
      } catch {
        if (!append) {
          setEntries([]);
          setHasMore(false);
        }
        showToast({ type: "error", message: "Failed to load leaderboard" });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!scopeReady) return;
    void loadLeaderboard(scope, 0, false);
  }, [scope, scopeReady, loadLeaderboard]);

  const handleScopeChange = (nextScope: LeaderboardScope) => {
    if (nextScope === scope) return;
    setScope(nextScope);
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    void loadLeaderboard(scope, entries.length, true);
  };

  const showEmptyState = !loading && entries.length === 0;
  const currentUserId = user?.id;

  if (guardLoading || !isAmbassador) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-colour" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto pb-10">
      <LeaderboardHeader />

      <div className="space-y-4">
        <LeaderboardFilterCard
          scope={scope}
          onScopeChange={handleScopeChange}
        />

        {loading ? (
          <LeaderboardSkeletonList />
        ) : showEmptyState ? (
          <LeaderboardEmptyState />
        ) : (
          <div className="mx-4 space-y-2">
            {entries.map((entry) => (
              <LeaderboardEntryCard
                key={`${entry.ambassadorId}-${entry.rank}`}
                entry={entry}
                isCurrentUser={entry.user?.id === currentUserId}
              />
            ))}
          </div>
        )}

        {!loading && !showEmptyState && hasMore && (
          <ViewMoreRankingsButton
            loading={loadingMore}
            onClick={handleLoadMore}
          />
        )}

        {nextResetDate && (
          <LeaderboardResetCard nextResetDate={nextResetDate} />
        )}
      </div>
    </div>
  );
}
