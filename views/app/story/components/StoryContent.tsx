import React from "react";
import { Avatar } from "@heroui/avatar";
import { Magnetik_Regular, Magnetik_Medium } from "@/lib/font";
import DOMPurify from "dompurify";

interface StoryContentProps {
  content: string;
  authorName: string;
  authorAvatar?: string;
  hasNavigation: boolean;
  description?: string;
}

export const StoryContent = React.memo(
  ({
    content,
    authorName,
    authorAvatar,
    hasNavigation,
    description,
  }: StoryContentProps) => {
    // Sanitize content
    const sanitizedContent = React.useMemo(() => {
      // Configure DOMPurify to allow standard rich text tags
      return DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'span', 'div', 'img'],
        ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'className', 'style', 'class'],
      });
    }, [content]);

    return (
      <div className={`px-4 py-6 pb-9 ${hasNavigation ? "pt-44" : "pt-32"}`}>
        <div className="mb-6 space-y-4">
          <div
            className={`text-primary-shade-5 text-sm leading-relaxed whitespace-pre-wrap ${Magnetik_Regular.className} story-rich-text`}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {/* Divider */}
          <div className="w-full h-px my-6 bg-light-grey-2" />

          {/* Author Section */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar
              src={authorAvatar || "/images/placeholder-image.svg"}
              name={authorName}
              size="sm"
              className="w-6 h-6"
            />
            <span
              className={`text-primary-colour text-xs ${Magnetik_Medium.className}`}
            >
              By {authorName}
            </span>
          </div>

          {/* Description */}
          {description && (
            <div
              className={`text-primary-shade-4 text-sm leading-relaxed ${Magnetik_Regular.className}`}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    );
  }
);

StoryContent.displayName = "StoryContent";
