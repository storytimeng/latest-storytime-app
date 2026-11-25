"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import useSWR from "swr";
import { MessageCircle, HardDrive, Trash2 } from "lucide-react";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { StoryCard, OfflineAwareStoryCard } from "@/components/reusables";
import { useReadingHistory } from "@/src/hooks/useReadingHistory";
import { useOfflineStories } from "@/src/hooks/useOfflineStories";
import { formatBytes } from "@/lib/offline/db";
import { usersControllerGetAllReadingProgress } from "@/src/client/sdk.gen";
import { useSearchParams } from "next/navigation";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";
import { useAuthGate } from "@/src/hooks/useAuthGate";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ensureValidToken } from "@/src/lib/tokenManager";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/+$/, "");

type LibraryTab = "library" | "liked" | "downloads";

function resolveTabParam(tabParam: string | null): LibraryTab {
  const normalized = tabParam?.trim().toLowerCase();
  if (normalized === "downloads") return "downloads";
  if (normalized === "liked") return "liked";
  return "library";
}

const NewLibraryView = () => {
  useAuthGate(true);
  const isOnline = useOnlineStatus();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<LibraryTab>(() =>
    resolveTabParam(tabParam),
  );
  const [page, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Update tab if URL param changes
  useEffect(() => {
    setActiveTab(resolveTabParam(tabParam));
  }, [tabParam]);

  // Fetch reading history with pagination
  const { history, isLoading, totalPages } = useReadingHistory(page, 20);

  // Fetch reading progress once via SWR (deduped) and unwrap { progress: [...] }
  const { data: readingProgress = {} } = useSWR<Record<string, number>>(
    activeTab === "library" && isOnline ? "/users/reading-progress?limit=100" : null,
    async () => {
      const response = await usersControllerGetAllReadingProgress({
        query: { page: 1, limit: 100 },
      });
      if (response.error || !response.data) return {};
      const raw = response.data as any;
      const list =
        raw?.data?.progress ??
        raw?.progress ??
        (Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []);
      const map: Record<string, number> = {};
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item?.storyId && item?.percentageRead !== undefined) {
            map[item.storyId] = Number(item.percentageRead) || 0;
          }
        }
      }
      return map;
    },
    { revalidateOnFocus: false },
  );

  // Fetch liked stories when Liked tab is active
  const { data: likedStoriesData = [], isLoading: isLoadingLiked } = useSWR<any[]>(
    activeTab === "liked" && isOnline ? "/users/liked-stories" : null,
    async () => {
      const token = await ensureValidToken();
      if (!token) return [];
      const res = await fetch(
        `${API_BASE}/users/liked-stories?page=1&limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) return [];
      const json = await res.json();
      const stories = json?.data?.stories ?? json?.stories ?? [];
      return Array.isArray(stories) ? stories : [];
    },
    { revalidateOnFocus: false },
  );

  // Fetch downloaded stories from IndexedDB
  const {
    offlineStories,
    isLoading: isLoadingOffline,
    storageInfo,
    deleteOfflineStory,
  } = useOfflineStories();

  // Map reading history to library story format
  const libraryStories = history.map((item: any) => {
    const story = item.story;

    // Fallback for null story (e.g. deleted stories)
    if (!story) {
      return {
        id: item.storyId || `deleted-${item.id}`,
        title: "Unavailable Story",
        description: "This story is no longer available.",
        imageUrl: "/images/storytime-fallback.png",
        coverImage: "/images/storytime-fallback.png",
        author: { penName: "Former Author" },
        genres: [],
        status: "deleted",
        progress: 0,
        isDeleted: true,
      };
    }

    return {
      id: story.id,
      title: story.title,
      description: story.description,
      imageUrl: story.imageUrl,
      coverImage: story.imageUrl,
      author: story.author,
      genres: story.genres || [],
      status: story.storyStatus,
      progress: readingProgress[story.id] || 0,
    };
  });

  // Map offline stories to match library story format for StoryCard
  // Map offline stories to match library story format for StoryCard
  const downloadedStories = offlineStories.map((offline) => ({
    id: offline.id,
    title: offline.title,
    description: offline.description,
    imageUrl: offline.coverImage,
    coverImage: offline.coverImage,
    coverImageBlob: offline.coverImageBlob, // NEW — carried through for offline rendering
    author: offline.author,
    genres: offline.genres,
    status: offline.status,
    ...offline.metadata,
  }));

  const likedStories = useMemo(
    () =>
      likedStoriesData.map((story: any) => ({
        id: story.id,
        title: story.title,
        description: story.description,
        imageUrl: story.imageUrl,
        coverImage: story.imageUrl,
        author: story.author,
        genres: story.genres || [],
        status: story.storyStatus,
        progress: readingProgress[story.id] || 0,
      })),
    [likedStoriesData, readingProgress],
  );

  const currentStories =
    activeTab === "library"
      ? libraryStories
      : activeTab === "liked"
        ? likedStories
        : downloadedStories;

  // Infinite scroll handler
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && !isLoading && page < totalPages) {
        setPage((prev) => prev + 1);
      }
    },
    [isLoading, page, totalPages],
  );

  useEffect(() => {
    const element = observerTarget.current;
    const option = { threshold: 0 };

    const observer = new IntersectionObserver(handleObserver, option);
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  return (
    <div className="pb-20 md:pb-6 min-h-screen bg-accent-shade-1">
      {/* Tabs */}
      <div className="px-4 md:px-6 lg:px-8 pt-5 pb-4">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("library")}
            className={`pb-3 text-sm relative ${
              activeTab === "library"
                ? `text-complimentary-colour ${Magnetik_Bold.className}`
                : `text-primary-shade-3 ${Magnetik_Regular.className}`
            }`}
          >
            My Library
            {activeTab === "library" && (
              <div className="right-0 bottom-0 left-0 absolute bg-complimentary-colour rounded-full h-1" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("liked")}
            className={`pb-3 text-sm relative ${
              activeTab === "liked"
                ? `text-complimentary-colour ${Magnetik_Bold.className}`
                : `text-primary-shade-3 ${Magnetik_Regular.className}`
            }`}
          >
            Liked
            {activeTab === "liked" && (
              <div className="right-0 bottom-0 left-0 absolute bg-complimentary-colour rounded-full h-1" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("downloads")}
            className={`pb-3 text-sm relative ${
              activeTab === "downloads"
                ? `text-complimentary-colour ${Magnetik_Bold.className}`
                : `text-primary-shade-3 ${Magnetik_Regular.className}`
            }`}
          >
            My Downloads
            {activeTab === "downloads" && (
              <div className="right-0 bottom-0 left-0 absolute bg-complimentary-colour rounded-full h-1" />
            )}
          </button>
        </div>
      </div>

      {/* Offline Indicator for Library / Liked Tabs */}
      {(activeTab === "library" || activeTab === "liked") && !isOnline && (
        <div className="px-4">
          <OfflineIndicator />
        </div>
      )}

      {/* Loading State */}
      {((isLoading && activeTab === "library" && page === 1 && isOnline) ||
        (isLoadingLiked && activeTab === "liked" && isOnline) ||
        (isLoadingOffline && activeTab === "downloads")) && (
        <div className="px-4">
          <div className="gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="rounded-lg w-full h-48 animate-pulse bg-accent-colour" />
                <div className="rounded w-3/4 h-4 animate-pulse bg-accent-colour" />
                <div className="rounded w-1/2 h-3 animate-pulse bg-accent-colour" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Storage Info for Downloads Tab */}
      {activeTab === "downloads" &&
        !isLoadingOffline &&
        downloadedStories.length > 0 && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-accent-colour/50">
              <HardDrive className="w-5 h-5 text-complimentary-colour" />
              <div className="flex-1">
                <p
                  className={`text-primary text-xs ${Magnetik_Medium.className}`}
                >
                  Storage Used
                </p>
                <p
                  className={`text-primary-shade-3 text-[10px] ${Magnetik_Regular.className}`}
                >
                  {formatBytes(storageInfo.usage)} of{" "}
                  {formatBytes(storageInfo.quota)} (
                  {storageInfo.percentUsed.toFixed(1)}%)
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-primary text-sm ${Magnetik_Bold.className}`}
                >
                  {downloadedStories.length}
                </p>
                <p
                  className={`text-primary-shade-3 text-[10px] ${Magnetik_Regular.className}`}
                >
                  {downloadedStories.length === 1 ? "story" : "stories"}
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Stories Grid */}
      {/* Show grid when: (library/liked tab + online + not loading) OR (downloads tab + not loading offline) */}
      {((activeTab === "library" && isOnline && !(isLoading && page === 1)) ||
        (activeTab === "liked" && isOnline && !isLoadingLiked) ||
        (activeTab === "downloads" && !isLoadingOffline)) && (
        <div className="px-4">
          {currentStories.length > 0 ? (
            <>
              <div className="gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {currentStories.map((story: any) => (
                  <div key={story.id} className="relative">
                    <OfflineAwareStoryCard
                      story={story}
                      hideStats={activeTab === "library"}
                      isOffline={activeTab === "downloads" && !isOnline}
                    />
                    {activeTab === "downloads" && (
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          await deleteOfflineStory(story.id);
                        }}
                        className="top-2 right-2 z-10 absolute bg-red-500 hover:bg-red-600 shadow-lg p-2 rounded-full text-white transition-colors"
                        title="Remove download"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Infinite scroll trigger */}
              {activeTab === "library" && page < totalPages && (
                <div ref={observerTarget} className="flex justify-center py-4">
                  <div className="border-complimentary-colour border-b-2 rounded-full w-6 h-6 animate-spin"></div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col justify-center items-center px-4 py-16">
              <div className="flex justify-center items-center bg-complimentary-colour/10 mb-4 rounded-full w-20 h-20">
                <MessageCircle className="w-10 h-10 text-complimentary-colour" />
              </div>
              <h3
                className={`text-sm text-primary-colour text-center mb-2 ${Magnetik_Medium.className}`}
              >
                {activeTab === "library"
                  ? "No stories in library"
                  : activeTab === "liked"
                    ? "No liked stories yet"
                    : "No downloaded stories"}
              </h3>
              <p
                className={`text-xs text-primary-shade-4 text-center mb-6 ${Magnetik_Regular.className}`}
              >
                {activeTab === "library"
                  ? "Start reading stories to build your library!"
                  : activeTab === "liked"
                    ? "Stories you like will appear here!"
                    : "Download stories to read them offline anytime!"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewLibraryView;
