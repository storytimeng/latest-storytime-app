import Link from "next/link";
import React from "react";
import { ArrowLeft, Dot, Eye, MessageSquare, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { Magnetik_Regular, Magnetik_Bold } from "@/lib";
import { cn } from "@/lib";
import {
  useStory,
  useStoryLikes,
  useStoryComments,
} from "@/src/hooks/useStoryDetail";
import { Skeleton } from "@heroui/skeleton";

interface SingleStoryProps {
  storyId?: string;
}

const SingleStory = ({ storyId }: SingleStoryProps) => {
  const { story, isLoading } = useStory(storyId);

  const { likeCount, isLiked, toggleLike } = useStoryLikes(storyId);
  const { commentCount } = useStoryComments(storyId);

  if (isLoading) {
    return (
      <div className="bg-accent-shade-1 min-h-screen p-4 space-y-4">
        <Skeleton className="w-full h-[400px] rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="w-3/4 h-8 rounded-lg" />
          <Skeleton className="w-1/2 h-4 rounded-lg" />
          <Skeleton className="w-full h-24 rounded-lg" />
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

  return (
    <div className="bg-accent-shade-1 min-h-screen">
      <div className="relative">
        {/* Story Image */}
        <div className="w-full h-[400px] relative">
          <Image
            src={displayImage}
            alt={story.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-accent-shade-1/90" />
        </div>

        {/* Header Overlay on Top of Image */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-10 pb-4 px-4">
          <div className="flex items-center justify-between">
            <Link
              href="/home"
              className="flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={24} className="text-white drop-shadow-md" />
            </Link>
          </div>
        </div>
      </div>

      {/* Content below image */}
      <div className="px-4 py-6 space-y-4 -mt-10 relative z-10">
        <div className="pb-4 border-b border-primary-1/20 space-y-3">
          <div className="flex items-start justify-between">
            <h2
              className={cn(
                "text-primary text-2xl leading-tight",
                Magnetik_Bold.className
              )}
            >
              {story.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "text-complimentary-colour text-xs px-2 py-0.5 border border-complimentary-colour rounded-full",
                Magnetik_Regular.className
              )}
            >
              {status}
            </span>
            {story.genres?.map((genre: string | undefined) => (
              <span
                key={genre}
                className={cn(
                  "text-white text-[10px] bg-complimentary-colour px-2 py-1 rounded-lg",
                  Magnetik_Regular.className
                )}
              >
                {genre}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-primary/80 text-xs">
            {isExclusive && (
              <>
                <p className={Magnetik_Regular.className}>Only on Storytime</p>
                <Dot size={16} />
              </>
            )}
            <p className={Magnetik_Regular.className}>
              {new Date(story.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-1.5">
              <Eye size={18} className="text-complimentary-colour" />
              <p
                className={cn(
                  "text-primary text-xs",
                  Magnetik_Regular.className
                )}
              >
                {viewCount} views
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <MessageSquare size={18} className="text-complimentary-colour" />
              <p
                className={cn(
                  "text-primary text-xs",
                  Magnetik_Regular.className
                )}
              >
                {commentCount} comments
              </p>
            </div>

            <button
              onClick={toggleLike}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <ThumbsUp
                size={18}
                className={cn(
                  "transition-colors",
                  isLiked
                    ? "text-complimentary-colour fill-complimentary-colour"
                    : "text-complimentary-colour"
                )}
              />
              <p
                className={cn(
                  "text-primary text-xs",
                  Magnetik_Regular.className
                )}
              >
                {likeCount} likes
              </p>
            </button>
          </div>
        </div>

        <div className="pb-20 space-y-6">
          <div
            className={cn(
              "text-primary-shade-2 text-sm leading-relaxed whitespace-pre-wrap"
            )}
          >
            {story.content}
          </div>

          <div className="flex items-center justify-center gap-3 bg-accent-shade-2 rounded-full py-3 px-6 w-fit mx-auto">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {(
                author?.firstName?.[0] ||
                author?.penName?.[0] ||
                author?.name?.[0] ||
                "A"
              ).toUpperCase()}
            </div>
            <p
              className={cn("text-primary text-sm", Magnetik_Regular.className)}
            >
              By{" "}
              {author?.penName ||
                `${author?.firstName ?? author?.name} ${author?.lastName ?? ""}`.trim() ||
                author?.name ||
                "Unknown Author"}
            </p>
          </div>

          <Link
            href={`/story/${storyId}/read`}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 transition-colors rounded-full py-4 w-full shadow-lg shadow-primary/20"
          >
            <p
              className={cn(
                "text-white text-base font-medium",
                Magnetik_Regular.className
              )}
            >
              Start Reading
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SingleStory;
