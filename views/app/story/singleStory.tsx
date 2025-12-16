"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Share2,
  Play,
  Info,
  List,
  Star,
  Download,
  Check,
  Edit,
  ChevronRight,
  Users,
  Trash2,
  X,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { Magnetik_Regular, Magnetik_Bold } from "@/lib";
import { cn } from "@/lib";
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

interface SingleStoryProps {
  storyId?: string;
}

type Tab = "episodes" | "details" | "reviews";

// Helper function to format reading time
const formatReadingTime = (seconds: number): string => {
  if (!seconds || seconds === 0) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
};

const SingleStory = ({ storyId }: SingleStoryProps) => {
  const { story, isLoading } = useStory(storyId);
  const { likeCount, isLiked, toggleLike } = useStoryLikes(storyId);
  const { commentCount, comments, createComment } = useStoryComments(storyId);
  const { aggregatedData, mutate: mutateProgress } =
    useAggregatedProgress(storyId);
  const { user: storeUser } = useUserStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openModal: openAuthModal } = useAuthModalStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("episodes");
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Extract progress data from aggregated response
  const storyProgress = aggregatedData?.storyProgress;
  const aggregated = aggregatedData?.aggregated;

  // Debug: Log aggregated data
  useEffect(() => {
    if (aggregatedData) {
      console.log("Aggregated Data:", aggregatedData);
      console.log("Story Progress:", storyProgress);
      console.log("Aggregated Stats:", aggregated);
    }
  }, [aggregatedData, storyProgress, aggregated]);

  // Scroll animation for FAB
  const { scrollY } = useScroll();
  const [showFab, setShowFab] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setShowFab(latest > 400);
    });
  }, [scrollY]);

  // Modal state
  const {
    isOpen: isCollaboratorsOpen,
    onOpen: onOpenCollaborators,
    onOpenChange: onCollaboratorsOpenChange,
  } = useDisclosure();

  const {
    isOpen: isImagePreviewOpen,
    onOpen: onOpenImagePreview,
    onOpenChange: onImagePreviewOpenChange,
  } = useDisclosure();

  // Check if current user is the author
  const currentUser = (
    storeUser && (storeUser as any).data
      ? (storeUser as any).data?.user
      : storeUser
  ) as any;

  // Handle both author object and authorId field
  const storyAuthorId = (story as any)?.authorId || story?.author?.id;
  const currentAuthorId = currentUser?.authorId || currentUser?.id;
  const isAuthor =
    currentAuthorId && storyAuthorId && currentAuthorId === storyAuthorId;

  // Use counts from story data if available, otherwise use hook counts
  const displayLikeCount = (story as any)?.likeCount ?? likeCount ?? 0;
  const displayCommentCount = (story as any)?.commentCount ?? commentCount ?? 0;

  // Determine story structure and content
  const storyData = story as any;
  const hasEpisodes = storyData?.episodes && storyData.episodes.length > 0;
  const hasChapters = storyData?.chapter === true; // API returns 'chapter': boolean

  let structure = "single";
  if (hasEpisodes) {
    structure = "episodes";
  } else if (hasChapters) {
    structure = "chapters";
  }

  // Use data from story object if available, otherwise fall back to hooks
  const shouldFetchChapters =
    structure === "chapters" && !storyData?.chapters?.length && !isLoading;
  const shouldFetchEpisodes =
    structure === "episodes" && !storyData?.episodes?.length && !isLoading;

  const { chapters: fetchedChapters } = useStoryChapters(
    shouldFetchChapters ? storyId : undefined
  );
  const { episodes: fetchedEpisodes } = useStoryEpisodes(
    shouldFetchEpisodes ? storyId : undefined
  );

  const chapters = storyData?.chapters?.length
    ? storyData.chapters
    : fetchedChapters;
  const episodes = storyData?.episodes?.length
    ? storyData.episodes
    : fetchedEpisodes;

  // Offline functionality
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
    new Set()
  );
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (id: string) => {
    longPressTimer.current = setTimeout(() => {
      if (!isSelectionMode) {
        setIsSelectionMode(true);
        toggleItemSelection(id);
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Handle single item download
  const handleSingleDownload = async (item: any, index: number) => {
    if (!isAuthenticated()) {
      openAuthModal("login");
      return;
    }

    if (downloadingItems.has(item.id)) return;

    setDownloadingItems((prev) => new Set(prev).add(item.id));
    try {
      let fullContent = item.content;

      // Fetch full content if needed
      if (!fullContent || fullContent.length < 100) {
        const {
          storiesControllerGetChapterById,
          storiesControllerGetEpisodeById,
        } = await import("@/src/client");

        if (structure === "chapters") {
          const response = await storiesControllerGetChapterById({
            path: { chapterId: item.id },
          });
          fullContent = (response.data as any)?.content || item.content;
        } else {
          const response = await storiesControllerGetEpisodeById({
            path: { episodeId: item.id },
          });
          fullContent = (response.data as any)?.content || item.content;
        }
      }

      const contentToDownload = [
        {
          id: item.id,
          title: item.title,
          content: fullContent,
          number:
            structure === "chapters"
              ? item.chapterNumber || index + 1
              : item.episodeNumber || index + 1,
          updatedAt: item.updatedAt,
        },
      ];

      // If story metadata isn't downloaded, download it first
      const isStoryMetaDownloaded = await isStoryDownloaded(storyId!);
      if (!isStoryMetaDownloaded) {
        await downloadStory(story, contentToDownload);
      } else {
        await downloadAdditionalContent(
          storyId!,
          structure as any,
          contentToDownload
        );
      }

      // Update downloaded status
      setDownloadedContentIds((prev) => new Set(prev).add(item.id));
      showToast({ type: "success", message: "Downloaded" });
    } catch (error) {
      console.error(`Failed to download item ${item.id}:`, error);
      showToast({ type: "error", message: "Download failed" });
    } finally {
      setDownloadingItems((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedContentIds, setSelectedContentIds] = useState<Set<string>>(
    new Set()
  );
  const [downloadedContentIds, setDownloadedContentIds] = useState<Set<string>>(
    new Set()
  );

  // Check downloaded content status
  useEffect(() => {
    const checkDownloadedContent = async () => {
      if (storyId && structure !== "single") {
        const downloadedItems = await getDownloadedContent(
          storyId,
          structure as any
        );
        const ids = new Set(downloadedItems.map((item: any) => item.id));
        setDownloadedContentIds(ids);
      }
    };

    checkDownloadedContent();
  }, [storyId, structure, getDownloadedContent, isDownloaded]); // Re-check when story download status changes

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedContentIds(new Set());
  };

  // Toggle selection of an item
  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedContentIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedContentIds(newSelected);

    if (!isSelectionMode && newSelected.size > 0) {
      setIsSelectionMode(true);
    } else if (isSelectionMode && newSelected.size === 0) {
      // Optional: Auto-exit selection mode if nothing selected?
      // User might prefer to stay in mode. Let's keep it manual exit or explicit "Cancel".
    }
  };

  // Select/Deselect All
  const toggleSelectAll = () => {
    if (!contentList) return;

    if (selectedContentIds.size === contentList.length) {
      setSelectedContentIds(new Set());
    } else {
      const allIds = new Set<string>(contentList.map((item: any) => item.id));
      setSelectedContentIds(allIds);
    }
  };

  // Perform batch download
  const performBatchDownload = async (itemsToDownload: any[]) => {
    if (!storyId || itemsToDownload.length === 0) return;

    setIsDownloading(true);
    try {
      // Fetch full content for each item by ID
      const {
        storiesControllerGetChapterById,
        storiesControllerGetEpisodeById,
      } = await import("@/src/client");

      const contentPromises = itemsToDownload.map(
        async (item: any, idx: number) => {
          try {
            let fullContent = item.content;

            // Fetch full content from API if not already present
            if (!fullContent || fullContent.length < 100) {
              if (structure === "chapters") {
                const response = await storiesControllerGetChapterById({
                  path: { chapterId: item.id },
                });
                // Response.data is the chapter object directly
                fullContent = (response.data as any)?.content || item.content;
              } else {
                const response = await storiesControllerGetEpisodeById({
                  path: { episodeId: item.id },
                });
                // Response.data is the episode object directly
                fullContent = (response.data as any)?.content || item.content;
              }
            }

            return {
              id: item.id,
              title: item.title,
              content: fullContent,
              number:
                structure === "chapters"
                  ? item.chapterNumber || idx + 1
                  : item.episodeNumber || idx + 1,
              updatedAt: item.updatedAt,
            };
          } catch (error) {
            console.error(`Failed to fetch content for ${item.id}:`, error);
            // Fallback to existing content if fetch fails
            return {
              id: item.id,
              title: item.title,
              content: item.content || "",
              number:
                structure === "chapters"
                  ? item.chapterNumber || idx + 1
                  : item.episodeNumber || idx + 1,
              updatedAt: item.updatedAt,
            };
          }
        }
      );

      const content = await Promise.all(contentPromises);

      // If story metadata isn't downloaded, download it first
      const isStoryMetaDownloaded = await isStoryDownloaded(storyId);
      if (!isStoryMetaDownloaded) {
        await downloadStory(story, content);
      } else {
        await downloadAdditionalContent(storyId, structure as any, content);
      }

      // Refresh downloaded status
      const newDownloadedIds = new Set(downloadedContentIds);
      itemsToDownload.forEach((item) => newDownloadedIds.add(item.id));
      setDownloadedContentIds(newDownloadedIds);
      setIsSelectionMode(false);
      setSelectedContentIds(new Set());
      setIsDownloaded(true);
      showToast({ type: "success", message: "Downloaded successfully" });
    } catch (error) {
      console.error("Bulk download error:", error);
      showToast({ type: "error", message: "Download failed" });
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle batch download action from dropdown
  const handleBatchDownloadAction = async (key: string) => {
    if (!isAuthenticated()) {
      openAuthModal("login");
      return;
    }

    if (!contentList || contentList.length === 0) return;

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
        const itemProgress =
          structure === "episodes"
            ? aggregatedData?.episodeProgress?.find(
                (ep: any) => ep.episodeId === item.id
              )
            : aggregatedData?.chapterProgress?.find(
                (ch: any) => ch.chapterId === item.id
              );
        return !itemProgress?.isCompleted;
      });
    } else {
      const count = parseInt(key.replace("next-", ""));
      if (!isNaN(count)) {
        itemsToDownload = contentList.slice(startIndex, startIndex + count);
      }
    }

    // Filter out already downloaded
    itemsToDownload = itemsToDownload.filter(
      (item: any) => !downloadedContentIds.has(item.id)
    );

    if (itemsToDownload.length === 0) {
      showToast({ type: "info", message: "No new items to download" });
      return;
    }

    await performBatchDownload(itemsToDownload);
  };

  // Handle bulk download
  const handleBulkDownload = async () => {
    if (!isAuthenticated()) {
      openAuthModal("login");
      return;
    }

    if (!storyId || selectedContentIds.size === 0) return;
    const itemsToDownload = contentList.filter((item: any) =>
      selectedContentIds.has(item.id)
    );
    await performBatchDownload(itemsToDownload);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!storyId || selectedContentIds.size === 0) return;

    try {
      for (const id of selectedContentIds) {
        await deleteOfflineContent(
          storyId,
          id,
          structure === "chapters" ? "chapter" : "episode"
        );
      }

      // Refresh downloaded status
      const newDownloadedIds = new Set(downloadedContentIds);
      selectedContentIds.forEach((id) => newDownloadedIds.delete(id));
      setDownloadedContentIds(newDownloadedIds);

      setIsSelectionMode(false);
      setSelectedContentIds(new Set());

      // Check if anything is left
      const stillDownloaded = await isStoryDownloaded(storyId);
      setIsDownloaded(stillDownloaded);
    } catch (error) {
      console.error("Bulk delete error:", error);
    }
  };

  // Handle bulk mark as read
  const handleBulkMarkAsRead = async () => {
    if (!storyId || selectedContentIds.size === 0) return;

    try {
      const {
        usersControllerUpdateChapterProgress,
        usersControllerUpdateEpisodeProgress,
      } = await import("@/src/client");

      const promises = Array.from(selectedContentIds).map(async (id) => {
        const progressData = {
          percentageRead: 100,
          isCompleted: true,
        };

        if (structure === "chapters") {
          await usersControllerUpdateChapterProgress({
            path: { storyId, chapterId: id },
            body: progressData,
          });
        } else {
          await usersControllerUpdateEpisodeProgress({
            path: { storyId, episodeId: id },
            body: progressData,
          });
        }
      });

      await Promise.all(promises);

      showToast({ type: "success", message: "Marked as read" });
      setIsSelectionMode(false);
      setSelectedContentIds(new Set());
      mutateProgress();
    } catch (error) {
      console.error("Bulk mark as read error:", error);
      showToast({ type: "error", message: "Failed to mark as read" });
    }
  };

  // Check if story is downloaded and sync if needed
  useEffect(() => {
    const checkAndSync = async () => {
      if (storyId && story) {
        const downloaded = await isStoryDownloaded(storyId);
        setIsDownloaded(downloaded);

        // If story is downloaded and we have online data, check for updates
        if (downloaded && story) {
          await syncStoryIfNeeded(storyId, story);

          // Also sync chapters or episodes if available
          if (chapters && chapters.length > 0) {
            await syncAllChapters(storyId, chapters);
          } else if (episodes && episodes.length > 0) {
            await syncAllEpisodes(storyId, episodes);
          }
        }
      }
    };

    checkAndSync();
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

  // Determine content list
  const contentList = structure === "chapters" ? chapters : episodes;
  const hasContent = contentList && contentList.length > 0;
  const isSingleStory = structure === "single";

  // Calculate continue target
  const continueTarget = React.useMemo(() => {
    if (!contentList || contentList.length === 0) return null;

    // Default to first item
    if (!storyProgress) return contentList[0];

    const lastReadIndex =
      structure === "chapters"
        ? (storyProgress as any).lastReadChapter
        : (storyProgress as any).lastReadEpisode;

    if (!lastReadIndex) return contentList[0];

    // Check if the last read item is completed
    // Note: lastReadIndex is 1-based
    const lastReadItem = contentList[lastReadIndex - 1];
    if (!lastReadItem) return contentList[0];

    const progressList =
      structure === "chapters"
        ? aggregatedData?.chapterProgress
        : aggregatedData?.episodeProgress;
    const itemProgress = progressList?.find((p: any) =>
      structure === "chapters"
        ? p.chapterId === lastReadItem.id
        : p.episodeId === lastReadItem.id
    );

    if (itemProgress?.isCompleted && lastReadIndex < contentList.length) {
      return contentList[lastReadIndex]; // Next item
    }

    return lastReadItem; // Current item
  }, [storyProgress, contentList, structure, aggregatedData]);

  // Set default tab if single story
  useEffect(() => {
    if (isSingleStory && activeTab === "episodes") {
      setActiveTab("details");
    }
  }, [isSingleStory, activeTab]);

  // Handle download
  const handleDownload = async () => {
    if (!story || !storyId) return;

    setIsDownloading(true);

    try {
      let content: any[] = [];

      // Handle stories with chapters
      if (structure === "chapters" && chapters && Array.isArray(chapters)) {
        content = chapters.map((ch: any, idx: number) => ({
          id: ch.id,
          title: ch.title,
          content: ch.content,
          number: idx + 1,
        }));
      }
      // Handle stories with episodes
      else if (
        structure === "episodes" &&
        episodes &&
        Array.isArray(episodes)
      ) {
        content = episodes.map((ep: any, idx: number) => ({
          id: ep.id,
          title: ep.title,
          content: ep.content,
          number: idx + 1,
        }));
      }
      // Handle single stories without chapters or episodes
      else {
        content = [
          {
            id: storyId,
            title: story.title,
            content: story.content || story.description || "",
            number: 1,
          },
        ];
      }

      if (content.length === 0 || !content[0].content) {
        showToast({
          type: "warning",
          message: "No content available to download",
        });
        return;
      }

      const success = await downloadStory(story, content);
      if (success) {
        setIsDownloaded(true);
      }
    } catch (error) {
      console.error("Download error:", error);
      showToast({
        type: "error",
        message: "Failed to download story",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle remove download
  const handleRemoveDownload = async () => {
    if (!storyId) return;

    const success = await deleteOfflineStory(storyId);
    if (success) {
      setIsDownloaded(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen pb-20 bg-accent-shade-1">
        {/* Hero Skeleton */}
        <div className="relative w-full h-[480px] overflow-hidden">
          <Skeleton className="absolute inset-0 w-full h-full opacity-20" />
          <div className="absolute inset-0 z-10 flex flex-col justify-end px-4 pb-8">
            <div className="flex items-end gap-5">
              <Skeleton className="flex-shrink-0 w-36 h-52 rounded-xl" />
              <div className="flex-1 mb-1 space-y-3">
                <Skeleton className="w-20 h-4 rounded-md" />
                <Skeleton className="w-3/4 h-8 rounded-lg" />
                <Skeleton className="w-1/2 h-4 rounded-md" />
                <div className="flex gap-4 mt-2">
                  <Skeleton className="w-16 h-6 rounded-md" />
                  <Skeleton className="w-16 h-6 rounded-md" />
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Skeleton className="w-full rounded-full h-14" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-8 px-4 py-4 border-b border-white/5">
          <Skeleton className="w-20 h-6 rounded-md" />
          <Skeleton className="w-16 h-6 rounded-md" />
          <Skeleton className="w-16 h-6 rounded-md" />
        </div>

        {/* List Skeleton */}
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
      <div className="flex items-center justify-center min-h-screen bg-accent-shade-1">
        <p className="text-primary">Story not found</p>
      </div>
    );
  }

  // Extend AuthorDto for local use
  type ExtendedAuthorDto = typeof story.author & {
    firstName?: string;
    lastName?: string;
    penName?: string;
  };
  const author = story.author as ExtendedAuthorDto;
  const displayImage = story.imageUrl || "/images/storytime-fallback.png";
  const status = (story as any).storyStatus || "Ongoing";
  const isExclusive = (story as any).onlyOnStorytime || false;
  const viewCount = (story as any).viewCount || 0;
  const popularityScore = (story as any).popularityScore || 0;

  // Calculate star rating from popularity score (0-100 scale to 0-5 stars)
  const calculateStarRating = (score: number): number => {
    if (score === 0) return 4.5; // Default rating
    // Divide by 20 to convert 0-100 scale to 0-5 stars
    const stars = score / 20;
    return Math.min(Math.max(stars, 0), 5); // Clamp between 0 and 5
  };

  const starRating = calculateStarRating(popularityScore);
  const fullStars = Math.floor(starRating);
  const hasHalfStar = starRating % 1 >= 0.5;

  // Handle review submission
  const handleReviewSubmit = async () => {
    if (!reviewText.trim() || !storyId) return;

    setIsSubmittingReview(true);
    try {
      await createComment(reviewText);
      setReviewText("");
      showToast({ type: "success", message: "Review posted successfully!" });
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to post review";
      showToast({ type: "error", message: errorMessage });
    } finally {
      setIsSubmittingReview(false);
    }
  };
  const collaborators = (story as any).collaborate as string[] | null;

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

      {/* Hero Section */}
      <div className="relative w-full h-[480px] overflow-hidden">
        {/* Blurred Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src={displayImage}
            alt={story.title}
            fill
            className="object-cover scale-110 blur-2xl opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-accent-shade-1" />
        </div>
        {/* Header Navigation */}
        <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-6">
          <div className="flex items-center justify-between">
            <Link
              href="/home"
              className="p-2 transition-colors rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20"
            >
              <ArrowLeft size={24} className="text-white" />
            </Link>
            <div className="flex items-center gap-2">
              {!isSingleStory ? (
                <Dropdown>
                  <DropdownTrigger>
                    <button className="p-2 transition-colors rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20">
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
                  className="p-2 transition-colors rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20"
                >
                  {isDownloading ? (
                    <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  ) : isDownloaded ? (
                    <Check size={24} className="text-green-500" />
                  ) : (
                    <Download size={24} className="text-white" />
                  )}
                </button>
              )}
              <button className="p-2 transition-colors rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20">
                <Share2 size={24} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end px-4 pb-8">
          <div className="flex items-end gap-5">
            <motion.div
              className="relative flex-shrink-0 overflow-hidden border shadow-2xl cursor-pointer w-36 h-52 rounded-xl border-white/10 ring-1 ring-black/20"
              onClick={onOpenImagePreview}
              layoutId={`story-image-${storyId}`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={displayImage}
                alt={story.title}
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Info */}
            <div className="flex-1 space-y-2.5 mb-1">
              {isExclusive && (
                <span className="inline-block bg-complimentary-colour text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                  #1 in {story.genres?.[0] || "Storytime"}
                </span>
              )}
              <h1
                className={cn(
                  "text-white text-2xl font-bold leading-tight line-clamp-2 drop-shadow-sm",
                  Magnetik_Bold.className
                )}
              >
                {story.title}
              </h1>

              <button
                onClick={onOpenCollaborators}
                className="flex items-center gap-2 text-xs transition-colors text-white/90 hover:text-white group"
              >
                <span className="font-medium transition-all border-b border-transparent group-hover:border-white/50">
                  {author?.penName || author?.name || "Unknown"}
                </span>
                <Users
                  size={12}
                  className="transition-opacity opacity-60 group-hover:opacity-100"
                />
              </button>

              <div className="flex items-center gap-2 text-xs text-white/70">
                <span className="capitalize">{status}</span>
                <span>•</span>
                <span>{new Date(story.createdAt).getFullYear()}</span>
              </div>

              <div className="flex items-center gap-4 mt-1 text-xs text-white/60">
                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md backdrop-blur-sm">
                  <Eye size={10} />
                  <span>
                    {viewCount >= 1000
                      ? `${(viewCount / 1000).toFixed(1)}K`
                      : viewCount}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md backdrop-blur-sm">
                  <Star size={10} className="fill-current" />
                  <span>{starRating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8">
            <button
              onClick={() => {
                if (!isAuthenticated()) {
                  openAuthModal("login");
                  return;
                }
                const url = continueTarget
                  ? `/story/${storyId}/read?${structure === "chapters" ? "chapterId" : "episodeId"}=${continueTarget.id}`
                  : `/story/${storyId}/read${
                      hasContent
                        ? `?${structure === "chapters" ? "chapterId" : "episodeId"}=${contentList[0].id}`
                        : ""
                    }`;
                router.push(url);
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-full font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-primary/25 active:scale-[0.98]"
            >
              <Play size={22} className="fill-current" />
              <span>
                {continueTarget && storyProgress
                  ? `Continue ${structure === "chapters" ? "Chapter" : "Episode"} ${
                      continueTarget.number ||
                      (structure === "chapters"
                        ? continueTarget.chapterNumber
                        : continueTarget.episodeNumber)
                    }`
                  : isSingleStory
                    ? "Read Story"
                    : `Play ${structure === "chapters" ? "Chapter" : "Episode"} 1`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 px-4 border-b border-white/5 backdrop-blur-xl bg-accent-shade-1/95">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          {!isSingleStory && (
            <button
              onClick={() => setActiveTab("episodes")}
              className={cn(
                "py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors relative",
                activeTab === "episodes"
                  ? "text-primary border-complimentary-colour"
                  : "text-primary/40 border-transparent hover:text-primary/60"
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
                : "text-primary/40 border-transparent hover:text-primary/60"
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
                : "text-primary/40 border-transparent hover:text-primary/60"
            )}
          >
            Reviews
            <span className="ml-1.5 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full opacity-80">
              {displayCommentCount}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-6">
        {activeTab === "episodes" && !isSingleStory && (
          <div className="space-y-4">
            {/* Reading Progress Indicator */}
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
                {storyProgress?.lastReadChapter ||
                storyProgress?.lastReadEpisode ? (
                  <div className="mt-1 text-xs text-primary/50">
                    Last: {structure === "chapters" ? "Chapter" : "Episode"}{" "}
                    {storyProgress.lastReadChapter ||
                      storyProgress.lastReadEpisode}
                  </div>
                ) : null}
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
                {!isSelectionMode ? (
                  <button
                    onClick={toggleSelectionMode}
                    className="transition-colors text-primary hover:text-white"
                  >
                    Select
                  </button>
                ) : (
                  <button
                    onClick={toggleSelectionMode}
                    className="transition-colors text-primary hover:text-white"
                  >
                    Cancel
                  </button>
                )}
                <button className="transition-colors text-complimentary-colour hover:text-complimentary-colour/80">
                  Sort: Oldest
                </button>
              </div>
            </div>

            {contentList?.map((item: any, index: number) => {
              const isSelected = selectedContentIds.has(item.id);
              const isItemDownloaded = downloadedContentIds.has(item.id);
              const isItemDownloading = downloadingItems.has(item.id);

              // Find progress for this specific episode/chapter
              const itemProgress =
                structure === "episodes"
                  ? aggregatedData?.episodeProgress?.find(
                      (ep: any) => ep.episodeId === item.id
                    )
                  : aggregatedData?.chapterProgress?.find(
                      (ch: any) => ch.chapterId === item.id
                    );

              const percentageRead = itemProgress
                ? parseFloat(itemProgress.percentageRead)
                : 0;
              const readingTime = itemProgress?.readingTimeSeconds || 0;
              const isCompleted = itemProgress?.isCompleted || false;
              const isRead = percentageRead > 0 || isCompleted;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-4 py-3 px-2 -mx-2 rounded-xl transition-colors relative group select-none",
                    isSelected
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-white/5",
                    isRead && !isSelected ? "opacity-50" : ""
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
                          : "border-white/20"
                      )}
                    >
                      {isSelected && <Check size={14} />}
                    </div>
                  ) : (
                    <Link
                      href={`/story/${storyId}/read?${structure === "chapters" ? "chapterId" : "episodeId"}=${item.id}`}
                      className="absolute inset-0 z-10"
                    />
                  )}

                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm relative",
                      isCompleted
                        ? "bg-green-500/20 text-green-500"
                        : percentageRead > 0
                          ? "bg-complimentary-colour/20 text-complimentary-colour"
                          : "bg-primary/10 text-primary/60 group-hover:bg-complimentary-colour group-hover:text-white"
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
                          ? new Date(item?.createdAt).toLocaleDateString()
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
                      {(() => {
                        const content = item.content || item.body;
                        const wordCount =
                          item.totalWords ||
                          (content ? content.trim().split(/\s+/).length : 0);

                        if (wordCount > 0) {
                          const mins = Math.ceil(wordCount / 200);
                          return (
                            <>
                              <span>•</span>
                              <span>{mins} min read</span>
                            </>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  <div className="z-20 flex items-center gap-2">
                    {isItemDownloaded ? (
                      <div className="flex items-center justify-center w-8 h-8 text-green-500 rounded-full bg-green-500/10">
                        <Check size={16} />
                      </div>
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
            {/* Aggregated Stats */}
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
                  : "border-primary/20 text-primary hover:bg-primary/5"
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
                    if (index < fullStars) {
                      return (
                        <Star key={index} size={20} className="fill-current" />
                      );
                    } else if (index === fullStars && hasHalfStar) {
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
                    } else {
                      return (
                        <Star
                          key={index}
                          size={20}
                          className="text-yellow-500/30"
                        />
                      );
                    }
                  })}
                </div>
                <p className="text-sm font-medium text-primary/40">
                  {displayCommentCount} reviews
                </p>
              </div>
            </div>

            {/* Write a Review Section */}
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
              {comments && comments.length > 0 ? (
                comments.map((comment: any) => (
                  <div
                    key={comment.id}
                    className="p-4 space-y-3 bg-white/5 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      {comment.user?.avatar ? (
                        <div className="relative flex-shrink-0 w-8 h-8 overflow-hidden rounded-full">
                          <Image
                            src={comment.user.avatar}
                            alt={
                              comment.user?.penName ||
                              comment.user?.firstName ||
                              "User"
                            }
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-xs font-bold rounded-full bg-primary/10 text-primary">
                          {(
                            comment.user?.firstName?.[0] ||
                            comment.user?.penName?.[0] ||
                            "U"
                          ).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-primary">
                          {comment.user?.penName ||
                            comment.user?.firstName ||
                            "User"}
                        </p>
                        <p className="text-primary/40 text-[10px]">
                          {new Date(comment.createdAt).toLocaleDateString()} at{" "}
                          {new Date(comment.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-primary/80">
                      {comment.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-sm text-center text-primary/40">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white/5">
                    <Star size={24} className="opacity-50" />
                  </div>
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Animated FAB */}
      <AnimatePresence>
        {showFab && (
          <motion.div
            initial={{ width: 200, opacity: 0, y: 50 }}
            animate={{ width: 56, opacity: 1, y: 0 }}
            exit={{ width: 200, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed z-50 overflow-hidden bottom-6 right-6"
          >
            <Link
              href={
                continueTarget
                  ? `/story/${storyId}/read?${structure === "chapters" ? "chapterId" : "episodeId"}=${continueTarget.id}`
                  : `/story/${storyId}/read${hasContent ? `?${structure === "chapters" ? "chapterId" : "episodeId"}=${contentList[0].id}` : ""}`
              }
              className="flex items-center justify-center text-white rounded-full shadow-lg w-14 h-14 bg-primary hover:bg-primary/90 shadow-primary/30"
            >
              <Play size={24} className="ml-1 fill-current" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection Mode Action Bar */}
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
    </div>
  );
};

export default SingleStory;
