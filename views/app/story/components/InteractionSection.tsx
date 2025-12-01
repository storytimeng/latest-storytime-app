import React from "react";
import { Button } from "@heroui/button";
import { ThumbsUp, MessageCircle } from "lucide-react";
import { Magnetik_Regular } from "@/lib/font";

interface InteractionSectionProps {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  showComments: boolean;
  onToggleLike: () => void;
  onToggleComments: () => void;
}

export const InteractionSection = React.memo(
  ({
    likeCount,
    commentCount,
    isLiked,
    showComments,
    onToggleLike,
    onToggleComments,
  }: InteractionSectionProps) => {
    return (
      <div className="p-2 space-y-2 rounded-lg bg-accent-shade-2">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
            </div>
            <div className="flex items-center gap-4 text-xs text-primary-colour">
              <span className={`${Magnetik_Regular.className} flex flex-row`}>
                <ThumbsUp
                  className={`w-4 h-4 text-complimentary-colour mr-[1.5px]`}
                />
                {likeCount} Likes
              </span>
            </div>
          </div>
          <div className="h-px bg-primary-shade-1" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleComments}
                className="flex items-center min-w-0 gap-1 p-0 border-none text-primary-colour"
              >
                <MessageCircle className="w-4 h-4 text-primary-shade-1" />
                <span className={`text-xs ${Magnetik_Regular.className}`}>
                  Comment
                </span>
              </Button>
            </div>
            <div className="flex items-center gap-4 text-xs text-primary-colour">
              <span className={`${Magnetik_Regular.className} flex flex-row`}>
                <MessageCircle className="w-4 h-4 text-complimentary-colour mr-[1.5px]" />
                {commentCount} comments
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InteractionSection.displayName = "InteractionSection";
