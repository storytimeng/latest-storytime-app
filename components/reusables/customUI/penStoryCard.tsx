"use client";

import React, { useState } from "react";
import { Button } from "@heroui/react";
import Image from "next/image";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { cn } from "@/lib/utils";

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
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ongoing":
        return "text-orange-600 bg-orange-100";
      case "Completed":
        return "text-green-600 bg-green-100";
      case "Draft":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className={cn("cursor-pointer", className)} onClick={handleCardClick}>
      <div className="space-y-3">
        {/* Story Cover */}
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-light-grey-2 group">
          {imageError ? (
            <div className="w-full h-full bg-light-grey-2 flex items-center justify-center">
              <span className="text-2xl">📖</span>
            </div>
          ) : (
            <Image
              src={story.coverImage}
              alt={story.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              onError={handleImageError}
              loading="lazy"
            />
          )}

          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              isIconOnly
              size="sm"
              variant="solid"
              className="bg-orange-500 hover:bg-orange-600 text-white min-w-6 w-6 h-6"
              onClick={handleEdit}
            >
              ✏️
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="solid"
              className="bg-red-500 hover:bg-red-600 text-white min-w-6 w-6 h-6"
              onClick={handleDelete}
            >
              🗑️
            </Button>
          </div>
        </div>

        {/* Story Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3
              className={`text-primary-colour text-sm font-medium ${Magnetik_Medium.className} truncate flex-1 pr-2`}
            >
              {story.title}
            </h3>
            <span
              className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(
                story.status
              )} ${Magnetik_Regular.className}`}
            >
              ({story.status})
            </span>
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
              className="text-orange-500 hover:bg-orange-50 min-w-6 w-6 h-6"
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
              className="text-red-500 hover:bg-red-50 min-w-6 w-6 h-6"
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
