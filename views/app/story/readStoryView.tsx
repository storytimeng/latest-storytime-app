import React, { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Select, SelectItem } from "@heroui/select";
import {
  ThumbsUp,
  MessageCircle,
  MoreVertical,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@heroui/skeleton";
import {
  useStory,
  useStoryLikes,
  useStoryComments,
  useStoryChapters,
  useStoryEpisodes,
} from "@/src/hooks/useStoryDetail";

interface ReadStoryViewProps {
  storyId: string;
}

export const ReadStoryView = ({ storyId }: ReadStoryViewProps) => {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Data hooks
  const { story, isLoading: isStoryLoading } = useStory(storyId);
  const { likeCount, isLiked, toggleLike } = useStoryLikes(storyId);
  const {
    comments,
    commentCount,
    isLoading: isCommentsLoading,
    createComment,
  } = useStoryComments(storyId);
  const { chapters, isLoading: isChaptersLoading } = useStoryChapters(storyId);
  const { episodes, isLoading: isEpisodesLoading } = useStoryEpisodes(storyId);

  // UI State
  const [showComments, setShowComments] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Content State
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null
  );
  const [currentContent, setCurrentContent] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");

  // Initialize content
  useEffect(() => {
    if (story) {
      if (chapters && chapters.length > 0) {
        // Default to first chapter
        if (!selectedChapterId) {
          setSelectedChapterId(chapters[0].id);
          setCurrentContent(chapters[0].content);
          setCurrentTitle(chapters[0].title);
        } else {
          const chapter = chapters.find((c: any) => c.id === selectedChapterId);
          if (chapter) {
            setCurrentContent(chapter.content);
            setCurrentTitle(chapter.title);
          }
        }
      } else if (episodes && episodes.length > 0) {
        // Default to first episode
        if (!selectedChapterId) {
          setSelectedChapterId(episodes[0].id);
          setCurrentContent(episodes[0].content);
          setCurrentTitle(episodes[0].title);
        } else {
          const episode = episodes.find((e: any) => e.id === selectedChapterId);
          if (episode) {
            setCurrentContent(episode.content);
            setCurrentTitle(episode.title);
          }
        }
      } else {
        // No chapters/episodes, use story content
        setCurrentContent(story.content || "No content available.");
        setCurrentTitle(story.title);
      }
    }
  }, [story, chapters, episodes, selectedChapterId]);

  // Handle scroll to show/hide navigation bars
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? "down" : "up";

      if (scrollDirection === "up" || currentScrollY < 10) {
        setIsNavVisible(true);
      } else if (scrollDirection === "down" && currentScrollY > 100) {
        setIsNavVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await createComment(commentText);
      setCommentText("");
    } catch (error) {
      console.error("Failed to submit comment", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handlePrevious = () => {
    if (!chapters && !episodes) return;

    const list = chapters?.length ? chapters : episodes;
    if (!list || list.length === 0) return;

    const currentIndex = list.findIndex(
      (item: any) => item.id === selectedChapterId
    );
    if (currentIndex > 0) {
      setSelectedChapterId(list[currentIndex - 1].id);
      window.scrollTo(0, 0);
    }
  };

  const handleNext = () => {
    if (!chapters && !episodes) return;

    const list = chapters?.length ? chapters : episodes;
    if (!list || list.length === 0) return;

    const currentIndex = list.findIndex(
      (item: any) => item.id === selectedChapterId
    );
    if (currentIndex < list.length - 1) {
      setSelectedChapterId(list[currentIndex + 1].id);
      window.scrollTo(0, 0);
    }
  };

  if (isStoryLoading) {
    return (
      <div className="min-h-screen bg-accent-shade-1 p-4 space-y-4">
        <Skeleton className="w-full h-12 rounded-lg" />
        <Skeleton className="w-full h-96 rounded-lg" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
        <p className="text-primary">Story not found</p>
      </div>
    );
  }

  const hasNavigation =
    (chapters && chapters.length > 1) || (episodes && episodes.length > 1);
  const navigationList = chapters?.length ? chapters : episodes;

  return (
    <div className="min-h-screen bg-accent-shade-1 relative overflow-hidden max-w-[28rem] mx-auto">
      {/* Header */}
      <div
        className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-accent-shade-1 px-4 pt-5 pb-4 z-40 transition-transform duration-300 ${
          isNavVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <Link href={`/story/${storyId}`}>
            <ArrowLeft className="w-6 h-6 text-primary-colour" />
          </Link>
        </div>
      </div>

      {/* Title Bar */}
      <div
        className={`fixed top-16 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-accent-colour px-4 py-3 z-40 transition-transform duration-300 ${
          isNavVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <h1
            className={`text-lg text-primary-colour truncate flex-1 min-w-0 pr-2 ${Magnetik_Bold.className}`}
          >
            {currentTitle || story.title}
          </h1>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex-shrink-0 border-none"
          >
            <MoreVertical className="w-5 h-5 rotate-90 text-primary-colour" />
          </Button>
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute z-50 w-40 mt-1 border rounded-lg shadow-lg top-full right-4 bg-universal-white border-light-grey-2">
            <button
              className="w-full px-4 py-3 text-sm text-left border-b text-primary-colour hover:bg-accent-shade-1 border-light-grey-2"
              onClick={() => setShowDropdown(false)}
            >
              Add to library
            </button>
          </div>
        )}
      </div>

      {/* Chapter Selector (if applicable) */}
      {hasNavigation && navigationList && (
        <div
          className={`fixed top-28 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-accent-shade-1 px-4 py-3 z-40 transition-transform duration-300 ${
            isNavVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <Select
            placeholder="Select Chapter"
            variant="flat"
            selectedKeys={selectedChapterId ? [selectedChapterId] : []}
            onSelectionChange={(keys) => {
              const value = Array.from(keys as Set<string>)[0];
              setSelectedChapterId(value);
              window.scrollTo(0, 0);
            }}
            classNames={{
              trigger: "bg-transparent shadow-none hover:bg-transparent",
              value: "text-primary-colour",
            }}
          >
            {navigationList.map((item: any) => (
              <SelectItem key={item.id} id={item.id}>
                {item.title ||
                  `Chapter ${item.chapterNumber || item.episodeNumber}`}
              </SelectItem>
            ))}
          </Select>
        </div>
      )}

      {/* Content */}
      <div
        className={`px-4 py-6 pb-24 ${hasNavigation ? "pt-44" : "pt-32"}`}
        ref={scrollContainerRef}
      >
        <div className="mb-6 space-y-4">
          <div
            className={`text-primary-shade-5 text-sm leading-relaxed whitespace-pre-wrap ${Magnetik_Regular.className}`}
          >
            {currentContent}
          </div>

          {/* Divider */}
          <div className="w-full h-px my-6 bg-light-grey-2" />

          {/* Author Section */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar
              src={story.author.avatar || "/images/placeholder-image.svg"}
              name={story.author.name}
              size="sm"
              className="w-6 h-6"
            />
            <span
              className={`text-primary-colour text-xs ${Magnetik_Medium.className}`}
            >
              By {story.author.name}
            </span>
          </div>
        </div>

        {/* Interaction Section */}
        <div className="p-2 space-y-2 rounded-lg bg-accent-shade-2">
          {/* Like and Comment Stats */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLike}
                  className="flex items-center min-w-0 gap-1 p-0 border-none text-primary-colour"
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${
                      isLiked
                        ? "fill-complimentary-colour text-complimentary-colour"
                        : "text-primary-shade-1"
                    }`}
                  />
                  <span className={`text-xs ${Magnetik_Regular.className}`}>
                    Like
                  </span>
                </Button>
              </div>
              <div className="flex items-center gap-4 text-xs text-primary-colour">
                <span className={`${Magnetik_Regular.className} flex flex-row`}>
                  <ThumbsUp
                    className={`w-4 h-4 text-complimentary-colour mr-[1.5px]`}
                  />
                  {likeCount} Likes
                </span>
              </div>
            </div>
            <div className="h-px bg-primary-shade-1" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center min-w-0 gap-1 p-0 border-none text-primary-colour"
                >
                  <MessageCircle className="w-4 h-4 text-primary-shade-1" />
                  <span className={`text-xs ${Magnetik_Regular.className}`}>
                    Comment
                  </span>
                </Button>
              </div>
              <div className="flex items-center gap-4 text-xs text-primary-colour">
                <span className={`${Magnetik_Regular.className} flex flex-row`}>
                  <MessageCircle className="w-4 h-4 text-complimentary-colour mr-[1.5px]" />
                  {commentCount} comments
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px -mx-2 bg-primary-shade-1" />

          {/* Comments */}
          {showComments && (
            <div className="flex flex-col justify-center px-2 space-y-3">
              {/* Comment Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 text-xs bg-transparent border-b border-light-grey-2 focus:outline-none focus:border-complimentary-colour"
                />
                <Button
                  size="sm"
                  variant="flat"
                  isLoading={isSubmittingComment}
                  onClick={handleCommentSubmit}
                  className="bg-complimentary-colour text-white text-xs h-8"
                >
                  Post
                </Button>
              </div>

              {comments.map((comment: any) => (
                <div
                  key={comment.id}
                  className="pt-3 border-t border-light-grey-2 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar
                      src={
                        comment.user?.avatar || "/images/placeholder-image.svg"
                      }
                      name={comment.user?.name || "User"}
                      size="sm"
                      className="w-4 h-4"
                    />
                    <span
                      className={`text-primary-colour text-xs ${Magnetik_Medium.className}`}
                    >
                      {comment.user?.name || "User"}
                    </span>
                    <span className="text-[10px] text-primary-shade-3">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p
                    className={`text-primary-shade-4 text-xs leading-relaxed ${Magnetik_Regular.className}`}
                  >
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      {hasNavigation && (
        <div
          className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-[#FFEBD0CC] backdrop-blur-sm z-40 transition-all duration-300 ${
            isNavVisible ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="px-4 py-4">
            <div className="flex items-center justify-between w-full">
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                isDisabled={
                  navigationList &&
                  navigationList.findIndex(
                    (i: any) => i.id === selectedChapterId
                  ) === 0
                }
                className="flex-shrink-0 bg-accent-shade-1 border-complimentary-shade-1 rounded-full p-[6px]"
              >
                <ChevronLeft className="w-6 h-6 text-complimentary-colour" />
              </Button>

              <span
                className={`text-xs text-primary-colour ${Magnetik_Medium.className}`}
              >
                {navigationList &&
                  `${navigationList.findIndex((i: any) => i.id === selectedChapterId) + 1} / ${navigationList.length}`}
              </span>

              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                onClick={handleNext}
                isDisabled={
                  navigationList &&
                  navigationList.findIndex(
                    (i: any) => i.id === selectedChapterId
                  ) ===
                    navigationList.length - 1
                }
                className="flex-shrink-0 bg-accent-shade-1 border-complimentary-shade-1 rounded-full p-[6px]"
              >
                <ChevronRight className="w-6 h-6 text-complimentary-colour" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
