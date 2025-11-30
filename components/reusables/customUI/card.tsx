"use client";

import { Card } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { MessageCircle, ThumbsUp } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import {
  Magnetik_Medium,
  Magnetik_SemiBold,
  Magnetik_Regular,
} from "@/lib/font";

interface Story {
  id: number;
  title: string;
  author: string;
  rating: number;
  comments: number;
  genre: string;
  image: string;
  sample: string;
  status: string;
}

interface StoryCardProps {
  story: Story;
}

const StoryCard = ({ story }: StoryCardProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getInitials = (author: string) => {
    if (!author || author === "Anonymous") return "A";
    return author
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="w-full border-none rounded-lg">
      <div className="relative">
        {imageError ? (
          <div className="flex items-center justify-center w-full rounded-lg h-28 bg-muted">
            <span className="text-xs text-muted-foreground">
              No image available
            </span>
          </div>
        ) : (
          <Image
            src={story.image}
            alt={story.title}
            width={160}
            height={120}
            className="object-cover w-full rounded-lg h-28"
            onError={handleImageError}
            priority={false}
            unoptimized={false}
            loading="lazy"
          />
        )}
        <div className="absolute top-2 right-2">
          <div
            className={`bg-[#FFEBD0] text-[10px] rounded-md px-2 py-1 text-[#361B17] ${Magnetik_Regular.className}`}
          >
            {story.genre}
          </div>
        </div>
      </div>

      <div className="story-card-content">
        <div className="flex items-center justify-between">
          <h3
            className={`story-card-title text-[#361B17] ${Magnetik_SemiBold.className}`}
          >
            {story.title}
          </h3>
          <p
            className={`text-[#f8951d] text-[8px] ${Magnetik_Medium.className}`}
          >
            ({story.status})
          </p>
        </div>

        <div className="story-card-meta">
          <ThumbsUp className="w-3 h-3 text-[#F8951D] fill-[#F8951D]" />
          <span className="text-[10px] text-[#361B17]">({story.rating})</span>
          <MessageCircle className="w-3 h-3 text-[#361B17] ml-1" />
          <span className="text-[10px] text-[#361B17]">
            {story.comments} Comments
          </span>
        </div>

        <div className="story-card-author">
          <Avatar className="w-4 h-4 text-xs bg-[#FFEBD0] text-[#361B17]">
            {getInitials(story.author)}
          </Avatar>
          <span className="text-xs text-[#361B17]">By {story.author}</span>
        </div>
      </div>
    </Card>
  );
};

export default StoryCard;
