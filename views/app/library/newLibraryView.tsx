"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, HardDrive, Trash2 } from "lucide-react";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { StoryCard } from "@/components/reusables";
import { useReadingHistory } from "@/src/hooks/useReadingHistory";
import { useOfflineStories } from "@/src/hooks/useOfflineStories";
import { formatBytes } from "@/lib/offline/indexedDB";
import { usersControllerGetAllReadingProgress } from "@/src/client/sdk.gen";

const NewLibraryView = () => {
  const [activeTab, setActiveTab] = useState<"library" | "downloads">(
    "library"
  );
  const [page, setPage] = useState(1);
  const [readingProgress, setReadingProgress] = useState<Record<string, number>>({});
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch reading history with pagination
  const { history, isLoading, totalPages } = useReadingHistory(page, 20);

  // Fetch reading progress for all stories
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await usersControllerGetAllReadingProgress({
          query: { page: 1, limit: 100 },
        });
        
        if (!response.error && response.data) {
          // @ts-ignore
          const progressData = response.data?.data || response.data;
          const progressMap: Record<string, number> = {};
          
          if (Array.isArray(progressData)) {
            progressData.forEach((item: any) => {
              if (item.storyId && item.percentageRead !== undefined) {
                progressMap[item.storyId] = item.percentageRead;
              }
            });
          }
          
          setReadingProgress(progressMap);
        }
      } catch (error) {
        console.error('Error fetching reading progress:', error);
      }
    };

    if (activeTab === "library" && history.length > 0) {
      fetchProgress();
    }
  }, [activeTab, history]);

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
        isDeleted: true
      };
    }

    return {
      id: story.id,
      title: story.title,
      description: story.description,
      imageUrl: story.imageUrl,
      coverImage: story.imageUrl,
      author: story.author,
      genres: [], // Reading history doesn't include genres
      status: story.storyStatus,
      progress: readingProgress[story.id] || 0,
    };
  });

  // Map offline stories to match library story format for StoryCard
  const downloadedStories = offlineStories.map((offline) => ({
    id: offline.id,
    title: offline.title,
    description: offline.description,
    imageUrl: offline.coverImage,
    coverImage: offline.coverImage,
    author: offline.author,
    genres: offline.genres,
    status: offline.status,
    ...offline.metadata,
  }));

  const currentStories =
    activeTab === "library" ? libraryStories : downloadedStories;

  // Infinite scroll handler
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && !isLoading && page < totalPages) {
        setPage((prev) => prev + 1);
      }
    },
    [isLoading, page, totalPages]
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
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto pb-20">
      {/* Tabs */}
      <div className="px-4 pt-5 pb-4">
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
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-complimentary-colour rounded-full" />
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
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-complimentary-colour rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {((isLoading && activeTab === "library" && page === 1) ||
        (isLoadingOffline && activeTab === "downloads")) && (
        <div className="px-4">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-48 w-full bg-accent-colour animate-pulse rounded-lg" />
                <div className="h-4 w-3/4 bg-accent-colour animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-accent-colour animate-pulse rounded" />
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
            <div className="bg-accent-colour/50 rounded-lg p-4 flex items-center gap-3">
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
      {!(isLoading && page === 1) && !isLoadingOffline && (
        <div className="px-4">
          {currentStories.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                {currentStories.map((story: any) => (
                  <div key={story.id} className="relative">
                    <StoryCard story={story} hideStats={activeTab === "library"} />
                    {/* Show delete button for downloads */}
                    {activeTab === "downloads" && (
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          await deleteOfflineStory(story.id);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
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
                <div ref={observerTarget} className="py-4 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-complimentary-colour"></div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 bg-complimentary-colour/10 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-complimentary-colour" />
              </div>
              <h3
                className={`text-sm text-primary-colour text-center mb-2 ${Magnetik_Medium.className}`}
              >
                {activeTab === "library"
                  ? "No stories in library"
                  : "No downloaded stories"}
              </h3>
              <p
                className={`text-xs text-primary-shade-4 text-center mb-6 ${Magnetik_Regular.className}`}
              >
                {activeTab === "library"
                  ? "Start reading stories to build your library!"
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
