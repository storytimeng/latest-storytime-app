"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { cn } from "@/lib/utils";
import { StoryCoverImage } from "./StoryCoverImage";
import { StoryStatusIcon } from "./StoryStatusIcon";

interface Story {
  id: string;
  title: string;
  status: "Ongoing" | "Completed" | "Draft";
  genre: string;
  writingDate: string;
  coverImage: string;
  author?: string;
  lastEdited?: string;
}

interface PenStoryCardProps {
  story: Story;
  className?: string;
  onEdit?: (storyId: string) => void;
  onDelete?: (storyId: string) => void;
  onClick?: (storyId: string) => void;
}

const PenStoryCard: React.FC<PenStoryCardProps> = ({
  story,
  className,
  onEdit,
  onDelete,
  onClick,
}) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(story.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(story.id);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(story.id);
    }
  };

  const getStatusForIcon = (status: string) => {
    switch (status) {
      case "Ongoing":
        return "ongoing";
      case "Completed":
        return "completed";
      case "Draft":
        return "draft";
      default:
        return status;
    }
  };

  return (
    <div className={cn("cursor-pointer", className)} onClick={handleCardClick}>
      <div className="space-y-3">
        {/* Story Cover */}
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-light-grey-2 group">
          <StoryCoverImage
            src={story.coverImage}
            alt={story.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />

          {/* Action buttons */}
          <div className="absolute flex gap-1 transition-opacity opacity-0 top-2 right-2 group-hover:opacity-100">
            <Button
              isIconOnly
              size="sm"
              variant="solid"
              className="w-6 h-6 text-white bg-orange-500 hover:bg-orange-600 min-w-6"
              onClick={handleEdit}
            >
              ✏️
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="solid"
              className="w-6 h-6 text-white bg-red-500 hover:bg-red-600 min-w-6"
              onClick={handleDelete}
            >
              🗑️
            </Button>
          </div>
        </div>

        {/* Story Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3
              className={`text-primary-colour text-sm font-medium ${Magnetik_Medium.className} truncate flex-1 min-w-0`}
            >
              {story.title}
            </h3>
            <StoryStatusIcon
              status={getStatusForIcon(story.status)}
              className="shrink-0"
            />
          </div>

          <div className="flex items-center justify-between">
            <span
              className={`text-complimentary-colour bg-complimentary-colour/10 px-2 py-1 rounded text-xs ${Magnetik_Regular.className}`}
            >
              {story.genre}
            </span>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              className="w-6 h-6 text-orange-500 hover:bg-orange-50 min-w-6"
              onClick={handleEdit}
            >
              ✏️
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <p
              className={`text-gray-500 text-xs ${Magnetik_Regular.className}`}
            >
              Writing date: {story.writingDate}
            </p>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              className="w-6 h-6 text-red-500 hover:bg-red-50 min-w-6"
              onClick={handleDelete}
            >
              🗑️
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PenStoryCard;
