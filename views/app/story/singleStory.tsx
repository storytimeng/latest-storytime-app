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
import { shareStory } from "@/lib/share";
import { usePremiumFeatures } from "@/src/hooks/usePremiumFeatures";
import { usePremiumUpsell } from "@/src/hooks/usePremiumUpsell";
import { PremiumUpsellModal } from "@/components/reusables/PremiumUpsellModal";
import PremiumBanner from "@/components/reusables/customUI/PremiumBanner";
import { canReadExclusiveStory } from "@/src/lib/premiumUpsell";
import PageHeader from "@/components/reusables/customUI/pageHeader";

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

const READING_WPM = 200;
const MIN_CONTENT_LENGTH_TO_SKIP_REFETCH = 100;

const formatReadingTime = (seconds: number): string => {
  if (!seconds) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${minutes}m`;
};

/** Strips HTML so we can tell real prose apart from `<p></p>` placeholders. */
const stripHtml = (html?: string) =>
  (html || "").replace(/<[^>]*>/g, "").trim();

const SingleStory = ({ storyId }: SingleStoryProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { story, isLoading } = useStory(storyId);
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

  useEffect(() => {
    router.prefetch("/home");
    story?.genres?.forEach((genre: any) =>
      router.prefetch(genreCategoryPath(String(genre))),
    );
  }, [router, story?.genres]);

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

  const currentUser = (
    storeUser && (storeUser as any).data
      ? (storeUser as any).data?.user
      : storeUser
  ) as any;

  const storyData = story as any;
  const storyAuthorId = storyData?.authorId || story?.author?.id;
  const currentAuthorId = currentUser?.authorId || currentUser?.id;
  const isAuthor =
    currentAuthorId && storyAuthorId && currentAuthorId === storyAuthorId;

  const displayLikeCount = storyData?.likeCount ?? likeCount ?? 0;
  const displayCommentCount = storyData?.commentCount ?? commentCount ?? 0;

  // --- Structure detection (source of truth for the whole component) -----
  const hasEpisodes = storyData?.episodes && storyData.episodes.length > 0;
  const hasChapters = storyData?.chapter === true; // API returns 'chapter': boolean

  const structure: Structure = hasEpisodes
    ? "episodes"
    : hasChapters
      ? "chapters"
      : "single";
  const isSingleStory = structure === "single";

  const shouldFetchChapters =
    structure === "chapters" && !storyData?.chapters?.length && !isLoading;
  const shouldFetchEpisodes =
    structure === "episodes" && !storyData?.episodes?.length && !isLoading;

  const { chapters: fetchedChapters } = useStoryChapters(
    shouldFetchChapters ? storyId : undefined,
  );
  const { episodes: fetchedEpisodes } = useStoryEpisodes(
    shouldFetchEpisodes ? storyId : undefined,
  );

  const chapters = storyData?.chapters?.length
    ? storyData.chapters
    : fetchedChapters;
  const episodes = storyData?.episodes?.length
    ? storyData.episodes
    : fetchedEpisodes;
  const contentList = structure === "chapters" ? chapters : episodes;
  const hasContent = contentList && contentList.length > 0;

  // --- Offline ------------------------------------------------------------
  const {
    isStoryDownloaded,
    getDownloadedContent,
    downloadStory,
    downloadAdditionalContent,
    deleteOfflineStory,
    deleteOfflineContent,
    syncStoryIfNeeded,
    syncAllChapters,
    syncAllEpisodes,
  } = useOfflineStories();

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

  /**
   * Fetches full content for a chapter/episode when the list-view item only
   * has a preview/no content, and normalizes it into a save-ready payload.
   * Returns null if the resolved content is empty — callers must treat that
   * as a failure, never persist a blank record.
   */
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
        title:
          fullTitle ||
          `${structure === "chapters" ? "Chapter" : "Episode"} ${index + 1}`,
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
        await downloadStory(story, payload, structure);
      } else {
        await downloadAdditionalContent(storyId!, structure, payload);
      }
    },
    [
      downloadStory,
      downloadAdditionalContent,
      isStoryDownloaded,
      storyId,
      story,
      structure,
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
    if (!story || !storyId) return;
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
            title: story.title || "Untitled",
            content: story.content || story.description || "",
            number: 1,
          },
        ];
      }

      // Never persist blank chapters/episodes.
      content = content.filter((c) => stripHtml(c.content));

      if (content.length === 0) {
        showToast({
          type: "warning",
          message: "No content available to download",
        });
        return;
      }

      await downloadStory(story, content, structure);
      setIsDownloaded(true);
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

  // Check downloaded content status
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

    let startIndex = 0;
    if (storyProgress) {
      const lastRead =
        structure === "chapters"
          ? (storyProgress as any).lastReadChapter
          : (storyProgress as any).lastReadEpisode;
      if (lastRead) startIndex = lastRead;
    }

    let itemsToDownload: any[] = [];
    if (key === "unread") {
      itemsToDownload = contentList.filter((item: any) => {
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
    } else {
      const count = parseInt(key.replace("next-", ""));
      if (!isNaN(count))
        itemsToDownload = contentList.slice(startIndex, startIndex + count);
    }

    itemsToDownload = itemsToDownload.filter(
      (item) =>
        !downloadedContentIds.has(item.id) &&
        !downloadedContentIds.has(item.chapterId ?? item.episodeId),
    );

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

  // Check downloaded state + sync stale offline content with server
  useEffect(() => {
    if (!storyId || !story) return;
    (async () => {
      const downloaded = await isStoryDownloaded(storyId);
      setIsDownloaded(downloaded);
      if (!downloaded) return;

      await syncStoryIfNeeded(storyId, story);
      if (chapters?.length) await syncAllChapters(storyId, chapters);
      else if (episodes?.length) await syncAllEpisodes(storyId, episodes);
    })();
  }, [
    storyId,
    story,
    chapters,
    episodes,
    isStoryDownloaded,
    syncStoryIfNeeded,
    syncAllChapters,
    syncAllEpisodes,
  ]);

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
    setIsSubmittingReview(true);
    try {
      await createComment(reviewText);
      setReviewText("");
    } catch (error: any) {
      showToast({
        type: "error",
        message: error?.message || "Failed to post review",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen pb-20 bg-accent-shade-1">
        <div className="relative w-full h-[55vh] min-h-[320px] max-h-[420px] overflow-hidden">
          <Skeleton className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-accent-shade-1 via-accent-shade-1/40 to-transparent" />
          <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-6">
            <div className="flex items-center justify-between">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="w-10 h-10 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 px-4 -mt-16">
          <div className="flex gap-2 mb-3">
            <Skeleton className="w-24 h-6 rounded" />
            <Skeleton className="w-20 h-6 rounded" />
          </div>
          <Skeleton className="w-3/4 h-8 mb-2 rounded-lg" />
          <Skeleton className="w-full my-4 rounded-full h-14" />
          <div className="flex gap-2 mb-4">
            <Skeleton className="w-20 h-6 rounded-md" />
            <Skeleton className="w-16 h-6 rounded-md" />
            <Skeleton className="w-16 h-6 rounded-md" />
            <Skeleton className="w-20 h-6 rounded-md" />
          </div>
          <Skeleton className="w-full h-12 mb-4 rounded-md" />
          <Skeleton className="w-48 h-5 mb-4 rounded-md" />
        </div>
        <div className="flex gap-8 px-4 py-4 border-b border-primary/5">
          <Skeleton className="w-20 h-6 rounded-md" />
          <Skeleton className="w-16 h-6 rounded-md" />
          <Skeleton className="w-16 h-6 rounded-md" />
        </div>
        <div className="px-4 py-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-3/4 h-4 rounded-md" />
                <Skeleton className="w-1/2 h-3 rounded-md" />
              </div>
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-accent-shade-1">
        <PageHeader backLink="/home" showBackButton />
        <div className="flex items-center justify-center px-4 py-20">
          <p className="text-center text-primary">Story not found</p>
        </div>
      </div>
    );
  }

  type ExtendedAuthorDto = typeof story.author & {
    firstName?: string;
    lastName?: string;
    penName?: string;
  };
  const author = story.author as ExtendedAuthorDto;
  const displayImage = getStoryCoverSrc(story.imageUrl);
  const status = storyData.storyStatus || "Ongoing";
  const viewCount = storyData.viewCount || 0;
  const popularityScore = storyData.popularityScore || 0;

  const starRating =
    popularityScore === 0 ? 0 : Math.min(Math.max(popularityScore / 20, 0), 5);
  const fullStars = Math.floor(starRating);
  const hasHalfStar = starRating % 1 >= 0.5;
  const collaborators = storyData.collaborate as string[] | null;

  return (
    <div className="relative min-h-screen pb-20 bg-accent-shade-1">
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
        altText={story.title}
        layoutId={`story-image-${storyId}`}
      />

      <div className="relative w-full h-[55vh] min-h-[320px] max-h-[420px] overflow-hidden">
        <StoryCoverImage
          src={story.imageUrl}
          alt={story.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-accent-shade-1 from-0% via-accent-shade-1/70 via-8% to-transparent to-15%" />

        <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-6">
          <div className="flex items-center justify-between">
            <Link
              href="/home"
              className="p-2 transition-colors rounded-full bg-black/30 backdrop-blur-md hover:bg-black/40"
            >
              <ArrowLeft size={24} className="text-white" />
            </Link>
            <div className="flex items-center gap-2">
              {!isSingleStory ? (
                <Dropdown>
                  <DropdownTrigger>
                    <button className="p-2 transition-colors rounded-full bg-black/30 backdrop-blur-md hover:bg-black/40">
                      <Download size={24} className="text-white" />
                    </button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Download Options"
                    onAction={(key) => handleBatchDownloadAction(key as string)}
                  >
                    <DropdownItem key="next-1">
                      Next {structure === "chapters" ? "Chapter" : "Episode"}
                    </DropdownItem>
                    <DropdownItem key="next-5">
                      Next 5{" "}
                      {structure === "chapters" ? "Chapters" : "Episodes"}
                    </DropdownItem>
                    <DropdownItem key="next-10">
                      Next 10{" "}
                      {structure === "chapters" ? "Chapters" : "Episodes"}
                    </DropdownItem>
                    <DropdownItem key="next-25">
                      Next 25{" "}
                      {structure === "chapters" ? "Chapters" : "Episodes"}
                    </DropdownItem>
                    <DropdownItem key="unread">
                      Download Unread{" "}
                      {structure === "chapters" ? "Chapters" : "Episodes"}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              ) : (
                <button
                  onClick={isDownloaded ? handleRemoveDownload : handleDownload}
                  disabled={isDownloading}
                  className="p-2 transition-colors rounded-full bg-black/30 backdrop-blur-md hover:bg-black/40"
                >
                  {isDownloading ? (
                    <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  ) : isDownloaded ? (
                    <Check size={24} className="text-green-400" />
                  ) : (
                    <Download size={24} className="text-white" />
                  )}
                </button>
              )}
              <button
                onClick={toggleLike}
                className="p-2 transition-colors rounded-full bg-black/30 backdrop-blur-md hover:bg-black/40"
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
                    story.title,
                    story.description,
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
                className="p-2 transition-colors rounded-full bg-black/30 backdrop-blur-md hover:bg-black/40"
              >
                <Share2 size={24} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 -mt-16">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {isExclusive && (
            <span className="inline-flex items-center bg-complimentary-colour text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider shadow-sm">
              Only on Storytime
            </span>
          )}
          {story?.trigger && (
            <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider shadow-sm">
              18+
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider",
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
            "text-primary text-2xl font-bold leading-tight mb-2",
            Magnetik_Bold.className,
          )}
        >
          {story.title}
        </h1>

        <button
          onClick={() => handleStartReading()}
          className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-full font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-primary/25 active:scale-[0.98] my-4"
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

        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-primary/70">
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
            <Star size={12} className="text-yellow-500 fill-current" />
            <span className="font-medium text-primary">
              {starRating.toFixed(1)}
            </span>
          </div>
          {story.genres?.[0] && (
            <span className="px-2 py-1 font-medium rounded-md bg-white/50 text-primary">
              {story.genres[0]}
            </span>
          )}
        </div>

        <div className="mb-4">
          <p
            className={cn(
              "text-sm text-primary/70 leading-relaxed line-clamp-2",
              Magnetik_Regular.className,
            )}
          >
            {story.description}
          </p>
          {story.description && story.description.length > 100 && (
            <button
              onClick={() => setActiveTab("details")}
              className="mt-1 text-sm font-medium text-complimentary-colour"
            >
              More
            </button>
          )}
        </div>

        <button
          onClick={onOpenCollaborators}
          className="flex items-center gap-2 mb-4 text-xs tracking-wider uppercase transition-colors text-primary/50 hover:text-primary/70"
        >
          <span className="font-medium">Show Writers & Cast</span>
          <span className="font-bold normal-case text-primary/80">
            {author?.penName || author?.name || "Unknown"}
            {collaborators &&
              collaborators.length > 0 &&
              ` and ${collaborators.length} more`}
          </span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="sticky top-0 z-30 px-4 border-b border-white/5 backdrop-blur-xl bg-accent-shade-1/95">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          {!isSingleStory && (
            <button
              onClick={() => setActiveTab("episodes")}
              className={cn(
                "py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors relative",
                activeTab === "episodes"
                  ? "text-primary border-complimentary-colour"
                  : "text-primary/40 border-transparent hover:text-primary/60",
              )}
            >
              {structure === "chapters" ? "Chapters" : "Episodes"}
              <span className="ml-1.5 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full opacity-80">
                {contentList?.length || 0}
              </span>
            </button>
          )}
          <button
            onClick={() => setActiveTab("details")}
            className={cn(
              "py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
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
              "py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeTab === "reviews"
                ? "text-primary border-complimentary-colour"
                : "text-primary/40 border-transparent hover:text-primary/60",
            )}
          >
            Reviews
            <span className="ml-1.5 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full opacity-80">
              {displayCommentCount}
            </span>
          </button>
        </div>
      </div>

      <div className="px-4 py-6">
        {activeTab === "episodes" && !isSingleStory && (
          <div className="space-y-4">
            {aggregated && aggregated.overallPercentage > 0 && (
              <div className="p-4 mb-6 border rounded-xl bg-complimentary-colour/5 border-complimentary-colour/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-primary">
                    Reading Progress
                  </span>
                  <span className="text-xs font-bold text-complimentary-colour">
                    {Math.round(aggregated.overallPercentage)}%
                  </span>
                </div>
                <div className="w-full h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full transition-all duration-500 rounded-full bg-complimentary-colour"
                    style={{ width: `${aggregated.overallPercentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-primary/60">
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
                  <div className="mt-1 text-xs text-primary/50">
                    Last: {structure === "chapters" ? "Chapter" : "Episode"}{" "}
                    {storyProgress.lastReadChapter ||
                      storyProgress.lastReadEpisode}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mb-2 text-xs font-medium tracking-wider uppercase text-primary/40">
              <div className="flex items-center gap-4">
                <span>
                  All {structure === "chapters" ? "Chapters" : "Episodes"}
                </span>
                {isSelectionMode && (
                  <button
                    onClick={toggleSelectAll}
                    className="transition-colors text-primary hover:text-white"
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
                  className="transition-colors text-primary hover:text-white"
                >
                  {isSelectionMode ? "Cancel" : "Select"}
                </button>
                <button className="transition-colors text-complimentary-colour hover:text-complimentary-colour/80">
                  Sort: Oldest
                </button>
              </div>
            </div>

            {contentList?.map((item: any, index: number) => {
              const isSelected = selectedContentIds.has(item.id);
              const isItemDownloaded = downloadedContentIds.has(item.id);
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
                    "flex items-center gap-4 py-3 px-2 -mx-2 rounded-xl transition-colors relative group select-none",
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
                        "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors",
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
                      className="absolute inset-0 z-10"
                      aria-label={`Read ${item.title || "part"}`}
                    />
                  )}

                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm relative",
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
                      <h3 className="text-sm font-medium truncate transition-colors text-primary group-hover:text-complimentary-colour">
                        {item.title ||
                          `${structure === "chapters" ? "Chapter" : "Episode"} ${index + 1}`}
                      </h3>
                      {percentageRead > 0 && !isCompleted && (
                        <span className="text-xs font-medium text-complimentary-colour">
                          {Math.round(percentageRead)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-primary/40">
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

                  <div className="z-20 flex items-center gap-2">
                    {isItemDownloaded ? (
                      <div className="flex items-center justify-center w-8 h-8 text-green-500 rounded-full bg-green-500/10">
                        <Check size={16} />
                      </div>
                    ) : failedDownloads.has(item.id) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSingleDownload(item, index);
                        }}
                        title="Download failed — tap to retry"
                        className="flex items-center justify-center w-8 h-8 text-red-500 transition-colors border rounded-full border-red-500/30 bg-red-500/10 hover:bg-red-500/20"
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
                        className="flex items-center justify-center w-8 h-8 transition-colors border rounded-full border-white/10 text-primary/40 hover:text-primary hover:border-primary"
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
                      <div className="flex items-center justify-center w-8 h-8 transition-colors border rounded-full border-white/10 text-primary/20 group-hover:border-complimentary-colour/50 group-hover:text-complimentary-colour">
                        <Play size={12} className="fill-current" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "details" && (
          <div className="space-y-8">
            {aggregated && (
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-xl bg-white/5 border-white/10">
                <div className="space-y-1">
                  <p className="text-xs text-primary/50">Total Words</p>
                  <p className="text-lg font-bold text-primary">
                    {aggregated.totalWords?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-primary/50">Reading Time</p>
                  <p className="text-lg font-bold text-primary">
                    {formatReadingTime(aggregated.totalReadingTimeSeconds)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-primary/50">
                    {structure === "chapters" ? "Chapters" : "Episodes"}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {structure === "chapters"
                      ? aggregated.totalChapters
                      : aggregated.totalEpisodes}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-primary/50">Completed</p>
                  <p className="text-lg font-bold text-primary">
                    {structure === "chapters"
                      ? aggregated.completedChapters
                      : aggregated.completedEpisodes}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary">
                About the Story
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-primary/70">
                {story.description}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-primary">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {story.genres?.map((genre: string) => (
                  <span
                    key={genre}
                    className="px-4 py-1.5 rounded-full bg-primary/5 text-primary/70 text-xs font-medium border border-primary/10"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {isAuthor && (
              <div className="pt-6 border-t border-primary/10">
                <Link
                  href={`/edit-story/${storyId}`}
                  className="flex items-center justify-center w-full gap-2 py-4 font-medium transition-colors border rounded-xl border-primary/20 text-primary hover:bg-primary/5"
                >
                  <Edit size={18} />
                  <span>Edit Story</span>
                </Link>
              </div>
            )}

            <button
              onClick={isDownloaded ? handleRemoveDownload : handleDownload}
              disabled={isDownloading}
              className={cn(
                "flex items-center justify-center gap-2 w-full py-4 rounded-xl border transition-colors font-medium",
                isDownloaded
                  ? "border-green-500/30 text-green-500 bg-green-500/5"
                  : "border-primary/20 text-primary hover:bg-primary/5",
              )}
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-2 border-current rounded-full border-t-transparent animate-spin" />
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
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 p-6 mb-6 bg-white/5 rounded-2xl">
              <div className="text-5xl font-bold text-primary">
                {starRating.toFixed(1)}
              </div>
              <div className="space-y-2">
                <div className="flex gap-1 text-yellow-500">
                  {[...Array(5)].map((_, index) => {
                    if (index < fullStars)
                      return (
                        <Star key={index} size={20} className="fill-current" />
                      );
                    if (index === fullStars && hasHalfStar) {
                      return (
                        <div key={index} className="relative">
                          <Star size={20} className="text-yellow-500/30" />
                          <div className="absolute inset-0 w-1/2 overflow-hidden">
                            <Star
                              size={20}
                              className="text-yellow-500 fill-current"
                            />
                          </div>
                        </div>
                      );
                    }
                    return (
                      <Star
                        key={index}
                        size={20}
                        className="text-yellow-500/30"
                      />
                    );
                  })}
                </div>
                <p className="text-sm font-medium text-primary/40">
                  {displayCommentCount} reviews
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 bg-white/5 rounded-2xl">
              <h3 className="text-lg font-bold text-primary">Write a Review</h3>
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
                className="w-full bg-white/10 text-primary rounded-xl p-4 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                disabled={isSubmittingReview}
              />
              <button
                onClick={handleReviewSubmit}
                disabled={!reviewText.trim() || isSubmittingReview}
                className="px-6 py-2 text-sm font-medium text-white transition-colors rounded-full bg-primary hover:bg-primary/90 disabled:bg-primary/30 disabled:cursor-not-allowed"
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
      </div>

      <AnimatePresence>
        {showFab && (
          <motion.div
            initial={{ width: 200, opacity: 0, y: 50 }}
            animate={{ width: 56, opacity: 1, y: 0 }}
            exit={{ width: 200, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed z-50 overflow-hidden bottom-6 right-6"
          >
            <button
              type="button"
              onClick={() => handleStartReading()}
              className="flex items-center justify-center text-white rounded-full shadow-lg w-14 h-14 bg-primary hover:bg-primary/90 shadow-primary/30"
            >
              <Play size={24} className="ml-1 fill-current" />
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
            className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-8 border-t shadow-2xl bg-accent-shade-1 border-white/10"
          >
            <div className="max-w-[28rem] mx-auto flex items-center justify-between gap-4">
              <div className="text-sm font-medium text-primary">
                {selectedContentIds.size} selected
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBulkMarkAsRead}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg bg-complimentary-colour/10 text-complimentary-colour hover:bg-complimentary-colour/20"
                >
                  <Check size={16} />
                  <span>Mark Read</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 transition-colors rounded-lg bg-red-500/10 hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                  <span>Remove</span>
                </button>
                <button
                  onClick={handleBulkDownload}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg shadow-lg bg-primary hover:bg-primary/90 shadow-primary/20"
                >
                  {isDownloading ? (
                    <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin" />
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
