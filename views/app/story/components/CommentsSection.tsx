"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { MessageCircle, ChevronDown, ChevronRight } from "lucide-react";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    penName: string;
    avatar: string;
  };
  createdAt: string;
  parentCommentId?: string;
  replies?: Comment[];
  isOptimistic?: boolean; // Flag for optimistic updates
}

interface CommentsSectionProps {
  comments: Comment[];
  onSubmitComment: (text: string, parentId?: string) => Promise<void>;
  isThreaded?: boolean;
  currentUser?: {
    id: string;
    penName: string;
    avatar: string;
  };
}

export const CommentsSection = ({
  comments,
  onSubmitComment,
  isThreaded = true,
  currentUser,
}: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [collapsedThreads, setCollapsedThreads] = useState<Set<string>>(
    new Set()
  );
  const [optimisticComments, setOptimisticComments] = useState<Comment[]>([]);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [replyCooldowns, setReplyCooldowns] = useState<Map<string, number>>(
    new Map()
  );

  // Countdown timer effect for main comment
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Countdown timer effect for replies
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    replyCooldowns.forEach((seconds, parentId) => {
      if (seconds > 0) {
        const timer = setInterval(() => {
          setReplyCooldowns((prev) => {
            const next = new Map(prev);
            const current = next.get(parentId) || 0;
            if (current <= 1) {
              next.delete(parentId);
            } else {
              next.set(parentId, current - 1);
            }
            return next;
          });
        }, 1000);
        timers.push(timer);
      }
    });

    return () => timers.forEach((timer) => clearInterval(timer));
  }, [replyCooldowns]);

  // Helper function to extract wait time from error message
  const extractWaitTime = (errorMessage: string): number => {
    const match = errorMessage.match(/(\d+)s/);
    return match ? parseInt(match[1], 10) : 30; // Default to 30s if can't parse
  };

  // Clean up optimistic comments that have been successfully matched with real ones
  useEffect(() => {
    if (comments.length === 0) return;

    // After 2 seconds, remove optimistic comments that have been matched
    const timer = setTimeout(() => {
      setOptimisticComments((prev) =>
        prev.filter((oc) => {
          // Keep if still optimistic (pending)
          if (oc.isOptimistic) return true;

          // Remove if it's been updated with a real ID (no longer starts with 'optimistic')
          return oc.id.startsWith("optimistic");
        })
      );
    }, 2000);

    return () => clearTimeout(timer);
  }, [comments]);

  // Merge optimistic comments with actual comments, matching and updating IDs
  const allComments = useMemo(() => {
    // Create a map of real comments
    const realCommentsMap = new Map(comments.map((c) => [c.id, c]));

    // Find optimistic comments that match real ones (by content and user)
    const updatedOptimistic = optimisticComments.map((oc) => {
      // Find a matching real comment (same content, user, and within 5 seconds)
      const matchingReal = comments.find((rc) => {
        const timeDiff = Math.abs(
          new Date(rc.createdAt).getTime() - new Date(oc.createdAt).getTime()
        );
        return (
          rc.content === oc.content &&
          rc.user.id === oc.user.id &&
          rc.parentCommentId === oc.parentCommentId &&
          timeDiff < 5000 // Within 5 seconds
        );
      });

      // If we found a match, update the optimistic comment with real data but keep it in place
      if (matchingReal) {
        return { ...matchingReal, isOptimistic: false };
      }

      return oc;
    });

    // Get IDs of comments that were matched (to avoid duplicates)
    const matchedRealIds = new Set(
      updatedOptimistic
        .filter((oc) => !oc.id.startsWith("optimistic"))
        .map((oc) => oc.id)
    );

    // Add real comments that weren't matched
    const unmatchedRealComments = comments.filter(
      (rc) => !matchedRealIds.has(rc.id)
    );

    return [...unmatchedRealComments, ...updatedOptimistic];
  }, [comments, optimisticComments]);

  // Organize comments into a tree structure if threaded
  const organizedComments = useMemo(() => {
    if (!isThreaded) return allComments;

    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create map of all comments
    allComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into tree
    allComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          parent.replies!.push(commentWithReplies);
        } else {
          rootComments.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  }, [allComments, isThreaded]);

  const handleSubmit = async () => {
    if (!newComment.trim() || !currentUser) return;

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticComment: Comment = {
      id: optimisticId,
      content: newComment,
      user: currentUser,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // Add optimistic comment to UI immediately
    setOptimisticComments((prev) => [...prev, optimisticComment]);
    const commentText = newComment;
    setNewComment("");
    setIsSubmitting(true);

    try {
      await onSubmitComment(commentText);
      // Set 30-second cooldown after successful submission
      setCooldownSeconds(30);
      // Mark optimistic comment as no longer optimistic (unfade it)
      setOptimisticComments((prev) =>
        prev.map((c) =>
          c.id === optimisticId ? { ...c, isOptimistic: false } : c
        )
      );
    } catch (error: any) {
      console.error("Failed to submit comment:", error);

      // Check if it's a rate limit error
      if (
        error?.message &&
        typeof error.message === "string" &&
        error.message.includes("wait")
      ) {
        const waitTime = extractWaitTime(error.message);
        setCooldownSeconds(waitTime);
      } else if (error?.statusCode === 400 && error?.message) {
        const waitTime = extractWaitTime(error.message);
        setCooldownSeconds(waitTime);
      }

      // Remove optimistic comment immediately on error
      setOptimisticComments((prev) =>
        prev.filter((c) => c.id !== optimisticId)
      );
      // Restore the text so user can try again
      setNewComment(commentText);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyText.trim() || !currentUser) return;

    const optimisticId = `optimistic-reply-${Date.now()}`;
    const optimisticReply: Comment = {
      id: optimisticId,
      content: replyText,
      user: currentUser,
      createdAt: new Date().toISOString(),
      parentCommentId: parentId,
      isOptimistic: true,
    };

    // Add optimistic reply to UI immediately
    setOptimisticComments((prev) => [...prev, optimisticReply]);
    const replyContent = replyText;
    setReplyText("");
    setReplyingTo(null);
    setIsSubmitting(true);

    try {
      await onSubmitComment(replyContent, parentId);
      // Set 30-second cooldown for this specific reply thread
      setReplyCooldowns((prev) => new Map(prev).set(parentId, 30));
      // Mark optimistic reply as no longer optimistic (unfade it)
      setOptimisticComments((prev) =>
        prev.map((c) =>
          c.id === optimisticId ? { ...c, isOptimistic: false } : c
        )
      );
    } catch (error: any) {
      console.error("Failed to submit reply:", error);

      // Check if it's a rate limit error
      if (
        error?.message &&
        typeof error.message === "string" &&
        error.message.includes("wait")
      ) {
        const waitTime = extractWaitTime(error.message);
        setReplyCooldowns((prev) => new Map(prev).set(parentId, waitTime));
      } else if (error?.statusCode === 400 && error?.message) {
        const waitTime = extractWaitTime(error.message);
        setReplyCooldowns((prev) => new Map(prev).set(parentId, waitTime));
      }

      // Remove optimistic reply immediately on error
      setOptimisticComments((prev) =>
        prev.filter((c) => c.id !== optimisticId)
      );
      // Restore reply form with the text
      setReplyText(replyContent);
      setReplyingTo(parentId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCollapse = (commentId: string) => {
    setCollapsedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isCollapsed = collapsedThreads.has(comment.id);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const showReplyForm = replyingTo === comment.id;
    const replyCooldown = replyCooldowns.get(comment.id) || 0;

    return (
      <div key={comment.id} className="relative">
        {/* Vertical line for threading - thicker and more visible like Reddit */}
        {depth > 0 && (
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-divider hover:bg-primary-colour/30 transition-colors" />
        )}

        <div className={`${depth > 0 ? "ml-6 pl-6" : ""} relative group`}>
          {/* Comment content with subtle background on hover */}
          <div
            className={`flex gap-2 mb-2 rounded-lg p-2 -ml-2 hover:bg-default-100 transition-all duration-300 ${
              comment.isOptimistic ? "opacity-50" : "opacity-100"
            }`}
          >
            <Avatar
              src={comment.user.avatar}
              name={comment.user.penName}
              size="sm"
              className="flex-shrink-0 mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-sm font-semibold text-foreground ${Magnetik_Medium.className}`}
                >
                  {comment.user.penName}
                </span>
                <span className="text-xs text-default-400">
                  {new Date(comment.createdAt).toLocaleDateString()}{" "}
                  {new Date(comment.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p
                className={`text-sm text-foreground mb-2 leading-relaxed ${Magnetik_Regular.className}`}
              >
                {comment.content}
              </p>

              {/* Action buttons - Reddit style */}
              <div className="flex items-center gap-4">
                {/* Reply button */}
                {isThreaded && (
                  <button
                    onClick={() =>
                      setReplyingTo(showReplyForm ? null : comment.id)
                    }
                    className="flex items-center gap-1 text-xs font-medium text-default-500 hover:text-primary-500 transition-colors px-2 py-1 rounded hover:bg-default-200"
                  >
                    <MessageCircle size={14} />
                    <span>Reply</span>
                  </button>
                )}

                {/* Collapse/Expand button */}
                {hasReplies && (
                  <button
                    onClick={() => toggleCollapse(comment.id)}
                    className="flex items-center gap-1 text-xs font-medium text-default-500 hover:text-primary-500 transition-colors px-2 py-1 rounded hover:bg-default-200"
                  >
                    {isCollapsed ? (
                      <>
                        <ChevronRight size={14} />
                        <span>
                          {comment.replies!.length}{" "}
                          {comment.replies!.length === 1 ? "reply" : "replies"}
                        </span>
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} />
                        <span>Hide</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Reply form */}
              {showReplyForm && (
                <div className="mt-3 space-y-2 p-3 bg-default-50 rounded-lg border border-divider">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleReply(comment.id);
                      }
                    }}
                    placeholder="Write a reply..."
                    minRows={2}
                    classNames={{
                      input: "text-sm",
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => handleReply(comment.id)}
                      isLoading={isSubmitting}
                      isDisabled={!replyText.trim() || replyCooldown > 0}
                    >
                      {replyCooldown > 0 ? `Wait ${replyCooldown}s` : "Reply"}
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nested replies */}
          {!isCollapsed && hasReplies && (
            <div className="mt-1 pt-1">
              {comment.replies!.map((reply) => renderComment(reply, depth + 1))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* New comment form */}
      <div className="space-y-3">
        <h3
          className={`text-lg font-medium text-primary-colour ${Magnetik_Medium.className}`}
        >
          Comments ({allComments.length})
        </h3>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Share your thoughts..."
          minRows={3}
          classNames={{
            input: "text-sm",
          }}
        />
        <Button
          color="primary"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={!newComment.trim() || cooldownSeconds > 0}
          startContent={<MessageCircle size={18} />}
        >
          {cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s` : "Post Comment"}
        </Button>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {organizedComments.length === 0 ? (
          <p className="text-center text-primary-shade-3 py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          organizedComments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
};
