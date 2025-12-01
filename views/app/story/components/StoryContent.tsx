import React from "react";
import { Avatar } from "@heroui/avatar";
import { Magnetik_Regular, Magnetik_Medium } from "@/lib/font";

interface StoryContentProps {
  content: string;
  authorName: string;
  authorAvatar?: string;
  hasNavigation: boolean;
}

export const StoryContent = React.memo(
  ({ content, authorName, authorAvatar, hasNavigation }: StoryContentProps) => {
    return (
      <div className={`px-4 py-6 pb-24 ${hasNavigation ? "pt-44" : "pt-32"}`}>
        <div className="mb-6 space-y-4">
          <div
            className={`text-primary-shade-5 text-sm leading-relaxed whitespace-pre-wrap ${Magnetik_Regular.className}`}
          >
            {content}
          </div>

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
        </div>
      </div>
    );
  }
);

StoryContent.displayName = "StoryContent";
