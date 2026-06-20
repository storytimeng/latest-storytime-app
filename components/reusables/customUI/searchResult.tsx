import { Dot, Eye, MessageCircle, ThumbsUp } from "lucide-react";
import React from "react";
import { Magnetik_Regular, Magnetik_Bold } from "@/lib";
import { cn } from "@/lib";
import { StoryCoverImage } from "./StoryCoverImage";
import { StoryStatusIcon } from "./StoryStatusIcon";

interface SearchResultProps {
  title: string;
  genre: string;
  author: string;
  image: string;
  storyStatus?: string;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
}

function formatStatCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return String(count);
}

const SearchResult = ({
  title,
  genre,
  author,
  image,
  storyStatus,
  likeCount = 0,
  commentCount = 0,
  viewCount = 0,
}: SearchResultProps) => {
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-light-grey-2 rounded-lg transition-colors duration-200">
      <StoryCoverImage
        src={image}
        alt={title}
        width={100}
        height={100}
        className="rounded-lg w-[40px] h-[60px] object-cover shrink-0"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <p
            className={cn(
              "text-primary-colour text-[14px] truncate",
              Magnetik_Bold.className,
            )}
          >
            {title}
          </p>
          {storyStatus ? (
            <StoryStatusIcon status={storyStatus} className="shrink-0" />
          ) : null}
        </div>

        <div className="flex items-center min-w-0">
          <p
            className={cn(
              "text-[10px] text-primary-colour truncate",
              Magnetik_Regular.className,
            )}
          >
            {genre}
          </p>
          <Dot className="w-4 h-4 text-secondary shrink-0" />
          <p
            className={cn(
              "text-[10px] text-primary-colour truncate",
              Magnetik_Regular.className,
            )}
          >
            By {author}
          </p>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-primary-shade-2">
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-3 h-3 fill-[#F8951D] text-[#F8951D]" />
            <span className={Magnetik_Regular.className}>
              {formatStatCount(likeCount)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span className={Magnetik_Regular.className}>
              {formatStatCount(commentCount)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span className={Magnetik_Regular.className}>
              {formatStatCount(viewCount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
