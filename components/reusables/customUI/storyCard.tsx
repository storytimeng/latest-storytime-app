"use client";

import { Card } from "@heroui/card";
import { ThumbsUp, Pencil, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { Magnetik_Regular } from "@/lib/font";
import { cn } from "@/lib/utils";
import { StoryResponseDto, AuthorDto } from "@/src/client/types.gen";

// Extend AuthorDto to include fields that may be in the API response
interface ExtendedAuthor extends AuthorDto {
  firstName?: string;
  lastName?: string;
  penName?: string;
}

// Extend the generated type to match the actual API response
interface ExtendedStory extends Omit<StoryResponseDto, "viewCount"> {
  author: ExtendedAuthor;
  anonymous?: boolean;
  onlyOnStorytime?: boolean;
  storyStatus?: string;
  popularityScore?: number;
  // Legacy fields that might still be used or needed for compatibility
  status?: string;
  rating?: number;
  comments?: number;
  viewCount?: number;
}

interface StoryCardProps {
  story: ExtendedStory;
  className?: string;
  mode?: "default" | "pen";
  hideStats?: boolean;
  onEdit?: (storyId: string | number) => void;
  onDelete?: (storyId: string | number) => void;
  onClick?: (storyId: string | number) => void;
}

const StoryCard = ({
  story,
  className,
  mode = "default",
  hideStats = false,
  onEdit,
  onDelete,
  onClick,
}: StoryCardProps) => {
  const [imageError, setImageError] = useState(false);
  const isPenMode = mode === "pen";

  const handleImageError = () => setImageError(true);
  const handleCardClick = () => onClick?.(story.id);
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit?.(story.id);
  };
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete?.(story.id);
  };

  // Safe access to author name - if story is anonymous, show "Anonymous"
  const authorName = story.anonymous
    ? "Anonymous"
    : story.author?.penName ||
      (story.author?.firstName && story.author?.lastName
        ? `${story.author.firstName} ${story.author.lastName}`.trim()
        : story.author?.firstName || story.author?.lastName) ||
      story.author?.name ||
      "Anonymous";
  const displayImage = story.imageUrl || "/images/storytime-fallback.png"; // Fallback image
  const displayGenre = story.genres?.[0] || "Uncategorized";

  const storyLink = `/story/${story.id}`;

  const cardContent = (
    <Card
      className={cn(
        "flex-shrink-0 rounded-xl border-none bg-transparent shadow-none space-y-2 relative",
        isPenMode ? "w-full cursor-pointer" : "w-[160px] cursor-pointer",
        className,
      )}
      onClick={isPenMode ? handleCardClick : undefined}
    >
      <div className="relative group">
        {imageError ? (
          <Image
            src="/images/storytime-fallback.png"
            alt={story.title}
            width={200}
            height={150}
            className={cn(
              "w-full object-cover rounded-lg transition-transform group-hover:scale-[1.03]",
              isPenMode ? "aspect-[10/9]" : "h-28",
            )}
          />
        ) : (
          <Image
            src={displayImage}
            alt={story.title}
            width={200}
            height={150}
            className={cn(
              "w-full object-cover rounded-lg transition-transform group-hover:scale-[1.03]",
              isPenMode ? "aspect-[10/9]" : "h-28",
            )}
            onError={handleImageError}
            loading="lazy"
            sizes="(max-width: 768px) 160px, 200px"
          />
        )}

        {/* Badge (genre) - same for both modes but different placement */}
        <div
          className={cn(
            "absolute rounded-md px-2 py-1 text-[10px] text-[#361B17] bg-[#FFEBD0]",
            Magnetik_Regular.className,
            isPenMode ? "top-3 left-3" : "top-2 right-2",
          )}
        >
          {displayGenre}
        </div>

        {/* Action buttons for pen mode */}
        {isPenMode && (
          <>
            {onEdit && (
              <button
                onClick={handleEdit}
                className="absolute right-2 top-2 w-8 h-8 rounded-full bg-[#F5E6D3] flex items-center justify-center hover:bg-[#E5D6C3] transition-colors"
              >
                <Pencil className="w-4 h-4 text-primary-colour" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="absolute left-2 bottom-2 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Card Content */}
      <div className="space-y-2">
        {/* Title + Status */}
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              "truncate text-sm font-semibold text-[#361B17] flex-1",
            )}
          >
            {story.title}
          </h3>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              getStatusColor(story.storyStatus || story.status),
              Magnetik_Regular.className,
            )}
          >
            ({story.storyStatus || story.status || "Unknown"})
          </span>
        </div>

        {isPenMode ? (
          <>
            {/* Writing Date (Pen Mode Only) */}
            {story.createdAt && (
              <p
                className={cn(
                  "text-[#361B17] text-xs",
                  Magnetik_Regular.className,
                )}
              >
                Writing date: {new Date(story.createdAt).toLocaleDateString()}
              </p>
            )}
          </>
        ) : (
          <>
            {/* Likes + Comments + Views */}
            {!hideStats && (
              <div className="flex items-center gap-3 text-xs text-[#361B17]">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 fill-[#F8951D] text-[#F8951D]" />
                  <span className={Magnetik_Regular.className}>
                    ({story.likeCount ?? story.rating ?? 0})
                  </span>
                </div>
                <span className={Magnetik_Regular.className}>
                  {story.commentCount ?? story.comments ?? 0} Comments
                </span>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-[#361B17]" />
                  <span className={Magnetik_Regular.className}>
                    {story.viewCount ?? 0}
                  </span>
                </div>
              </div>
            )}

            {/* Author */}
            <div className="flex items-center gap-2">
              {story.author?.avatar ? (
                <div className="relative w-4 h-4 overflow-hidden rounded-full">
                  <Image
                    src={story.author.avatar}
                    alt={authorName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-4 h-4 bg-[#FFEBD0] rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-[#361B17] font-bold">
                    {getInitials(authorName)}
                  </span>
                </div>
              )}
              <span
                className={cn(
                  "text-[#361B17] text-xs",
                  Magnetik_Regular.className,
                )}
              >
                By {authorName}
              </span>
            </div>
          </>
        )}
      </div>
    </Card>
  );

  // Wrap in Link for default mode, return as-is for pen mode
  if (isPenMode) {
    return cardContent;
  }

  return (
    <Link href={storyLink} className="block">
      {cardContent}
    </Link>
  );
};

// Helper functions moved outside component to prevent recreation on render
function getInitials(name: string) {
  if (!name || name.trim() === "" || name === "Anonymous") {
    return "A";
  }
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getStatusColor(status: string | undefined) {
  if (!status) return "text-gray-500";
  switch (status.toLowerCase()) {
    case "complete":
    case "completed":
      return "text-green-600";
    case "ongoing":
      return "text-orange-600";
    case "draft":
    case "drafts":
      return "text-red-500";
    default:
      return "text-black";
  }
}

export default StoryCard;
