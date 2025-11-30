"use client";

import { Card } from "@heroui/card";
import { ThumbsUp, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { Magnetik_Regular } from "@/lib/font";
import { cn } from "@/lib/utils";
import { StoryResponseDto, AuthorDto } from "@/src/client/types.gen";

// Use the generated type directly, or extend it if needed for UI-specific props
interface StoryCardProps {
  story: StoryResponseDto;
  className?: string;
  mode?: "default" | "pen";
  onEdit?: (storyId: string | number) => void;
  onDelete?: (storyId: string | number) => void;
  onClick?: (storyId: string | number) => void;
}

const StoryCard = ({
  story,
  className,
  mode = "default",
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
    onEdit?.(story.id);
  };
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(story.id);
  };

  // Safe access to author name - cast to any because generated AuthorDto might be missing penName
  const authorName = (story.author as any)?.penName || story.author?.name || "Anonymous";
  const displayImage = story.imageUrl || "/placeholder-image.jpg"; // Fallback image
  const displayGenre = story.genres?.[0] || "Uncategorized";

  return (
    <Card
      className={cn(
        "flex-shrink-0 rounded-xl border-none bg-transparent shadow-none space-y-2 relative",
        isPenMode ? "w-full cursor-pointer" : "w-[160px]",
        className
      )}
      onClick={isPenMode ? handleCardClick : undefined}
    >
      <div className="relative group">
        {imageError ? (
          <div
            className={cn(
              "w-full bg-muted flex items-center justify-center rounded-lg",
              isPenMode ? "aspect-[10/9]" : "h-28"
            )}
          >
            <span className="text-xs text-muted-foreground">No image</span>
          </div>
        ) : (
          <Image
            src={displayImage}
            alt={story.title}
            width={200}
            height={150}
            className={cn(
              "w-full object-cover rounded-lg transition-transform group-hover:scale-[1.03]",
              isPenMode ? "aspect-[10/9]" : "h-28"
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
            isPenMode ? "top-3 left-3" : "top-2 right-2"
          )}
        >
          {displayGenre}
        </div>

        {/* Action buttons for pen mode */}
        {isPenMode && (
          <div className="absolute flex flex-col gap-2 right-2 top-2">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="w-6 h-6 rounded-full bg-[#F5E6D3] flex items-center justify-center hover:bg-[#E5D6C3]"
              >
                <Pencil className="w-3 h-3 text-primary-colour" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="w-6 h-6 rounded-full bg-[#F5E6D3] flex items-center justify-center hover:bg-[#E5D6C3]"
              >
                <Trash2 className="w-3 h-3 text-primary-colour" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="space-y-2">
        {/* Title + Status */}
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              "truncate text-sm font-semibold text-[#361B17] flex-1"
            )}
          >
            {story.title}
          </h3>
          {/* Note: storyStatus might not be available on all story objects depending on the endpoint */}
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              getStatusColor((story as any).storyStatus || (story as any).status),
              Magnetik_Regular.className
            )}
          >
            ({(story as any).storyStatus || (story as any).status || "Unknown"})
          </span>
        </div>

        {isPenMode ? (
          <>
            {/* Writing Date (Pen Mode Only) */}
            {story.createdAt && (
              <p
                className={cn(
                  "text-[#361B17] text-xs",
                  Magnetik_Regular.className
                )}
              >
                Writing date: {new Date(story.createdAt).toLocaleDateString()}
              </p>
            )}
          </>
        ) : (
          <>
            {/* Likes + Comments */}
            {/* Note: These fields might need to be added to StoryResponseDto or handled if missing */}
            <div className="flex items-center gap-3 text-xs text-[#361B17]">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3 fill-[#F8951D] text-[#F8951D]" />
                <span className={Magnetik_Regular.className}>
                  ({(story as any).rating || 0})
                </span>
              </div>
              <span className={Magnetik_Regular.className}>
                {(story as any).comments || 0} Comments
              </span>
            </div>

            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#FFEBD0] rounded-full flex items-center justify-center">
                <span className="text-[8px] text-[#361B17] font-bold">
                  {getInitials(authorName)}
                </span>
              </div>
              <span
                className={cn(
                  "text-[#361B17] text-xs",
                  Magnetik_Regular.className
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
