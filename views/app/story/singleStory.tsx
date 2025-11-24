import Link from "next/link";
import React from "react";
import { ArrowLeft, Dot, Eye, MessageSquare, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { Magnetik_Regular, Magnetik_Bold } from "@/lib";
import { cn } from "@/lib";

interface SingleStoryProps {
  storyId?: string;
}

const SingleStory = ({ storyId }: SingleStoryProps) => {
  return (
    <div className="bg-accent-shade-1 min-h-screen">
      <div className="relative">
        {/* Story Image */}
        <Image
          src="/images/nature.jpg"
          alt="story"
          width={100}
          height={100}
          className="w-[100%] h-[400px] object-cover"
        />

        {/* Header Overlay on Top of Image */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-black/20 pt-10 pb-4 px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <ArrowLeft size={20} className="text-white" />
            </Link>
          </div>
        </div>
      </div>

      {/* Content below image */}
      <div className="px-4 py-6 space-y-2">
        <div className="pb-4 border-b border-primary-shade-1">
          <div className="flex items-center gap-2">
            <h2
              className={cn(
                "text-primary-colour text-[20px]",
                Magnetik_Bold.className
              )}
            >
              The Nature of the World
            </h2>
            <p
              className={cn(
                "text-complimentary-colour text-[10px]",
                Magnetik_Regular.className
              )}
            >
              (Ongoing)
            </p>
          </div>
          <h2
            className={cn(
              "text-white text-[8px] bg-complimentary-colour px-2 py-1 rounded-lg w-fit",
              Magnetik_Regular.className
            )}
          >
            Adventure
          </h2>
          <div className="flex items-center">
            <p
              className={cn(
                "text-primary-colour text-[10px]",
                Magnetik_Regular.className
              )}
            >
              Only on Storytime
            </p>
            <Dot size={20} className="text-primary-colour" />
            <p
              className={cn(
                "text-primary-colour text-[10px]",
                Magnetik_Regular.className
              )}
            >
              Trigger Warning
            </p>
          </div>
          <div className="flex items-center ">
            <div className="flex items-center gap-2">
              <Eye
                size={20}
                className="text-complimentary-colour fill-current"
              />
              <p
                className={cn(
                  "text-primary-colour text-[10px]",
                  Magnetik_Regular.className
                )}
              >
                26 views
              </p>
            </div>
            <Dot className="text-primary-colour w-6 h-6" />
            <div className="flex items-center gap-2">
              <MessageSquare
                size={20}
                className="text-complimentary-colour fill-current"
              />
              <p
                className={cn(
                  "text-primary-colour text-[10px]",
                  Magnetik_Regular.className
                )}
              >
                26 comments
              </p>
            </div>
            <Dot className="text-primary-colour w-6 h-6" />
            <div className="flex items-center gap-2">
              <ThumbsUp
                size={20}
                className="text-complimentary-colour fill-current"
              />
              <p
                className={cn(
                  "text-primary-colour text-[10px]",
                  Magnetik_Regular.className
                )}
              >
                26 likes
              </p>
            </div>
          </div>
        </div>
        <div className="pb-20">
          <p className={cn("text-primary-shade-2 text-[14px] text-center")}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <div className="flex items-center justify-center gap-2 bg-accent-shade-2 rounded-full mt-4 py-2">
            <p
              className={cn(
                "text-primary-colour text-[14px] text-center",
                Magnetik_Regular.className
              )}
            >
              By John Doe
            </p>
          </div>

          <Link 
            href={`/story/${storyId || '1'}/read`} 
            className="flex items-center justify-center gap-2 bg-primary-colour rounded-full mt-8 py-4 cursor-pointer"
          >
            <p
              className={cn(
                "text-white text-[14px] text-center",
                Magnetik_Regular.className
              )}
            >
              Read More
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SingleStory;
