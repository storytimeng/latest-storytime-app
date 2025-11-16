import { X, Dot, Search } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Magnetik_Regular, Magnetik_Bold } from "@/lib";
import { cn } from "@/lib";

interface SearchResultProps {
  title: string;
  genre: string;
  author: string;
  image: string;
  hasWarning?: boolean;
  onClick?: () => void;
}

const SearchResult = ({
  title,
  genre,
  author,
  image,
  hasWarning = false,
  onClick,
}: SearchResultProps) => {
  return (
    <div>
      <div
        className="flex items-center p-2 hover:bg-light-grey-2 rounded-lg transition-all duration-300 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center gap-4 flex-1">
          <Search className="w-6 h-6 text-primary-shade-2" />
          <Image
            src={image}
            alt={title}
            width={100}
            height={100}
            className="rounded-lg w-[40px] h-[60px] object-cover"
          />
          <div className="flex flex-col">
            <p
              className={cn(
                "text-primary-colour text-[14px]",
                Magnetik_Bold.className
              )}
            >
              {title}
            </p>
            <div className="flex items-center">
              {hasWarning && (
                <>
                  <p
                    className={cn(
                      "text-primary-colour text-[10px]",
                      Magnetik_Regular.className
                    )}
                  >
                    Warning
                  </p>
                  <Dot className="w-4 h-4 text-secondary" />
                </>
              )}
              <p
                className={cn(
                  "text-[10px] text-primary-colour",
                  Magnetik_Regular.className
                )}
              >
                {genre}
              </p>
              <Dot className="w-4 h-4 text-secondary" />
              <p
                className={cn(
                  "text-[10px] text-primary-colour",
                  Magnetik_Regular.className
                )}
              >
                By {author}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <X className="w-4 h-4 text-secondary" />
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
