"use client";
import { Link } from "@/components/AppLink";
import { useRouter } from "next/navigation";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  ArrowLeft,
  Share2,
  Play,
  Star,
  Download,
  Check,
  Edit,
  ChevronRight,
  Trash2,
  Eye,
  Heart,
  AlertCircle,
  WifiOff,
} from "lucide-react";
import { Magnetik_Regular, Magnetik_Bold } from "@/lib";
import { cn } from "@/lib";
import { genreCategoryPath } from "@/lib/genre";
import { getStoryCoverSrc } from "@/lib/storyCover";
import { IS_ANDROID } from "@/lib/platform";
import { rewriteForCapacitor } from "@/lib/linkRewrite";
import { StoryCoverImage } from "@/components/reusables/customUI";
import {
  useStory,
  useStoryLikes,
  useStoryComments,
  useStoryChapters,
  useStoryEpisodes,
  useAggregatedProgress,
} from "@/src/hooks/useStoryDetail";
import { Skeleton } from "@heroui/skeleton";
import { useDisclosure } from "@heroui/modal";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useOfflineStories } from "@/src/hooks/useOfflineStories";
import { showToast } from "@/lib/showNotification";
import { useUserStore } from "@/src/stores/useUserStore";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";
import { CollaboratorsModal } from "@/components/reusables/modals/CollaboratorsModal";
import { ImagePreviewModal } from "@/components/reusables/modals/ImagePreviewModal";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { CommentsSection } from "@/views/app/story/components/CommentsSection";
import { StoryOfflineEmptyState } from "@/views/app/story/components/StoryOfflineEmptyState";
import { shareStory } from "@/lib/share";
import { usePremiumFeatures } from "@/src/hooks/usePremiumFeatures";
import { usePremiumUpsell } from "@/src/hooks/usePremiumUpsell";
import { PremiumUpsellModal } from "@/components/reusables/PremiumUpsellModal";
import PremiumBanner from "@/components/reusables/customUI/PremiumBanner";
import { canReadExclusiveStory } from "@/src/lib/premiumUpsell";
import PageHeader from "@/components/reusables/customUI/pageHeader";
import { usePageInflight } from "@/hooks/usePageInflight";
import useSWR from "swr";
import { client } from "@/src/client/client.gen";

interface SingleStoryProps {
  storyId?: string;
}

type Tab = "episodes" | "details" | "reviews";
type Structure = "chapters" | "episodes" | "single";

interface DownloadableItem {
  id: string;
  title?: string;
  content?: string;
  chapterNumber?: number;
  episodeNumber?: number;
  updatedAt?: string;
}

interface DownloadPayload {
  id: string;
  title: string;
  content: string;
  number: number;
  updatedAt?: string;
}

interface OfflineFallback {
  story: any;
  chapters: any[];
  episodes: any[];
  coverObjectUrl?: string;
}

const READING_WPM = 200;
const MIN_CONTENT_LENGTH_TO_SKIP_REFETCH = 100;
const BATCH_PRESETS = [1, 5, 10, 25];

const formatReadingTime = (seconds: number): string => {
  if (!seconds) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${minutes}m`;
};

const stripHtml = (html?: string) =>
  (html || "").replace(/<[^>]*>/g, "").trim();

const fetchImageAsBlob = async (
  url?: string,
  signal?: AbortSignal,
): Promise<Blob | undefined> => {
  if (!url) return undefined;
  try {
    const res = await fetch(url, signal ? { signal } : undefined);
    if (!res.ok) return undefined;
    return await res.blob();
  } catch (error) {
    // Aborted downloads are expected when the user navigates
    // away mid-fetch; not an error from the consumer's POV.
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      (error as { name?: string }).name === "AbortError"
    ) {
      return undefined;
    }
    console.error("Failed to fetch cover image for offline storage:", error);
    return undefined;
  }
};

const unitLabel = (structure: Structure, count: number) => {
  const noun = structure === "chapters" ? "Chapter" : "Episode";
  return count === 1 ? noun : `${noun}s`;
};

const SingleStory = ({ storyId }: SingleStoryProps) => {
  // Page-scoped inflight registry. Every cover-image blob
  // download, batch download, and chunked chapter fetch below
  // registers its AbortController here, so a user leaving the
  // page mid-download doesn't leave behind a 3-10 MB blob that
  // lands in the cache (and the backend logs) after the page
  // is gone. Auto-cancels on unmount.
  const inflight = usePageInflight("single-story");

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { story: fetchedStory, isLoading } = useStory(storyId);
  const { likeCount, isLiked, toggleLike } = useStoryLikes(
    storyId,
    isAuthenticated(),
  );
  const {
    commentCount,
    comments,
    createComment,
    updateComment,
    deleteComment,
  } = useStoryComments(storyId);
  const { aggregatedData, mutate: mutateProgress } = useAggregatedProgress(
    storyId,
    isAuthenticated(),
  );
  const { user: storeUser } = useUserStore();
  const { openModal: openAuthModal } = useAuthModalStore();
  const router = useRouter();
  const { checkFeature } = usePremiumFeatures();
  const { requireFeature, upsellReason, closeUpsell, isUpsellOpen } =
    usePremiumUpsell();

  const [activeTab, setActiveTab] = useState<Tab>("episodes");
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showFab, setShowFab] = useState(false);

  const storyProgress = aggregatedData?.storyProgress;
  const aggregated = aggregatedData?.aggregated;
  const { scrollY } = useScroll();

  const {
    isStoryDownloaded,
    getOfflineStory,
    getDownloadedContent,
    downloadStory,
    downloadAdditionalContent,
    deleteOfflineStory,
    deleteOfflineContent,
    syncStoryIfNeeded,
    syncAllChapters,
    syncAllEpisodes,
  } = useOfflineStories();

  // --- Offline fallback -----------------------------------------------
  // The network fetch can fail for reasons that have nothing to do with
  // whether the device *itself* is online — the backend can be down,
  // slow, or unreachable while wifi still reports "connected". So we
  // never gate this on navigator.onLine; we simply check IndexedDB
  // whenever the network fetch has finished and produced nothing.
  const [offlineFallback, setOfflineFallback] =
    useState<OfflineFallback | null>(null);
  const [offlineCheckDone, setOfflineCheckDone] = useState(false);
  const [usingOfflineFallback, setUsingOfflineFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let createdObjectUrl: string | undefined;

    if (isLoading) {
      setOfflineCheckDone(false);
      return;
    }

    if (fetchedStory) {
      // Network succeeded — no need for the offline record this render.
      setUsingOfflineFallback(false);
      setOfflineCheckDone(true);
      return;
    }

    if (!storyId) {
      setOfflineCheckDone(true);
      return;
    }

    (async () => {
      const offline = await getOfflineStory(storyId);
      if (cancelled) return;

      if (!offline) {
        setOfflineFallback(null);
        setUsingOfflineFallback(false);
        setOfflineCheckDone(true);
        return;
      }

      const downloadedContent = await getDownloadedContent(
        storyId,
        offline.structure,
      );
      if (cancelled) return;

      if (offline.coverImageBlob) {
        createdObjectUrl = URL.createObjectURL(offline.coverImageBlob);
      }

      const reconstructed = {
        id: offline.storyId,
        title: offline.title,
        description: offline.description,
        imageUrl: createdObjectUrl ?? offline.coverImage,
        author: offline.author,
        genres: offline.genres,
        storyStatus: offline.status,
        chapter: offline.structure === "chapters",
        episodes:
          offline.structure === "episodes" ? downloadedContent : undefined,
        chapters:
          offline.structure === "chapters" ? downloadedContent : undefined,
        ...offline.metadata,
      };

      setOfflineFallback({
        story: reconstructed,
        chapters: offline.structure === "chapters" ? downloadedContent : [],
        episodes: offline.structure === "episodes" ? downloadedContent : [],
        coverObjectUrl: createdObjectUrl,
      });
      setUsingOfflineFallback(true);
      setOfflineCheckDone(true);
    })();

    return () => {
      cancelled = true;
      if (createdObjectUrl) URL.revokeObjectURL(createdObjectUrl);
    };
  }, [isLoading, fetchedStory, storyId, getOfflineStory, getDownloadedContent]);

  const effectiveStory = fetchedStory ?? offlineFallback?.story;

  useEffect(() => {
    router.prefetch("/home");
    effectiveStory?.genres?.forEach((genre: any) =>
      router.prefetch(genreCategoryPath(String(genre))),
    );
  }, [router, effectiveStory?.genres]);

  useEffect(
    () => scrollY.on("change", (latest) => setShowFab(latest > 400)),
    [scrollY],
  );

  const {
    isOpen: isCollaboratorsOpen,
    onOpen: onOpenCollaborators,
    onOpenChange: onCollaboratorsOpenChange,
  } = useDisclosure();
  const { isOpen: isImagePreviewOpen, onOpenChange: onImagePreviewOpenChange } =
    useDisclosure();

  const { data: ratingData, mutate: mutateRating } = useSWR(
    storyId && !usingOfflineFallback ? `story-rating-${storyId}` : null,
    async () => {
      const res = await client.get({ url: `/stories/${storyId}/rating` });
      return ((res?.data as any)?.data ?? res?.data) as
        | {
            averageRating?: number;
            ratingCount?: number;
            totalRatings?: number;
            userRating?: number | null;
          }
        | undefined;
    },
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [pendingRating, setPendingRating] = useState<number | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const currentUser = (
    storeUser && (storeUser as any).data
      ? (storeUser as any).data?.user
      : storeUser
  ) as any;

  const storyData = effectiveStory as any;
  const storyAuthorId = storyData?.authorId || effectiveStory?.author?.id;
  const currentAuthorId = currentUser?.authorId || currentUser?.id;
  const isAuthor =
    currentAuthorId && storyAuthorId && currentAuthorId === storyAuthorId;

  const displayLikeCount = likeCount || storyData?.likeCount || 0;
  const loadedCommentsCount = Array.isArray(comments)
    ? comments.reduce(
        (sum: number, c: any) =>
          sum + 1 + (Array.isArray(c.replies) ? c.replies.length : 0),
        0,
      )
    : undefined;
  const displayCommentCount =
    loadedCommentsCount !== undefined
      ? Math.max(commentCount || 0, loadedCommentsCount)
      : (storyData?.commentCount ?? commentCount ?? 0);

  const hasEpisodes = storyData?.episodes && storyData.episodes.length > 0;
  const hasChapters = storyData?.chapter === true;
  const structure: Structure = hasEpisodes
    ? "episodes"
    : hasChapters
      ? "chapters"
      : "single";
  const isSingleStory = structure === "single";

  const shouldFetchChapters =
    !usingOfflineFallback &&
    structure === "chapters" &&
    !storyData?.chapters?.length &&
    !isLoading;
  const shouldFetchEpisodes =
    !usingOfflineFallback &&
    structure === "episodes" &&
    !storyData?.episodes?.length &&
    !isLoading;

  const { chapters: fetchedChapters } = useStoryChapters(
    shouldFetchChapters ? storyId : undefined,
  );
  const { episodes: fetchedEpisodes } = useStoryEpisodes(
    shouldFetchEpisodes ? storyId : undefined,
  );

  const chapters = storyData?.chapters?.length
    ? storyData.chapters
    : fetchedChapters?.length
      ? fetchedChapters
      : (offlineFallback?.chapters ?? []);
  const episodes = storyData?.episodes?.length
    ? storyData.episodes
    : fetchedEpisodes?.length
      ? fetchedEpisodes
      : (offlineFallback?.episodes ?? []);
  const contentList = structure === "chapters" ? chapters : episodes;
  const hasContent = contentList && contentList.length > 0;

  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingItems, setDownloadingItems] = useState<Set<string>>(
    new Set(),
  );
  const [failedDownloads, setFailedDownloads] = useState<Set<string>>(
    new Set(),
  );
  const [downloadedContentIds, setDownloadedContentIds] = useState<Set<string>>(
    new Set(),
  );
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedContentIds, setSelectedContentIds] = useState<Set<string>>(
    new Set(),
  );

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const handleTouchStart = (id: string) => {
    longPressTimer.current = setTimeout(() => {
      if (!isSelectionMode) {
        setIsSelectionMode(true);
        toggleItemSelection(id);
      }
    }, 500);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const notDownloadedList = useMemo(() => {
    if (!contentList) return [];
    return contentList.filter(
      (item: any) =>
        !downloadedContentIds.has(item.id) &&
        !downloadedContentIds.has(item.chapterId ?? item.episodeId),
    );
  }, [contentList, downloadedContentIds]);

  const unreadNotDownloaded = useMemo(() => {
    return notDownloadedList.filter((item: any) => {
      const progress =
        structure === "episodes"
          ? aggregatedData?.episodeProgress?.find(
              (ep: any) => ep.episodeId === item.id,
            )
          : aggregatedData?.chapterProgress?.find(
              (ch: any) => ch.chapterId === item.id,
            );
      return !progress?.isCompleted;
    });
  }, [notDownloadedList, structure, aggregatedData]);

  const availablePresets = BATCH_PRESETS.filter(
    (n) => notDownloadedList.length >= n,
  );
  const remainingCount = notDownloadedList.length;
  const showAllRemainingOption =
    remainingCount > 0 && !availablePresets.includes(remainingCount);

  const resolveDownloadPayload = useCallback(
    async (
      item: DownloadableItem,
      index: number,
    ): Promise<DownloadPayload | null> => {
      let fullContent = item.content;
      let fullTitle = item.title;

      if (
        !fullContent ||
        fullContent.length < MIN_CONTENT_LENGTH_TO_SKIP_REFETCH
      ) {
        const {
          storiesControllerGetChapterById,
          storiesControllerGetEpisodeById,
        } = await import("@/src/client");

        if (structure === "chapters") {
          const response = await storiesControllerGetChapterById({
            path: { chapterId: item.id },
          });
          const chapter = (response.data as any)?.data;
          fullContent = chapter?.content || item.content;
          fullTitle = item.title || chapter?.title;
        } else {
          const response = await storiesControllerGetEpisodeById({
            path: { episodeId: item.id },
          });
          const episode = (response.data as any)?.data;
          fullContent = episode?.content || item.content;
          fullTitle = item.title || episode?.title;
        }
      }

      if (!stripHtml(fullContent)) return null;

      return {
        id: item.id,
        title: fullTitle || `${unitLabel(structure, 1)} ${index + 1}`,
        content: fullContent!,
        number:
          structure === "chapters"
            ? item.chapterNumber || index + 1
            : item.episodeNumber || index + 1,
        updatedAt: item.updatedAt,
      };
    },
    [structure],
  );

  const persistDownload = useCallback(
    async (payload: DownloadPayload[]) => {
      const alreadyDownloaded = await isStoryDownloaded(storyId!);
      if (!alreadyDownloaded) {
        // Track the cover-image blob fetch so an unmount mid-
        // download kills it instead of landing 3-10 MB into
        // IndexedDB after the page is gone.
        const coverController = new AbortController();
        inflight.track(coverController);
        let coverImageBlob: Blob | undefined;
        try {
          coverImageBlob = await fetchImageAsBlob(
            effectiveStory?.imageUrl,
            coverController.signal,
          );
          await downloadStory(effectiveStory, payload, structure, coverImageBlob);
        } finally {
          inflight.cleanup(coverController);
        }
      } else {
        await downloadAdditionalContent(storyId!, structure, payload);
      }
    },
    [
      downloadStory,
      downloadAdditionalContent,
      isStoryDownloaded,
      storyId,
      effectiveStory,
      structure,
      inflight,
    ],
  );

  const handleSingleDownload = async (
    item: DownloadableItem,
    index: number,
  ) => {
    if (!isAuthenticated()) return openAuthModal("login");
    if (!requireFeature("offlineDownload")) return;
    if (downloadingItems.has(item.id)) return;

    setFailedDownloads((prev) => {
      if (!prev.has(item.id)) return prev;
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
    setDownloadingItems((prev) => new Set(prev).add(item.id));

    try {
      const payload = await resolveDownloadPayload(item, index);
      if (!payload) throw new Error("Fetched content is empty");
      await persistDownload([payload]);
      setDownloadedContentIds((prev) => new Set(prev).add(item.id));
    } catch (error) {
      console.error(`Failed to download item ${item.id}:`, error);
      setFailedDownloads((prev) => new Set(prev).add(item.id));
    } finally {
      setDownloadingItems((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleDeleteSingleDownload = async (item: DownloadableItem) => {
    if (!storyId) return;
    const success = await deleteOfflineContent(
      storyId,
      item.id,
      structure === "chapters" ? "chapter" : "episode",
    );
    if (!success) return;

    setDownloadedContentIds((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
    setIsDownloaded(await isStoryDownloaded(storyId));
  };

  const performBatchDownload = async (itemsToDownload: DownloadableItem[]) => {
    if (!storyId || itemsToDownload.length === 0) return;
    setIsDownloading(true);

    try {
      const results = await Promise.all(
        itemsToDownload.map(async (item, idx) => {
          try {
            const payload = await resolveDownloadPayload(item, idx);
            return payload ?? { failed: true as const, id: item.id };
          } catch (error) {
            console.error(`Failed to fetch content for ${item.id}:`, error);
            return { failed: true as const, id: item.id };
          }
        }),
      );

      const succeeded = results.filter(
        (r): r is DownloadPayload => !("failed" in r),
      );
      const failedIds = results
        .filter((r): r is { failed: true; id: string } => "failed" in r)
        .map((r) => r.id);

      if (succeeded.length > 0) {
        await persistDownload(succeeded);
        setDownloadedContentIds((prev) => {
          const next = new Set(prev);
          succeeded.forEach((item) => next.add(item.id));
          return next;
        });
        setIsDownloaded(true);
      }

      if (failedIds.length > 0) {
        setFailedDownloads((prev) => {
          const next = new Set(prev);
          failedIds.forEach((id) => next.add(id));
          return next;
        });
      }

      setIsSelectionMode(false);
      setSelectedContentIds(new Set());
    } catch (error) {
      console.error("Bulk download error:", error);
      setFailedDownloads((prev) => {
        const next = new Set(prev);
        itemsToDownload.forEach((item) => next.add(item.id));
        return next;
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownload = async () => {
    if (!effectiveStory || !storyId) return;
    if (!isAuthenticated()) return openAuthModal("login");
    if (!requireFeature("offlineDownload")) return;

    setIsDownloading(true);
    try {
      let content: DownloadPayload[] = [];

      if (structure === "chapters" && Array.isArray(chapters)) {
        content = chapters.map((ch: any, idx: number) => ({
          id: ch.id,
          title: ch.title || `Chapter ${idx + 1}`,
          content: ch.content,
          number: idx + 1,
        }));
      } else if (structure === "episodes" && Array.isArray(episodes)) {
        content = episodes.map((ep: any, idx: number) => ({
          id: ep.id,
          title: ep.title || `Episode ${idx + 1}`,
          content: ep.content,
          number: idx + 1,
        }));
      } else {
        content = [
          {
            id: storyId,
            title: effectiveStory.title || "Untitled",
            content: effectiveStory.content || effectiveStory.description || "",
            number: 1,
          },
        ];
      }

      content = content.filter((c) => stripHtml(c.content));

      if (content.length === 0) {
        showToast({
          type: "warning",
          message: "No content available to download",
        });
        return;
      }

      // Track the cover-image blob fetch so an unmount mid-
      // download kills it instead of landing 3-10 MB into
      // IndexedDB after the page is gone.
      const coverController = new AbortController();
      inflight.track(coverController);
      try {
        const coverImageBlob = await fetchImageAsBlob(
          effectiveStory.imageUrl,
          coverController.signal,
        );
        await downloadStory(effectiveStory, content, structure, coverImageBlob);
        setIsDownloaded(true);
      } finally {
        inflight.cleanup(coverController);
      }
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRemoveDownload = async () => {
    if (!storyId) return;
    if (await deleteOfflineStory(storyId)) setIsDownloaded(false);
  };

  useEffect(() => {
    if (!storyId || structure === "single") return;
    (async () => {
      const downloadedItems = await getDownloadedContent(storyId, structure);
      const ids = new Set(
        downloadedItems.map((item: any) => item.chapterId ?? item.episodeId),
      );
      setDownloadedContentIds(ids);
    })();
  }, [storyId, structure, getDownloadedContent, isDownloaded]);

  const toggleSelectionMode = () => {
    setIsSelectionMode((v) => !v);
    setSelectedContentIds(new Set());
  };

  const toggleItemSelection = (id: string) => {
    setSelectedContentIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      if (!isSelectionMode && next.size > 0) setIsSelectionMode(true);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!contentList) return;
    setSelectedContentIds((prev) =>
      prev.size === contentList.length
        ? new Set()
        : new Set<string>(contentList.map((item: any) => item.id)),
    );
  };

  const handleBatchDownloadAction = async (key: string) => {
    if (!isAuthenticated()) return openAuthModal("login");
    if (!requireFeature("offlineDownload")) return;
    if (!contentList?.length) return;

    let itemsToDownload: any[] = [];

    if (key === "all") {
      itemsToDownload = notDownloadedList;
    } else if (key === "unread") {
      itemsToDownload = unreadNotDownloaded;
    } else {
      const count = parseInt(key.replace("next-", ""));
      if (!isNaN(count)) itemsToDownload = notDownloadedList.slice(0, count);
    }

    if (itemsToDownload.length === 0) {
      showToast({ type: "info", message: "No new items to download" });
      return;
    }

    await performBatchDownload(itemsToDownload);
  };

  const handleBulkDownload = async () => {
    if (!isAuthenticated()) return openAuthModal("login");
    if (!requireFeature("offlineDownload")) return;
    if (!storyId || selectedContentIds.size === 0) return;
    await performBatchDownload(
      contentList.filter((item: any) => selectedContentIds.has(item.id)),
    );
  };

  const handleBulkDelete = async () => {
    if (!storyId || selectedContentIds.size === 0) return;
    try {
      for (const id of selectedContentIds) {
        await deleteOfflineContent(
          storyId,
          id,
          structure === "chapters" ? "chapter" : "episode",
        );
      }
      setDownloadedContentIds((prev) => {
        const next = new Set(prev);
        selectedContentIds.forEach((id) => next.delete(id));
        return next;
      });
      setIsSelectionMode(false);
      setSelectedContentIds(new Set());
      setIsDownloaded(await isStoryDownloaded(storyId));
    } catch (error) {
      console.error("Bulk delete error:", error);
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (!storyId || selectedContentIds.size === 0) return;
    try {
      const {
        usersControllerUpdateChapterProgress,
        usersControllerUpdateEpisodeProgress,
      } = await import("@/src/client");

      await Promise.all(
        Array.from(selectedContentIds).map((id) => {
          const body = { percentageRead: 100, isCompleted: true };
          return structure === "chapters"
            ? usersControllerUpdateChapterProgress({
                path: { storyId, chapterId: id },
                body,
              })
            : usersControllerUpdateEpisodeProgress({
                path: { storyId, episodeId: id },
                body,
              });
        }),
      );

      setIsSelectionMode(false);
      setSelectedContentIds(new Set());
      mutateProgress();
    } catch (error) {
      console.error("Bulk mark as read error:", error);
    }
  };

  // Sync + downloaded-status check — skip entirely when we're already
  // rendering from the offline fallback (there's nothing fresh to sync
  // against; the "server" here IS the offline copy).
  useEffect(() => {
    if (!storyId || !effectiveStory || usingOfflineFallback) return;
    (async () => {
      const downloaded = await isStoryDownloaded(storyId);
      setIsDownloaded(downloaded);
      if (!downloaded) return;

      await syncStoryIfNeeded(storyId, effectiveStory);
      if (chapters?.length) await syncAllChapters(storyId, chapters);
      else if (episodes?.length) await syncAllEpisodes(storyId, episodes);
    })();
  }, [
    storyId,
    effectiveStory,
    usingOfflineFallback,
    chapters,
    episodes,
    isStoryDownloaded,
    syncStoryIfNeeded,
    syncAllChapters,
    syncAllEpisodes,
  ]);

  const downloadMenuItems = useMemo(() => {
    const items: { key: string; label: string }[] = availablePresets.map(
      (n) => ({
        key: `next-${n}`,
        label: `Next ${n} ${unitLabel(structure, n)}`,
      }),
    );
    if (unreadNotDownloaded.length > 0) {
      items.push({
        key: "unread",
        label: `Download Unread (${unreadNotDownloaded.length})`,
      });
    }
    if (showAllRemainingOption) {
      items.push({ key: "all", label: `All Remaining (${remainingCount})` });
    }
    return items;
  }, [
    availablePresets,
    unreadNotDownloaded.length,
    showAllRemainingOption,
    remainingCount,
    structure,
  ]);

  // When rendering from the offline fallback, everything we have IS
  // downloaded — reflect that immediately instead of waiting on the
  // sync effect above (which we intentionally skip in this mode).
  useEffect(() => {
    if (usingOfflineFallback) setIsDownloaded(true);
  }, [usingOfflineFallback]);

  const continueTarget = useMemo(() => {
    if (!contentList?.length) return null;
    if (!storyProgress) return contentList[0];

    const lastReadIndex =
      structure === "chapters"
        ? (storyProgress as any).lastReadChapter
        : (storyProgress as any).lastReadEpisode;
    if (!lastReadIndex) return contentList[0];

    const lastReadItem = contentList[lastReadIndex - 1];
    if (!lastReadItem) return contentList[0];

    const progressList =
      structure === "chapters"
        ? aggregatedData?.chapterProgress
        : aggregatedData?.episodeProgress;
    const itemProgress = progressList?.find((p: any) =>
      structure === "chapters"
        ? p.chapterId === lastReadItem.id
        : p.episodeId === lastReadItem.id,
    );

    return itemProgress?.isCompleted && lastReadIndex < contentList.length
      ? contentList[lastReadIndex]
      : lastReadItem;
  }, [storyProgress, contentList, structure, aggregatedData]);

  const isExclusive = Boolean(storyData?.onlyOnStorytime);
  const isExclusiveLocked =
    isExclusive && !isAuthor && !checkFeature("exclusiveStories");

  const buildReadUrl = useCallback(
    (contentId?: string) => {
      const targetId =
        contentId ??
        continueTarget?.id ??
        (hasContent ? contentList[0]?.id : undefined);
      const rawUrl = targetId
        ? `/story/${storyId}/read?${structure === "chapters" ? "chapterId" : "episodeId"}=${targetId}`
        : `/story/${storyId}/read`;
      return IS_ANDROID ? rewriteForCapacitor(rawUrl) : rawUrl;
    },
    [continueTarget?.id, contentList, hasContent, storyId, structure],
  );

  const handleStartReading = useCallback(
    (contentId?: string) => {
      if (!isAuthenticated()) return openAuthModal("login");

      if (
        isExclusive &&
        !canReadExclusiveStory(
          { onlyOnStorytime: true, authorId: storyAuthorId },
          {
            isPremium: checkFeature("exclusiveStories"),
            userId: currentUser?.id,
          },
        )
      ) {
        requireFeature("exclusiveStory");
        return;
      }

      router.push(buildReadUrl(contentId));
    },
    [
      buildReadUrl,
      checkFeature,
      currentUser?.id,
      isAuthenticated,
      isExclusive,
      openAuthModal,
      requireFeature,
      router,
      storyAuthorId,
    ],
  );

  useEffect(() => {
    if (isSingleStory && activeTab === "episodes") setActiveTab("details");
  }, [isSingleStory, activeTab]);

  const handleReviewSubmit = async () => {
    if (!reviewText.trim() || !storyId) return;
    if (!isAuthenticated()) {
      openAuthModal("login");
      return;
    }
    setIsSubmittingReview(true);
    try {
      await createComment(reviewText);
      setReviewText("");
    } catch (error: any) {
      if (
        error?.statusCode === 401 ||
        error?.status === 401 ||
        error?.response?.status === 401 ||
        String(error?.message || "").toLowerCase().includes("authentication") ||
        String(error?.message || "").toLowerCase().includes("unauthorized")
      ) {
        openAuthModal("login");
        return;
      }
      showToast({
        type: "error",
        message: error?.message || "Failed to post review",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const stillResolving = isLoading || (!fetchedStory && !offlineCheckDone);

  if (stillResolving) {
    return (
      <div className="relative pb-20 min-h-screen bg-accent-shade-1">
        <div className="relative w-full h-[55vh] min-h-[320px] max-h-[420px] overflow-hidden">
          <Skeleton className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t to-transparent from-accent-shade-1 via-accent-shade-1/40" />
          <div className="top-0 right-0 left-0 z-20 absolute px-4 pt-6">
            <div className="flex justify-between items-center">
              <Skeleton className="rounded-full w-10 h-10" />
              <div className="flex gap-2">
                <Skeleton className="rounded-full w-10 h-10" />
                <Skeleton className="rounded-full w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
        <div className="z-10 relative -mt-16 px-4">
          <div className="flex gap-2 mb-3">
            <Skeleton className="rounded w-24 h-6" />
            <Skeleton className="rounded w-20 h-6" />
          </div>
          <Skeleton className="mb-2 rounded-lg w-3/4 h-8" />
          <Skeleton className="my-4 rounded-full w-full h-14" />
          <div className="flex gap-2 mb-4">
            <Skeleton className="rounded-md w-20 h-6" />
            <Skeleton className="rounded-md w-16 h-6" />
            <Skeleton className="rounded-md w-16 h-6" />
            <Skeleton className="rounded-md w-20 h-6" />
          </div>
          <Skeleton className="mb-4 rounded-md w-full h-12" />
          <Skeleton className="mb-4 rounded-md w-48 h-5" />
        </div>
        <div className="flex gap-8 px-4 py-4 border-primary/5 border-b">
          <Skeleton className="rounded-md w-20 h-6" />
          <Skeleton className="rounded-md w-16 h-6" />
          <Skeleton className="rounded-md w-16 h-6" />
        </div>
        <div className="space-y-4 px-4 py-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="rounded-full w-10 h-10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="rounded-md w-3/4 h-4" />
                <Skeleton className="rounded-md w-1/2 h-3" />
              </div>
              <Skeleton className="rounded-full w-8 h-8" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!effectiveStory) {
    return <StoryOfflineEmptyState backLink="/home" />;
  }

  type ExtendedAuthorDto = typeof effectiveStory.author & {
    firstName?: string;
    lastName?: string;
    penName?: string;
  };
  const author = effectiveStory.author as ExtendedAuthorDto;
  const displayImage = getStoryCoverSrc(effectiveStory.imageUrl);
  const status = storyData.storyStatus || "Ongoing";
  const viewCount = storyData.viewCount || 0;

  const starRating = Number(ratingData?.averageRating ?? 0);
  const totalRatings = Number(
    ratingData?.ratingCount ?? ratingData?.totalRatings ?? 0,
  );
  const userRating = ratingData?.userRating ?? null;
  const displayedStars =
    hoverRating ?? pendingRating ?? userRating ?? starRating;
  const fullStars = Math.floor(starRating);
  const hasHalfStar = starRating % 1 >= 0.5;

  const handleRateStory = async (value: number) => {
    if (!storyId) return;
    if (!isAuthenticated()) {
      openAuthModal("login");
      return;
    }
    if (isSubmittingRating) return;
    setPendingRating(value);
    setIsSubmittingRating(true);
    try {
      const res = await client.post({
        url: `/stories/${storyId}/rate`,
        body: { rating: value },
        headers: { "Content-Type": "application/json" },
      });
      const status =
        (res as any)?.response?.status ?? (res as any)?.error?.statusCode;
      if (status === 401) {
        setPendingRating(null);
        openAuthModal("login");
        return;
      }
      if ((res as any)?.error) {
        throw new Error(
          (res as any)?.error?.message || "Could not save your rating.",
        );
      }
      const updated = ((res?.data as any)?.data ?? res?.data) as
        | {
            averageRating?: number;
            ratingCount?: number;
            totalRatings?: number;
            userRating?: number | null;
          }
        | undefined;
      if (updated) {
        await mutateRating(updated, false);
      } else {
        await mutateRating();
      }
      setPendingRating(null);
      showToast({
        type: "success",
        message: `Rated ${value} star${value > 1 ? "s" : ""}`,
      });
    } catch (err: any) {
      setPendingRating(null);
      if (
        err?.statusCode === 401 ||
        err?.status === 401 ||
        String(err?.message || "").toLowerCase().includes("authentication")
      ) {
        openAuthModal("login");
        return;
      }
      showToast({
        type: "error",
        message: err?.message || "Could not save your rating. Please try again.",
      });
    } finally {
      setIsSubmittingRating(false);
    }
  };
  const collaborators = storyData.collaborate as string[] | null;

  return (
    <div className="relative pb-20 min-h-screen bg-accent-shade-1">
      {usingOfflineFallback && (
        <div className="top-0 z-40 sticky flex justify-center items-center gap-2 bg-amber-600 py-2 font-medium text-white text-xs">
          <WifiOff size={14} />
          <span>
            Showing downloaded version... couldn't reach the server...
          </span>
        </div>
      )}

      <CollaboratorsModal
        isOpen={isCollaboratorsOpen}
        onOpenChange={onCollaboratorsOpenChange}
        author={author}
        collaborators={collaborators}
      />

      <ImagePreviewModal
        isOpen={isImagePreviewOpen}
        onOpenChange={onImagePreviewOpenChange}
        imageUrl={displayImage}
        altText={effectiveStory.title}
        layoutId={`story-image-${storyId}`}
      />

      <div className="relative w-full h-[55vh] min-h-[320px] max-h-[420px] overflow-hidden">
        <StoryCoverImage
          src={effectiveStory.imageUrl}
          alt={effectiveStory.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-0% via-8% to-15% to-transparent from-accent-shade-1 via-accent-shade-1/70" />

        <div className="top-0 right-0 left-0 z-20 absolute px-4 pt-6">
          <div className="flex justify-between items-center">
            <Link
              href="/home"
              className="bg-black/30 hover:bg-black/40 backdrop-blur-md p-2 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-white" />
            </Link>
            <div className="flex items-center gap-2">
              {usingOfflineFallback ? (
                <div
                  className="flex justify-center items-center bg-black/30 backdrop-blur-md p-2 rounded-full"
                  title="Downloaded"
                >
                  <Check size={24} className="text-green-400" />
                </div>
              ) : !isSingleStory ? (
                remainingCount === 0 ? (
                  <div
                    className="flex justify-center items-center bg-black/30 backdrop-blur-md p-2 rounded-full"
                    title="Everything is downloaded"
                  >
                    <Check size={24} className="text-green-400" />
                  </div>
                ) : (
                  <Dropdown>
                    <DropdownTrigger>
                      <button className="bg-black/30 hover:bg-black/40 backdrop-blur-md p-2 rounded-full transition-colors">
                        <Download size={24} className="text-white" />
                      </button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Download Options"
                      items={downloadMenuItems}
                      onAction={(key) =>
                        handleBatchDownloadAction(key as string)
                      }
                    >
                      {(item) => (
                        <DropdownItem key={item.key}>{item.label}</DropdownItem>
                      )}
                    </DropdownMenu>
                  </Dropdown>
                )
              ) : (
                <button
                  onClick={isDownloaded ? handleRemoveDownload : handleDownload}
                  disabled={isDownloading}
                  className="bg-black/30 hover:bg-black/40 backdrop-blur-md p-2 rounded-full transition-colors"
                >
                  {isDownloading ? (
                    <div className="border-2 border-white border-t-transparent rounded-full w-6 h-6 animate-spin" />
                  ) : isDownloaded ? (
                    <Check size={24} className="text-green-400" />
                  ) : (
                    <Download size={24} className="text-white" />
                  )}
                </button>
              )}
              <button
                onClick={toggleLike}
                disabled={usingOfflineFallback}
                className="bg-black/30 hover:bg-black/40 disabled:opacity-40 backdrop-blur-md p-2 rounded-full transition-colors"
              >
                <Heart
                  size={24}
                  className={cn(
                    "transition-colors",
                    isLiked ? "fill-red-500 text-red-500" : "text-white",
                  )}
                />
              </button>
              <button
                onClick={async () => {
                  const success = await shareStory(
                    storyId || "",
                    effectiveStory.title,
                    effectiveStory.description,
                  );
                  showToast(
                    success
                      ? {
                          message: "Link copied to clipboard!",
                          type: "success",
                        }
                      : { message: "Failed to share story", type: "error" },
                  );
                }}
                className="bg-black/30 hover:bg-black/40 backdrop-blur-md p-2 rounded-full transition-colors"
              >
                <Share2 size={24} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="z-10 relative -mt-16 px-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {isExclusive && (
            <span className="inline-flex items-center bg-complimentary-colour shadow-sm px-2.5 py-1 rounded font-bold text-[10px] text-white uppercase tracking-wider">
              Only on Storytime
            </span>
          )}
          {effectiveStory?.trigger && (
            <span className="inline-flex items-center gap-1 bg-red-600 shadow-sm px-2.5 py-1 rounded font-bold text-[10px] text-white uppercase tracking-wider">
              18+
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider",
              status === "complete"
                ? "bg-green-500/20 text-green-500"
                : "bg-complimentary-colour/20 text-complimentary-colour",
            )}
          >
            {status === "complete" && <Check size={10} />}
            {status === "complete" ? "Completed" : "Ongoing"}
          </span>
        </div>

        <h1
          className={cn(
            "mb-2 font-bold text-primary text-2xl leading-tight",
            Magnetik_Bold.className,
          )}
        >
          {effectiveStory.title}
        </h1>

        <button
          onClick={() => handleStartReading()}
          className="flex justify-center items-center gap-2.5 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 my-4 py-4 rounded-full w-full font-bold text-white text-base active:scale-[0.98] transition-all"
        >
          <Play size={20} className="fill-current" />
          <span>
            {isExclusiveLocked
              ? "Unlock with Premium"
              : continueTarget && storyProgress
                ? `Play ${structure === "chapters" ? "Chap" : "Ep"}-${
                    continueTarget.number ||
                    (structure === "chapters"
                      ? continueTarget.chapterNumber
                      : continueTarget.episodeNumber)
                  }`
                : isSingleStory
                  ? "Read Story"
                  : `Play ${structure === "chapters" ? "Chap" : "Ep-"}1`}
          </span>
        </button>

        {isExclusiveLocked && (
          <PremiumBanner
            title="Unlock exclusive stories"
            subtitle="Premium members read Only on Storytime fiction"
            emoji="👑"
            className="mt-0 mb-4"
          />
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4 text-primary/70 text-xs">
          <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-md">
            <Eye size={12} className="text-primary/60" />
            <span className="font-medium text-primary">
              {viewCount >= 1000000
                ? `${(viewCount / 1000000).toFixed(1)}M`
                : viewCount >= 1000
                  ? `${(viewCount / 1000).toFixed(1)}K`
                  : viewCount}{" "}
              views
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-md">
            <Star
              size={12}
              className="fill-current text-complimentary-colour"
            />
            <span className="font-medium text-primary">
              {displayLikeCount} likes
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-md">
            <Star size={12} className="fill-current text-yellow-500" />
            <span className="font-medium text-primary">
              {starRating.toFixed(1)}
            </span>
          </div>
          {effectiveStory.genres?.[0] && (
            <span className="bg-white/50 px-2 py-1 rounded-md font-medium text-primary">
              {effectiveStory.genres[0]}
            </span>
          )}
        </div>

        <div className="mb-4">
          <p
            className={cn(
              "text-primary/70 text-sm line-clamp-2 leading-relaxed",
              Magnetik_Regular.className,
            )}
          >
            {effectiveStory.description}
          </p>
          {effectiveStory.description &&
            effectiveStory.description.length > 100 && (
              <button
                onClick={() => setActiveTab("details")}
                className="mt-1 font-medium text-complimentary-colour text-sm"
              >
                More
              </button>
            )}
        </div>

        <button
          onClick={onOpenCollaborators}
          className="flex items-center gap-2 mb-4 text-primary/50 hover:text-primary/70 text-xs uppercase tracking-wider transition-colors"
        >
          <span className="font-medium">Show Writers & Cast</span>
          <span className="font-bold text-primary/80 normal-case">
            {author?.penName || author?.name || "Unknown"}
            {collaborators &&
              collaborators.length > 0 &&
              ` and ${collaborators.length} more`}
          </span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="top-0 z-30 sticky backdrop-blur-xl px-4 border-white/5 border-b bg-accent-shade-1/95">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          {!isSingleStory && (
            <button
              onClick={() => setActiveTab("episodes")}
              className={cn(
                "relative py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors",
                activeTab === "episodes"
                  ? "text-primary border-complimentary-colour"
                  : "text-primary/40 border-transparent hover:text-primary/60",
              )}
            >
              {structure === "chapters" ? "Chapters" : "Episodes"}
              <span className="bg-white/10 opacity-80 ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]">
                {contentList?.length || 0}
              </span>
            </button>
          )}
          <button
            onClick={() => setActiveTab("details")}
            className={cn(
              "py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors",
              activeTab === "details"
                ? "text-primary border-complimentary-colour"
                : "text-primary/40 border-transparent hover:text-primary/60",
            )}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={cn(
              "py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors",
              activeTab === "reviews"
                ? "text-primary border-complimentary-colour"
                : "text-primary/40 border-transparent hover:text-primary/60",
            )}
          >
            Reviews
            <span className="bg-white/10 opacity-80 ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]">
              {displayCommentCount}
            </span>
          </button>
        </div>
      </div>

      <div className="px-4 py-6">
        {activeTab === "episodes" && !isSingleStory && (
          <div className="space-y-4">
            {aggregated && aggregated.overallPercentage > 0 && (
              <div className="bg-complimentary-colour/5 mb-6 p-4 border border-complimentary-colour/20 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-primary text-sm">
                    Reading Progress
                  </span>
                  <span className="font-bold text-complimentary-colour text-xs">
                    {Math.round(aggregated.overallPercentage)}%
                  </span>
                </div>
                <div className="bg-white/10 rounded-full w-full h-2 overflow-hidden">
                  <div
                    className="bg-complimentary-colour rounded-full h-full transition-all duration-500"
                    style={{ width: `${aggregated.overallPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-primary/60 text-xs">
                  <span>
                    {structure === "chapters"
                      ? `${aggregated.completedChapters} of ${aggregated.totalChapters} chapters`
                      : `${aggregated.completedEpisodes} of ${aggregated.totalEpisodes} episodes`}{" "}
                    completed
                  </span>
                  {aggregated.totalReadingTimeSeconds > 0 && (
                    <span>
                      {formatReadingTime(aggregated.totalReadingTimeSeconds)}{" "}
                      read
                    </span>
                  )}
                </div>
                {(storyProgress?.lastReadChapter ||
                  storyProgress?.lastReadEpisode) && (
                  <div className="mt-1 text-primary/50 text-xs">
                    Last: {structure === "chapters" ? "Chapter" : "Episode"}{" "}
                    {storyProgress.lastReadChapter ||
                      storyProgress.lastReadEpisode}
                  </div>
                )}
              </div>
            )}

            {downloadedContentIds.size > 0 && !usingOfflineFallback && (
              <div className="flex items-center gap-2 mb-2 text-primary/50 text-xs">
                <Check size={12} className="text-green-500" />
                <span>
                  {downloadedContentIds.size} of {contentList?.length || 0}{" "}
                  {structure === "chapters" ? "chapters" : "episodes"}{" "}
                  downloaded
                </span>
              </div>
            )}

            <div className="flex justify-between items-center mb-2 font-medium text-primary/40 text-xs uppercase tracking-wider">
              <div className="flex items-center gap-4">
                <span>
                  All {structure === "chapters" ? "Chapters" : "Episodes"}
                </span>
                {isSelectionMode && (
                  <button
                    onClick={toggleSelectAll}
                    className="text-primary hover:text-white transition-colors"
                  >
                    {selectedContentIds.size === contentList.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectionMode}
                  className="text-primary hover:text-white transition-colors"
                >
                  {isSelectionMode ? "Cancel" : "Select"}
                </button>
                <button className="text-complimentary-colour hover:text-complimentary-colour/80 transition-colors">
                  Sort: Oldest
                </button>
              </div>
            </div>

            {contentList?.map((item: any, index: number) => {
              const isSelected = selectedContentIds.has(item.id);
              const isItemDownloaded =
                usingOfflineFallback || downloadedContentIds.has(item.id);
              const isItemDownloading = downloadingItems.has(item.id);

              const itemProgress =
                structure === "episodes"
                  ? aggregatedData?.episodeProgress?.find(
                      (ep: any) => ep.episodeId === item.id,
                    )
                  : aggregatedData?.chapterProgress?.find(
                      (ch: any) => ch.chapterId === item.id,
                    );

              const percentageRead = itemProgress
                ? parseFloat(itemProgress.percentageRead)
                : 0;
              const readingTime = itemProgress?.readingTimeSeconds || 0;
              const isCompleted = itemProgress?.isCompleted || false;
              const isRead = percentageRead > 0 || isCompleted;

              const content = item.content || item.body;
              const wordCount =
                item.totalWords ||
                (content ? content.trim().split(/\s+/).length : 0);
              const minsRead =
                wordCount > 0 ? Math.ceil(wordCount / READING_WPM) : 0;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative flex items-center gap-4 -mx-2 px-2 py-3 rounded-xl transition-colors select-none",
                    isSelected
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-white/5",
                    isRead && !isSelected ? "opacity-50" : "",
                  )}
                  onClick={() =>
                    isSelectionMode && toggleItemSelection(item.id)
                  }
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!isSelectionMode) {
                      setIsSelectionMode(true);
                      toggleItemSelection(item.id);
                    }
                  }}
                  onPointerDown={() => handleTouchStart(item.id)}
                  onPointerUp={handleTouchEnd}
                  onPointerLeave={handleTouchEnd}
                >
                  {isSelectionMode ? (
                    <div
                      className={cn(
                        "flex justify-center items-center border-2 rounded-md w-6 h-6 transition-colors",
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : "border-white/20",
                      )}
                    >
                      {isSelected && <Check size={14} />}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartReading(item.id)}
                      className="z-10 absolute inset-0"
                      aria-label={`Read ${item.title || "part"}`}
                    />
                  )}

                  <div
                    className={cn(
                      "relative flex justify-center items-center shadow-sm rounded-full w-10 h-10 transition-all",
                      isCompleted
                        ? "bg-green-500/20 text-green-500"
                        : percentageRead > 0
                          ? "bg-complimentary-colour/20 text-complimentary-colour"
                          : "bg-primary/10 text-primary/60 group-hover:bg-complimentary-colour group-hover:text-white",
                    )}
                  >
                    {isCompleted ? (
                      <Check size={14} className="font-bold" />
                    ) : (
                      <Play size={14} className="fill-current ml-0.5" />
                    )}
                    {percentageRead > 0 && !isCompleted && (
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="20"
                          cy="20"
                          r="18"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray={`${percentageRead * 1.13} 113`}
                          className="text-complimentary-colour"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-primary group-hover:text-complimentary-colour text-sm truncate transition-colors">
                        {item.title ||
                          `${structure === "chapters" ? "Chapter" : "Episode"} ${index + 1}`}
                      </h3>
                      {percentageRead > 0 && !isCompleted && (
                        <span className="font-medium text-complimentary-colour text-xs">
                          {Math.round(percentageRead)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-primary/40 text-xs">
                      <span>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : ""}
                      </span>
                      {readingTime > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-complimentary-colour/70">
                            {formatReadingTime(readingTime)} read
                          </span>
                        </>
                      )}
                      {minsRead > 0 && (
                        <>
                          <span>•</span>
                          <span>{minsRead} min read</span>
                        </>
                      )}
                    </div>
                  </div>

                  {!usingOfflineFallback && (
                    <div className="z-20 flex items-center gap-1.5">
                      {isItemDownloaded ? (
                        <>
                          <div className="flex justify-center items-center bg-green-500/10 rounded-full w-8 h-8 text-green-500">
                            <Check size={16} />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSingleDownload(item);
                            }}
                            title="Remove download"
                            className="flex justify-center items-center hover:bg-red-500/10 border border-red-500/20 rounded-full w-8 h-8 text-red-500/70 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : failedDownloads.has(item.id) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSingleDownload(item, index);
                          }}
                          title="Download failed — tap to retry"
                          className="flex justify-center items-center bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-full w-8 h-8 text-red-500 transition-colors"
                        >
                          <AlertCircle size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSingleDownload(item, index);
                          }}
                          disabled={isItemDownloading}
                          className="flex justify-center items-center border border-white/10 hover:border-primary rounded-full w-8 h-8 text-primary/40 hover:text-primary transition-colors"
                        >
                          {isItemDownloading ? (
                            <svg className="w-5 h-5 -rotate-90">
                              <circle
                                cx="10"
                                cy="10"
                                r="8"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                className="text-primary/20"
                              />
                              <circle
                                cx="10"
                                cy="10"
                                r="8"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray="50"
                                strokeDashoffset="50"
                                className="text-primary animate-[dash_1.5s_ease-in-out_infinite]"
                              />
                              <style jsx>{`
                                @keyframes dash {
                                  0% {
                                    stroke-dashoffset: 50;
                                  }
                                  50% {
                                    stroke-dashoffset: 0;
                                  }
                                  100% {
                                    stroke-dashoffset: -50;
                                  }
                                }
                              `}</style>
                            </svg>
                          ) : (
                            <Download size={16} />
                          )}
                        </button>
                      )}
                      {!isSelectionMode && (
                        <div className="flex justify-center items-center border border-white/10 group-hover:border-complimentary-colour/50 rounded-full w-8 h-8 text-primary/20 group-hover:text-complimentary-colour transition-colors">
                          <Play size={12} className="fill-current" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "details" && (
          <div className="space-y-8">
            {aggregated && (
              <div className="gap-4 grid grid-cols-2 bg-white/5 p-4 border border-white/10 rounded-xl">
                <div className="space-y-1">
                  <p className="text-primary/50 text-xs">Total Words</p>
                  <p className="font-bold text-primary text-lg">
                    {aggregated.totalWords?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-primary/50 text-xs">Reading Time</p>
                  <p className="font-bold text-primary text-lg">
                    {formatReadingTime(aggregated.totalReadingTimeSeconds)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-primary/50 text-xs">
                    {structure === "chapters" ? "Chapters" : "Episodes"}
                  </p>
                  <p className="font-bold text-primary text-lg">
                    {structure === "chapters"
                      ? aggregated.totalChapters
                      : aggregated.totalEpisodes}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-primary/50 text-xs">Completed</p>
                  <p className="font-bold text-primary text-lg">
                    {structure === "chapters"
                      ? aggregated.completedChapters
                      : aggregated.completedEpisodes}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-bold text-primary text-lg">
                About the Story
              </h3>
              <p className="text-primary/70 text-sm leading-relaxed whitespace-pre-wrap">
                {effectiveStory.description}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-primary text-sm">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {effectiveStory.genres?.map((genre: string) => (
                  <span
                    key={genre}
                    className="bg-primary/5 px-4 py-1.5 border border-primary/10 rounded-full font-medium text-primary/70 text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {isAuthor && !usingOfflineFallback && (
              <div className="pt-6 border-primary/10 border-t">
                <Link
                  href={`/edit-story/${storyId}`}
                  className="flex justify-center items-center gap-2 hover:bg-primary/5 py-4 border border-primary/20 rounded-xl w-full font-medium text-primary transition-colors"
                >
                  <Edit size={18} />
                  <span>Edit Story</span>
                </Link>
              </div>
            )}

            {!usingOfflineFallback && (
              <button
                onClick={isDownloaded ? handleRemoveDownload : handleDownload}
                disabled={isDownloading}
                className={cn(
                  "flex justify-center items-center gap-2 py-4 border rounded-xl w-full font-medium transition-colors",
                  isDownloaded
                    ? "border-green-500/30 text-green-500 bg-green-500/5"
                    : "border-primary/20 text-primary hover:bg-primary/5",
                )}
              >
                {isDownloading ? (
                  <div className="border-2 border-current border-t-transparent rounded-full w-5 h-5 animate-spin" />
                ) : isDownloaded ? (
                  <>
                    <Check size={18} />
                    <span>Downloaded</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Download for Offline</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {activeTab === "reviews" && !usingOfflineFallback && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 bg-white/5 mb-6 p-6 rounded-2xl">
              <div className="font-bold text-primary text-5xl">
                {starRating.toFixed(1)}
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-primary/60 text-xs uppercase tracking-wide">
                  Rate this story
                </p>
                <div
                  className={cn(
                    "flex gap-1 text-yellow-500 transition-opacity",
                    pendingRating !== null ? "opacity-50" : "opacity-100",
                  )}
                  onMouseLeave={() => setHoverRating(null)}
                >
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isFilled =
                      hoverRating !== null ||
                      pendingRating !== null ||
                      userRating !== null
                        ? starValue <= displayedStars
                        : starValue <= fullStars;
                    const isHalf =
                      hoverRating === null &&
                      pendingRating === null &&
                      userRating === null &&
                      starValue === fullStars + 1 &&
                      hasHalfStar;

                    return (
                      <button
                        key={starValue}
                        type="button"
                        disabled={isSubmittingRating}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onClick={() => void handleRateStory(starValue)}
                        aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
                        className="relative disabled:opacity-50 p-0.5 hover:scale-110 transition-transform cursor-pointer"
                      >
                        {isFilled ? (
                          <Star size={22} className="fill-current text-yellow-500" />
                        ) : isHalf ? (
                          <div className="relative">
                            <Star size={22} className="text-yellow-500/30" />
                            <div className="absolute inset-0 w-1/2 overflow-hidden">
                              <Star size={22} className="fill-current text-yellow-500" />
                            </div>
                          </div>
                        ) : (
                          <Star size={22} className="text-yellow-500/30" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="font-medium text-primary/50 text-sm">
                  {totalRatings} {totalRatings === 1 ? "rating" : "ratings"} · {displayCommentCount} reviews
                  {userRating
                    ? ` · Your rating: ${userRating}/5 (tap a star to update)`
                    : " · Tap a star to rate"}
                </p>
              </div>
            </div>

            <div className="space-y-4 bg-white/5 p-6 rounded-2xl">
              <h3 className="font-bold text-primary text-lg">Write a Review</h3>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleReviewSubmit();
                  }
                }}
                placeholder="Share your thoughts about this story..."
                className="bg-white/10 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 w-full min-h-[120px] text-primary text-sm resize-none"
                disabled={isSubmittingReview}
              />
              <button
                onClick={handleReviewSubmit}
                disabled={!reviewText.trim() || isSubmittingReview}
                className="bg-primary hover:bg-primary/90 disabled:bg-primary/30 px-6 py-2 rounded-full font-medium text-white text-sm transition-colors disabled:cursor-not-allowed"
              >
                {isSubmittingReview ? "Posting..." : "Post Review"}
              </button>
            </div>

            <div className="space-y-6">
              <CommentsSection
                comments={comments || []}
                onSubmitComment={createComment}
                onUpdateComment={updateComment}
                onDeleteComment={deleteComment}
                isThreaded={true}
                currentUser={
                  currentUser
                    ? {
                        id: currentUser.id,
                        penName:
                          currentUser.penName ||
                          currentUser.firstName ||
                          "Anonymous",
                        avatar:
                          currentUser.avatar ||
                          currentUser.profilePicture ||
                          "",
                      }
                    : undefined
                }
              />
            </div>
          </div>
        )}

        {activeTab === "reviews" && usingOfflineFallback && (
          <div className="flex flex-col justify-center items-center gap-2 py-16 text-center">
            <WifiOff size={28} className="text-primary/30" />
            <p className="text-primary/50 text-sm">
              Reviews aren't available offline
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showFab && (
          <motion.div
            initial={{ width: 200, opacity: 0, y: 50 }}
            animate={{ width: 56, opacity: 1, y: 0 }}
            exit={{ width: 200, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="right-6 bottom-6 z-50 fixed overflow-hidden"
          >
            <button
              type="button"
              onClick={() => handleStartReading()}
              className="flex justify-center items-center bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 rounded-full w-14 h-14 text-white"
            >
              <Play size={24} className="fill-current ml-1" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSelectionMode && selectedContentIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="right-0 bottom-0 left-0 z-40 fixed shadow-2xl p-4 pb-8 border-white/10 border-t bg-accent-shade-1"
          >
            <div className="flex justify-between items-center gap-4 mx-auto max-w-[28rem]">
              <div className="font-medium text-primary text-sm">
                {selectedContentIds.size} selected
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBulkMarkAsRead}
                  className="flex items-center gap-2 bg-complimentary-colour/10 hover:bg-complimentary-colour/20 px-4 py-2 rounded-lg font-medium text-complimentary-colour text-sm transition-colors"
                >
                  <Check size={16} />
                  <span>Mark Read</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-lg font-medium text-red-500 text-sm transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Remove</span>
                </button>
                <button
                  onClick={handleBulkDownload}
                  disabled={isDownloading}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 px-4 py-2 rounded-lg font-medium text-white text-sm transition-colors"
                >
                  {isDownloading ? (
                    <div className="border-2 border-current border-t-transparent rounded-full w-4 h-4 animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  <span>Download</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumUpsellModal
        isOpen={isUpsellOpen}
        onClose={closeUpsell}
        reason={upsellReason}
      />
    </div>
  );
};

export default SingleStory;
