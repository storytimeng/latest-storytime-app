"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Download,
  Filter,
  HardDrive,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { StoryCard } from "@/components/reusables";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { formatBytes } from "@/lib/offline/db";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";
import {
  useLibraryContent,
  type LibraryFilter,
  type LibraryTab,
} from "@/src/hooks/useLibraryContent";
import { DESKTOP_ROUTES } from "@/config/desktopRoutes";

const FILTER_OPTIONS: { id: LibraryFilter; label: string }[] = [
  { id: "all", label: "All stories" },
  { id: "in-progress", label: "In progress" },
  { id: "completed", label: "Completed" },
];

function storyHrefForDesktop(storyId: string, progress?: number) {
  return routes.storyResume(storyId, progress);
}

function DesktopLibraryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const isOnline = useOnlineStatus();

  const [activeTab, setActiveTab] = useState<LibraryTab>(
    tabParam === "downloads" ? "downloads" : "library",
  );
  const [filter, setFilter] = useState<LibraryFilter>("all");
  const [page, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    filterStories,
    isLoadingHistory,
    isLoadingOffline,
    totalPages,
    storageInfo,
    deleteOfflineStory,
    historyCount,
    downloadsCount,
  } = useLibraryContent(page, activeTab);

  const stories = filterStories(filter);
  const isLoading =
    activeTab === "library"
      ? isLoadingHistory && page === 1 && isOnline
      : isLoadingOffline;

  useEffect(() => {
    if (tabParam === "downloads") {
      setActiveTab("downloads");
    } else if (tabParam === "library" || !tabParam) {
      setActiveTab("library");
    }
  }, [tabParam]);

  const setTab = (tab: LibraryTab) => {
    setActiveTab(tab);
    setPage(1);
    setFilter("all");
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "downloads") {
      params.set("tab", "downloads");
    } else {
      params.delete("tab");
    }
    const query = params.toString();
    router.replace(
      query ? `${DESKTOP_ROUTES.library}?${query}` : DESKTOP_ROUTES.library,
    );
  };

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (
        target.isIntersecting &&
        activeTab === "library" &&
        !isLoadingHistory &&
        page < totalPages
      ) {
        setPage((prev) => prev + 1);
      }
    },
    [activeTab, isLoadingHistory, page, totalPages],
  );

  useEffect(() => {
    const element = observerTarget.current;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0 });
    if (element) observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver, stories.length]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:gap-8">
      {/* Filters sidebar */}
      <aside className="w-full shrink-0 lg:w-56 xl:w-64">
        <div className="rounded-2xl border border-black/10 bg-white p-4 lg:sticky lg:top-20">
          <p
            className={cn(
              "mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#361B17]/50",
              Magnetik_Medium.className,
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            Library
          </p>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setTab("library")}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                Magnetik_Medium.className,
                activeTab === "library"
                  ? "bg-primary-colour/10 text-primary-colour"
                  : "text-[#361B17]/80 hover:bg-black/[0.04]",
              )}
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span className="flex-1">Reading history</span>
              <span className="text-xs tabular-nums text-[#361B17]/50">
                {historyCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("downloads")}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                Magnetik_Medium.className,
                activeTab === "downloads"
                  ? "bg-primary-colour/10 text-primary-colour"
                  : "text-[#361B17]/80 hover:bg-black/[0.04]",
              )}
            >
              <Download className="h-4 w-4 shrink-0" />
              <span className="flex-1">Downloads</span>
              <span className="text-xs tabular-nums text-[#361B17]/50">
                {downloadsCount}
              </span>
            </button>
          </div>

          {activeTab === "library" && (
            <>
              <div className="my-4 border-t border-black/10" />
              <p
                className={cn(
                  "mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#361B17]/45",
                  Magnetik_Medium.className,
                )}
              >
                Filter
              </p>
              <div className="space-y-1">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFilter(option.id)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      Magnetik_Regular.className,
                      filter === option.id
                        ? "bg-[#361B17]/5 font-medium text-[#361B17]"
                        : "text-[#361B17]/70 hover:bg-black/[0.03]",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {activeTab === "downloads" && downloadsCount > 0 && (
            <>
              <div className="my-4 border-t border-black/10" />
              <div className="rounded-lg bg-[#FFFAF1] p-3">
                <div className="flex items-center gap-2 text-primary-colour">
                  <HardDrive className="h-4 w-4" />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      Magnetik_Medium.className,
                    )}
                  >
                    Storage
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-2 text-sm text-[#361B17]",
                    Magnetik_Bold.className,
                  )}
                >
                  {formatBytes(storageInfo.usage)}
                </p>
                <p className="mt-0.5 text-xs text-[#361B17]/60">
                  of {formatBytes(storageInfo.quota)} (
                  {storageInfo.percentUsed.toFixed(1)}%)
                </p>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="mb-6">
          <h2
            className={cn(
              "text-xl text-[#361B17] md:text-2xl",
              Magnetik_Bold.className,
            )}
          >
            {activeTab === "library" ? "My Library" : "My Downloads"}
          </h2>
          <p
            className={cn(
              "mt-1 text-sm text-[#361B17]/60",
              Magnetik_Regular.className,
            )}
          >
            {activeTab === "library"
              ? "Stories you've read — pick up where you left off."
              : "Stories saved for offline reading."}
          </p>
        </div>

        {activeTab === "library" && !isOnline && (
          <div className="mb-4">
            <OfflineIndicator />
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[4/5] animate-pulse rounded-xl bg-black/[0.06]" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-black/[0.06]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-black/[0.04]" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && (
          <>
            {stories.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                  {stories.map((story) => (
                    <div key={story.id} className="relative flex flex-col">
                      <StoryCard
                        story={
                          story as Parameters<typeof StoryCard>[0]["story"]
                        }
                        hideStats={activeTab === "library"}
                        className="w-full"
                        linkDisabled={Boolean(story.isDeleted)}
                        storyHref={storyHrefForDesktop(
                          story.id,
                          story.progress,
                        )}
                      />
                      {activeTab === "library" &&
                        (story.progress ?? 0) > 0 &&
                        !story.isDeleted && (
                          <div className="mt-1 px-0.5">
                            <div className="flex items-center justify-between text-[10px] text-[#361B17]/60">
                              <span>Progress</span>
                              <span>{Math.round(story.progress ?? 0)}%</span>
                            </div>
                            <div className="mt-1 h-1 overflow-hidden rounded-full bg-black/[0.08]">
                              <div
                                className="h-full rounded-full bg-primary-colour transition-all"
                                style={{
                                  width: `${Math.min(100, story.progress ?? 0)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      {activeTab === "downloads" && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            await deleteOfflineStory(story.id);
                          }}
                          className="absolute right-2 top-2 z-10 rounded-full bg-red-500 p-2 text-white shadow-lg transition-colors hover:bg-red-600"
                          title="Remove download"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {activeTab === "library" && page < totalPages && (
                  <div
                    ref={observerTarget}
                    className="flex justify-center py-8"
                  >
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-colour border-t-transparent" />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-colour/10">
                  <MessageCircle className="h-8 w-8 text-primary-colour" />
                </div>
                <h3
                  className={cn(
                    "text-base text-[#361B17]",
                    Magnetik_Medium.className,
                  )}
                >
                  {activeTab === "library"
                    ? filter === "all"
                      ? "No stories in your library yet"
                      : "No stories match this filter"
                    : "No downloaded stories"}
                </h3>
                <p
                  className={cn(
                    "mt-2 max-w-sm text-sm text-[#361B17]/60",
                    Magnetik_Regular.className,
                  )}
                >
                  {activeTab === "library"
                    ? filter === "all"
                      ? "Start reading on Home — stories you open will appear here."
                      : "Try a different filter or keep reading to update progress."
                    : "Download stories while reading to access them offline."}
                </p>
                {activeTab === "library" && filter === "all" && (
                  <Link
                    href={DESKTOP_ROUTES.home}
                    className={cn(
                      "mt-6 inline-flex rounded-lg bg-primary-colour px-4 py-2.5 text-sm text-white hover:bg-primary-shade-6",
                      Magnetik_Medium.className,
                    )}
                  >
                    Browse stories
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function LibraryFallback() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((i) => (
          <div
            key={i}
            className="aspect-[4/5] animate-pulse rounded-xl bg-black/[0.06]"
          />
        ))}
      </div>
    </div>
  );
}

export function DesktopLibraryView() {
  return (
    <Suspense fallback={<LibraryFallback />}>
      <DesktopLibraryContent />
    </Suspense>
  );
}
