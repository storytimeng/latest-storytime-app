"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { cn } from "@/lib/utils";
import { StoryCoverImage } from "./StoryCoverImage";
import { StoryStatusIcon } from "./StoryStatusIcon";

interface MyStory {
  id: string;
  title: string;
  status: "Ongoing" | "Completed" | "Draft";
  genre: string;
  writingDate: string;
  coverImage: string;
  author?: string;
}

interface MyStoriesCardProps {
  story: MyStory;
  className?: string;
  onEdit?: (storyId: string) => void;
  onDelete?: (storyId: string) => void;
}

const MyStoriesCard = ({
  story,
  className,
  onEdit,
  onDelete,
}: MyStoriesCardProps) => {
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
    <Link href={`/story/${story.id}`} className={cn("block", className)}>
      <div className="space-y-3">
        {/* Story Cover */}
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-light-grey-2">
          <StoryCoverImage
            src={story.coverImage}
            alt={story.title}
            fill
            className="object-cover"
            loading="lazy"
          />

          {/* Action buttons */}
          <div className="absolute flex gap-1 top-2 right-2">
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              className="w-6 h-6 bg-universal-white/80 min-w-6"
              onClick={handleEdit}
            >
              <Edit className="w-3 h-3 text-primary-colour" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              className="w-6 h-6 bg-universal-white/80 min-w-6"
              onClick={handleDelete}
            >
              <Trash2 className="w-3 h-3 text-error-colour" />
            </Button>
          </div>
        </div>

        {/* Story Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3
              className={`text-primary-colour text-sm font-medium truncate flex-1 min-w-0 ${Magnetik_Medium.className}`}
            >
              {story.title}
            </h3>
            <StoryStatusIcon
              status={getStatusForIcon(story.status)}
              className="shrink-0"
            />
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full bg-complimentary-colour/10 text-complimentary-colour ${Magnetik_Regular.className}`}
            >
              {story.genre}
            </span>
          </div>

          <p
            className={`text-primary-shade-4 text-xs ${Magnetik_Regular.className}`}
          >
            Writing date: {story.writingDate}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default MyStoriesCard;
