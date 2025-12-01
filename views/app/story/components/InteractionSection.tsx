import React from "react";
import { Button } from "@heroui/button";
import { ThumbsUp, MessageCircle } from "lucide-react";
import { Magnetik_Regular } from "@/lib/font";

interface InteractionSectionProps {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  showComments?: boolean; // Optional, not used anymore
  onToggleLike: () => void;
  onToggleComments?: () => void; // Optional, not used anymore
}

export const InteractionSection = React.memo(
  ({
    likeCount,
    commentCount,
    isLiked,
    onToggleLike,
  }: InteractionSectionProps) => {
    return (
      <div className="p-3 space-y-2 rounded-lg bg-accent-shade-2">
        <div className="flex items-center justify-between pb-2 border-b border-primary-shade-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleLike}
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
          <span
            className={`${Magnetik_Regular.className} flex items-center gap-1 text-xs text-primary-colour`}
          >
            <ThumbsUp className="w-4 h-4 text-complimentary-colour" />
            {likeCount} Likes
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4 text-primary-shade-1" />
            <span
              className={`text-xs ${Magnetik_Regular.className} text-primary-colour`}
            >
              Comment
            </span>
          </div>
          <span
            className={`${Magnetik_Regular.className} flex items-center gap-1 text-xs text-primary-colour`}
          >
            <MessageCircle className="w-4 h-4 text-complimentary-colour" />
            {commentCount} comments
          </span>
        </div>
      </div>
    );
  }
);

InteractionSection.displayName = "InteractionSection";
