import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Magnetik_Regular, Magnetik_Medium } from "@/lib/font";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface CommentsSectionProps {
  comments: Comment[];
  onSubmitComment: (text: string) => Promise<void>;
}

export const CommentsSection = React.memo(
  ({ comments, onSubmitComment }: CommentsSectionProps) => {
    const [commentText, setCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
      if (!commentText.trim()) return;

      setIsSubmitting(true);
      try {
        await onSubmitComment(commentText);
        setCommentText("");
      } catch (error) {
        console.error("Failed to submit comment", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <>
        <div className="h-px -mx-2 bg-primary-shade-1" />
        <div className="flex flex-col justify-center px-2 space-y-3">
          {/* Comment Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 text-xs bg-transparent border-b border-light-grey-2 focus:outline-none focus:border-complimentary-colour"
            />
            <Button
              size="sm"
              variant="flat"
              isLoading={isSubmitting}
              onClick={handleSubmit}
              className="bg-complimentary-colour text-white text-xs h-8"
            >
              Post
            </Button>
          </div>

          {comments.map((comment) => (
            <div
              key={comment.id}
              className="pt-3 border-t border-light-grey-2 first:border-t-0 first:pt-0"
            >
              <div className="flex items-center gap-2 mb-2">
                <Avatar
                  src={comment.user?.avatar || "/images/placeholder-image.svg"}
                  name={comment.user?.name || "User"}
                  size="sm"
                  className="w-4 h-4"
                />
                <span
                  className={`text-primary-colour text-xs ${Magnetik_Medium.className}`}
                >
                  {comment.user?.name || "User"}
                </span>
                <span className="text-[10px] text-primary-shade-3">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p
                className={`text-primary-shade-4 text-xs leading-relaxed ${Magnetik_Regular.className}`}
              >
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      </>
    );
  }
);

CommentsSection.displayName = "CommentsSection";
