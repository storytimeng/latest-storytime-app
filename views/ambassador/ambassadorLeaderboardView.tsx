"use client";

import { useEffect, useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Avatar } from "@heroui/avatar";
import { Skeleton } from "@heroui/skeleton";
import { Magnetik_Medium } from "@/lib/font";
import { AmbassadorHeader } from "@/components/ambassador/AmbassadorHeader";
import {
  fetchAmbassadorLeaderboard,
  type AmbassadorType,
} from "@/src/lib/ambassadors";

const TIER_EMOJI: Record<string, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
};

export default function AmbassadorLeaderboardView() {
  const [tab, setTab] = useState<AmbassadorType>("campus");
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<
    Array<{
      rank: number;
      totalScore: number;
      tier: string;
      user: {
        firstName: string;
        lastName: string;
        penName?: string;
        avatar?: string;
      } | null;
    }>
  >([]);

  useEffect(() => {
    setLoading(true);
    fetchAmbassadorLeaderboard(tab)
      .then((data) => setEntries(data.leaderboard))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto pb-24">
      <AmbassadorHeader
        title="Ambassador Leaderboard"
        backHref="/ambassador/dashboard"
      />

      <div className="px-4 py-4">
        <Tabs
          selectedKey={tab}
          onSelectionChange={(key) => setTab(key as AmbassadorType)}
          variant="underlined"
          classNames={{
            tabList: "w-full",
            tab: "text-primary-colour",
            cursor: "bg-primary-colour",
          }}
        >
          <Tab key="campus" title="Campus" />
          <Tab key="community" title="Community" />
        </Tabs>
      </div>

      <div className="px-4 space-y-2">
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-white rounded-xl"
              >
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 flex-1 rounded" />
              </div>
            ))
        ) : entries.length === 0 ? (
          <p className="text-center text-grey-2 py-8 text-sm">
            No ambassadors on the leaderboard yet.
          </p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.rank}
              className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm"
            >
              <span
                className={`${Magnetik_Medium.className} w-8 text-center text-primary-colour`}
              >
                {entry.rank <= 3
                  ? ["🥇", "🥈", "🥉"][entry.rank - 1]
                  : entry.rank}
              </span>
              <Avatar
                src={entry.user?.avatar}
                name={
                  entry.user?.penName ||
                  `${entry.user?.firstName || ""} ${entry.user?.lastName || ""}`
                }
                size="sm"
              />
              <div className="flex-1">
                <p className="text-sm text-primary-colour">
                  {entry.user?.penName ||
                    `${entry.user?.firstName} ${entry.user?.lastName}`}
                </p>
                <p className="text-xs text-grey-3 capitalize">
                  {TIER_EMOJI[entry.tier]} {entry.tier}
                </p>
              </div>
              <span className="text-sm font-magnetik-medium text-primary-colour">
                {entry.totalScore}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
