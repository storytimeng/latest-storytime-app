"use client";
import Link from "next/link";
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
} from "@/src/hooks/useStoryDetail";
import { Skeleton } from "@heroui/skeleton";
import { useDisclosure } from "@heroui/modal";
import { useOfflineStories } from "@/src/hooks/useOfflineStories";
import { showToast } from "@/lib/showNotification";
import { useUserStore } from "@/src/stores/useUserStore";
import { CollaboratorsModal } from "@/components/reusables/modals/CollaboratorsModal";
import { ImagePreviewModal } from "@/components/reusables/modals/ImagePreviewModal";
import { motion, AnimatePresence, useScroll } from "framer-motion";

interface SingleStoryProps {
  storyId?: string;
}

type Tab = "episodes" | "details" | "reviews";

const SingleStory = ({ storyId }: SingleStoryProps) => {
  const { story, isLoading } = useStory(storyId);
  const { likeCount, isLiked, toggleLike } = useStoryLikes(storyId);
  const { commentCount, comments } = useStoryComments(storyId);
  const { user: storeUser } = useUserStore();
  const [activeTab, setActiveTab] = useState<Tab>("episodes");

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
    onOpenChange: onCollaboratorsOpenChange 
  } = useDisclosure();

  const {
    isOpen: isImagePreviewOpen,
    onOpen: onOpenImagePreview,
    onOpenChange: onImagePreviewOpenChange
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
    currentAuthorId &&
    storyAuthorId &&
    currentAuthorId === storyAuthorId;

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
  const shouldFetchChapters = structure === "chapters" && !storyData?.chapters?.length && !isLoading;
  const shouldFetchEpisodes = structure === "episodes" && !storyData?.episodes?.length && !isLoading;

  const { chapters: fetchedChapters } = useStoryChapters(
    shouldFetchChapters ? storyId : undefined
  );
  const { episodes: fetchedEpisodes } = useStoryEpisodes(
    shouldFetchEpisodes ? storyId : undefined
  );

  const chapters = storyData?.chapters?.length ? storyData.chapters : fetchedChapters;
  const episodes = storyData?.episodes?.length ? storyData.episodes : fetchedEpisodes;

  // Offline functionality
  const {
    isStoryDownloaded,
    downloadStory,
    deleteOfflineStory,
    syncStoryIfNeeded,
    syncAllChapters,
    syncAllEpisodes,
  } = useOfflineStories();

  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
      <div className="bg-accent-shade-1 min-h-screen pb-20 relative">
        {/* Hero Skeleton */}
        <div className="relative w-full h-[480px] overflow-hidden">
          <Skeleton className="absolute inset-0 w-full h-full opacity-20" />
          <div className="absolute inset-0 z-10 flex flex-col justify-end px-4 pb-8">
            <div className="flex gap-5 items-end">
              <Skeleton className="w-36 h-52 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-3 mb-1">
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
              <Skeleton className="w-full h-14 rounded-full" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="px-4 py-4 flex gap-8 border-b border-white/5">
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
      <div className="bg-accent-shade-1 min-h-screen flex items-center justify-center">
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
  const displayImage = story.imageUrl || "/placeholder-image.jpg";
  const status = (story as any).storyStatus || "Ongoing";
  const isExclusive = (story as any).onlyOnStorytime || false;
  const viewCount = (story as any).viewCount || 0;
  const popularityScore = (story as any).popularityScore || 0;
  const collaborators = (story as any).collaborate as string[] | null;

  return (
    <div className="bg-accent-shade-1 min-h-screen pb-20 relative">
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
            className="object-cover blur-2xl opacity-40 scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-accent-shade-1" />
        </div>
        {/* Header Navigation */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-6 px-4">
          <div className="flex items-center justify-between">
            <Link href="/home" className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
              <ArrowLeft size={24} className="text-white" />
            </Link>
            <button className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
              <Share2 size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end px-4 pb-8">
          <div className="flex gap-5 items-end">
            <motion.div 
              className="relative w-36 h-52 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 border border-white/10 ring-1 ring-black/20 cursor-pointer"
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
              <h1 className={cn("text-white text-2xl font-bold leading-tight line-clamp-2 drop-shadow-sm", Magnetik_Bold.className)}>
                {story.title}
              </h1>
              
              <button 
                onClick={onOpenCollaborators}
                className="flex items-center gap-2 text-white/90 text-xs hover:text-white transition-colors group"
              >
                <span className="font-medium border-b border-transparent group-hover:border-white/50 transition-all">
                  {author?.penName || author?.name || "Unknown"}
                </span>
                <Users size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <span className="capitalize">{status}</span>
                <span>•</span>
                <span>{new Date(story.createdAt).getFullYear()}</span>
              </div>

              <div className="flex items-center gap-4 text-white/60 text-xs mt-1">
                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md backdrop-blur-sm">
                  <Play size={10} className="fill-current" />
                  <span>{(viewCount / 1000).toFixed(1)}K</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md backdrop-blur-sm">
                  <Star size={10} className="fill-current" />
                  <span>{popularityScore > 0 ? popularityScore : "4.8"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8">
            <Link
              href={`/story/${storyId}/read${hasContent ? `?${structure === "chapters" ? "chapterId" : "episodeId"}=${contentList[0].id}` : ""}`}
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-full font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-primary/25 active:scale-[0.98]"
            >
              <Play size={22} className="fill-current" />
              <span>
                {isSingleStory 
                  ? "Read Story" 
                  : `Play ${structure === "chapters" ? "Chapter" : "Episode"} 1`}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-accent-shade-1 border-b border-white/5 px-4 backdrop-blur-xl bg-accent-shade-1/95">
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
            <div className="flex items-center justify-between text-xs text-primary/40 mb-2 font-medium uppercase tracking-wider">
              <span>All {structure === "chapters" ? "Chapters" : "Episodes"}</span>
              <button className="text-complimentary-colour hover:text-complimentary-colour/80 transition-colors">Sort: Oldest</button>
            </div>
            
            {contentList?.map((item: any, index: number) => (
              <Link
                key={item.id}
                href={`/story/${storyId}/read?${structure === "chapters" ? "chapterId" : "episodeId"}=${item.id}`}
                className="flex items-center gap-4 py-3 group hover:bg-white/5 rounded-xl transition-colors px-2 -mx-2"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary/60 group-hover:bg-complimentary-colour group-hover:text-white transition-all shadow-sm">
                  <Play size={14} className="fill-current ml-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-primary text-sm font-medium truncate group-hover:text-complimentary-colour transition-colors">
                    {item.title || `${structure === "chapters" ? "Chapter" : "Episode"} ${index + 1}`}
                  </h3>
                  <p className="text-primary/40 text-xs mt-1">
                    {new Date(item.createdAt || Date.now()).toLocaleDateString()} • {Math.ceil((item.content?.length || 0) / 1000)} min read
                  </p>
                </div>
                <div className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-primary/20 group-hover:border-complimentary-colour/50 group-hover:text-complimentary-colour transition-colors">
                  <Play size={12} className="fill-current" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === "details" && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-primary font-bold text-lg">About the Story</h3>
              <p className="text-primary/70 text-sm leading-relaxed whitespace-pre-wrap">
                {story.description}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-primary font-bold text-sm">Genres</h3>
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
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-primary/20 text-primary hover:bg-primary/5 transition-colors font-medium"
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
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
            <div className="flex items-center gap-4 mb-6 bg-white/5 p-6 rounded-2xl">
              <div className="text-5xl font-bold text-primary">{popularityScore > 0 ? popularityScore : "4.8"}</div>
              <div className="space-y-2">
                <div className="flex text-yellow-500 gap-1">
                  <Star size={20} className="fill-current" />
                  <Star size={20} className="fill-current" />
                  <Star size={20} className="fill-current" />
                  <Star size={20} className="fill-current" />
                  <Star size={20} className="fill-current" />
                </div>
                <p className="text-primary/40 text-sm font-medium">{displayCommentCount} ratings</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {comments && comments.length > 0 ? (
                comments.map((comment: any) => (
                  <div key={comment.id} className="bg-white/5 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {(comment.user?.firstName?.[0] || comment.user?.penName?.[0] || "U").toUpperCase()}
                      </div>
                      <div>
                        <p className="text-primary font-medium text-sm">
                          {comment.user?.penName || comment.user?.firstName || "User"}
                        </p>
                        <p className="text-primary/40 text-[10px]">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-primary/80 text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-primary/40 text-sm">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
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
            className="fixed bottom-6 right-6 z-50 overflow-hidden"
          >
            <Link
              href={`/story/${storyId}/read${hasContent ? `?${structure === "chapters" ? "chapterId" : "episodeId"}=${contentList[0].id}` : ""}`}
              className="w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30"
            >
              <Play size={24} className="fill-current ml-1" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SingleStory;
