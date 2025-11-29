"use client";

import { Card } from "@heroui/card";
import { ThumbsUp, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { Magnetik_Regular } from "@/lib/font";
import { cn } from "@/lib/utils";

interface Story {
  id: number | string;
  title: string;
  author?: string;
  rating?: number;
  comments?: number;
  genre: string;
  image: string;
  status?: string;
  writingDate?: string;
}

interface StoryCardProps {
  story: Story;
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

  const getInitials = (author: string) =>
    !author || author === "Anonymous"
      ? "A"
      : author
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();

  const getStatusColor = (status: string |
    undefined
  ) => {
    if (!status) return "text-gray-500";
    switch (status.toLowerCase()) {
      case "ongoing":
        return "text-orange-600";
      case "completed":
        return "text-green-600";
      case "draft":
        return "text-red-500";
      default:
        return "text-black";
    }
  };

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
            src={story.image}
            alt={story.title}
            width={400}
            height={300}
            className={cn(
              "w-full object-cover rounded-lg transition-transform group-hover:scale-[1.03]",
              isPenMode ? "aspect-[10/9]" : "h-28"
            )}
            onError={handleImageError}
            loading="lazy"
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
          {story.genre}
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
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              getStatusColor(story.status),
              Magnetik_Regular.className
            )}
          >
            ({story.status || "Unknown"})
          </span>
        </div>

        {isPenMode ? (
          <>
            {/* Writing Date (Pen Mode Only) */}
            {story.writingDate && (
              <p
                className={cn(
                  "text-[#361B17] text-xs",
                  Magnetik_Regular.className
                )}
              >
                Writing date: {story.writingDate}
              </p>
            )}
          </>
        ) : (
          <>
            {/* Likes + Comments */}
            {story.rating !== undefined && story.comments !== undefined && (
              <div className="flex items-center gap-3 text-xs text-[#361B17]">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 fill-[#F8951D] text-[#F8951D]" />
                  <span className={Magnetik_Regular.className}>
                    ({story.rating})
                  </span>
                </div>
                <span className={Magnetik_Regular.className}>
                  {story.comments} Comments
                </span>
              </div>
            )}

            {/* Author */}
            {story.author && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#FFEBD0] rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-[#361B17] font-bold">
                    {getInitials(story.author)}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-[#361B17] text-xs",
                    Magnetik_Regular.className
                  )}
                >
                  By {story.author}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default StoryCard;
