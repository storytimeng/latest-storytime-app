"use client";

import React, { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import Image from "next/image";
import { cn } from "@/lib/utils";
import MarqueeText from "./marqueeText";

interface Story {
  id: number;
  title: string;
  author: string;
  rating: number;
  comments: number;
  genre: string;
  image: string;
  status: string;
}

interface CategoryStoryCardProps {
  story: Story;
  className?: string;
}

const CategoryStoryCard = ({ story, className }: CategoryStoryCardProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error(`Image failed to load for story ${story.id}`);
    setImageError(true);
  };

  return (
    <div
      className={cn("bg-white rounded-xl overflow-hidden shadow-sm", className)}
    >
      {/* Story Image */}
      <div className="relative h-32">
        {imageError ? (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">
              No image available
            </span>
          </div>
        ) : (
          <Image
            src={story.image}
            alt={story.title}
            fill
            className="object-cover"
            onError={handleImageError}
          />
        )}
        {/* Genre Tag */}
        <div className="absolute top-2 right-2">
          <span className="bg-primary-colour text-white text-xs px-2 py-1 rounded">
            {story.genre}
          </span>
        </div>
      </div>

      {/* Story Content */}
      <div className="p-3">
        <div className="mb-1 flex items-center">
          <div className="flex-1">
            <MarqueeText
              text={story.title}
              className={`text-sm font-bold text-grey-1 ${Magnetik_Bold.className}`}
              speed={35}
            />
          </div>
          <span className="ml-1 text-primary-colour text-xs flex-shrink-0">
            {story.status === "Ongoing" ? "(Ongoing)" : ""}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-grey-3 fill-current" />
            <span
              className={`text-xs text-grey-3 ${Magnetik_Regular.className}`}
            >
              ({story.rating})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3 text-grey-3" />
            <span
              className={`text-xs text-grey-3 ${Magnetik_Regular.className}`}
            >
              {story.comments} Comments
            </span>
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-grey-4"></div>
          <span className={`text-xs text-grey-3 ${Magnetik_Medium.className}`}>
            By {story.author}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CategoryStoryCard;
