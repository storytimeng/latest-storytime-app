"use client";

import { SelectField } from "@/components/reusables/form";
import { Magnetik_Bold } from "@/lib/font";
import { ArrowLeft, MessageSquare, ThumbsUp } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

interface FullStoryProps {
  storyId?: string;
}

const FullStory = ({ storyId }: FullStoryProps) => {
  const [selectedChapter, setSelectedChapter] = useState("1"); // Initialize with "1" for Chapter 1

  const chapters = {
    "1": "Chapter 1",
    "2": "Chapter 2",
    "3": "Chapter 3",
    "4": "Chapter 4",
    "5": "Chapter 5",
  };

  return (
    <div>
      <div className="bg-accent-shade-1 min-h-screen pb-20 pt-4">
        <div className="flex items-center space-x-28 px-4 pb-6">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <ArrowLeft size={20} className="text-secondary" />
          </Link>
        </div>

        <div className="">
          <div className="flex items-center justify-between bg-complimentary-shade-2 py-2 px-4 ">
            <h3
              className={`text-[18px] font-bold text-primary-colour ${Magnetik_Bold.className}`}
            >
              The Lost Ship
            </h3>
            <span className="text-secondary/80">•••</span>
          </div>
        </div>
        <div className="px-4">
          <SelectField
            htmlFor="chapter"
            id="chapter"
            isInvalid={false}
            required={false}
            options={Object.entries(chapters).map(([key, value]) => ({
              label: value,
              value: key,
            }))}
            onChange={(value) => {
              if (typeof value === "string") {
                setSelectedChapter(value);
              }
            }}
            placeholder="Chapter 1"
            errorMessage=""
          />
        </div>
        <div className="px-4 border-b border-gray-300 pb-4 pt-4">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum
            dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim
            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in
            voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum.
          </p>
        </div>
        <div className="px-4 pt-4 space-y-2">
          <p className="text-[14px] font-bold text-primary-colour">
            By John Doe
          </p>
          <p className="text-[14px] text-primary-colour">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
        <div className="px-4 pt-4">
          <div className="px-4 pt-4 bg-complimentary-shade-2 rounded-lg">
            <div className="flex items-center justify-between pb-2 border-b border-gray-300">
              <div className="flex items-center gap-2">
                <ThumbsUp
                  size={20}
                  className="text-grey-2"
                  fill="currentColor"
                />
                <p>Like</p>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp
                  size={20}
                  className="text-complimentary-colour"
                  fill="currentColor"
                />
                <p>26 Likes</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-300">
              <div className="flex items-center gap-2">
                <MessageSquare
                  size={20}
                  className="text-grey-2"
                  fill="currentColor"
                />
                <p>Comment</p>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare
                  size={20}
                  className="text-complimentary-colour"
                  fill="currentColor"
                />
                <p>26 Comments</p>
              </div>
            </div>
            <div className="py-2 border-b border-gray-300">
              <div>
                <p>Jane Doe</p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            </div>
            <div className="py-2 border-b border-gray-300">
              <div>
                <p>Jane Doe</p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            </div>
            <div className="py-2 text-center text-complimentary-colour">
              <p>Load More</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullStory;
