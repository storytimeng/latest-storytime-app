import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Magnetik_Regular, Magnetik_Medium } from "@/lib/font";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    penName?: string;
    name?: string;
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
    const [displayCount, setDisplayCount] = useState(2); // Show 2 comments initially

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

    const handleLoadMore = () => {
      setDisplayCount((prev) => prev + 5); // Load 5 more comments
    };

    // Ensure comments is always an array
    const safeComments = Array.isArray(comments) ? comments : [];
    const displayedComments = safeComments.slice(0, displayCount);
    const hasMore = safeComments.length > displayCount;

    return (
      <div className="mt-4 space-y-3">
        {displayedComments.map((comment) => {
          // Get display name: penName → firstName + lastName → firstName or lastName → name → "User"
          const displayName =
            comment.user?.penName ||
            (comment.user?.firstName && comment.user?.lastName
              ? `${comment.user.firstName} ${comment.user.lastName}`.trim()
              : comment.user?.firstName || comment.user?.lastName) ||
            comment.user?.name ||
            "User";

          return (
            <div
              key={comment.id}
              className="pt-3 border-t border-light-grey-2 first:border-t-0 first:pt-0"
            >
              <div className="flex items-center gap-2 mb-2">
                <Avatar
                  src={comment.user?.avatar || "/images/placeholder-image.svg"}
                  name={displayName}
                  size="sm"
                  className="w-6 h-6"
                />
                <span
                  className={`text-primary-colour text-xs ${Magnetik_Medium.className}`}
                >
                  {displayName}
                </span>
              </div>
              <p
                className={`text-primary-shade-4 text-xs leading-relaxed ${Magnetik_Regular.className}`}
              >
                {comment.content}
              </p>
            </div>
          );
        })}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center pt-2">
            <button
              onClick={handleLoadMore}
              className="text-xs text-primary-colour hover:text-complimentary-colour transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    );
  }
);

CommentsSection.displayName = "CommentsSection";
