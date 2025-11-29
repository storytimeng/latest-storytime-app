"use client";

import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { StoryCard } from "@/components/reusables";

import { StoryResponseDto } from "@/src/client/types.gen";

const NewLibraryView = () => {
  const [activeTab, setActiveTab] = useState<"library" | "downloads">(
    "library"
  );

  // Mock data - replace with actual data (same format as existing StoryCard expects)
  const libraryStories: StoryResponseDto[] = [
    {
      id: "1",
      title: "The Journalist",
      author: { id: "a1", name: "Jane Moore", email: "jane@example.com", createdAt: "" },
      content: "",
      genres: ["Thriller"],
      imageUrl: "/images/nature.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // @ts-ignore - extra props used by StoryCard
      rating: 20,
      comments: 5,
      storyStatus: "ongoing",
    },
    {
      id: "2",
      title: "The Journalist",
      author: { id: "a1", name: "Jane Moore", email: "jane@example.com", createdAt: "" },
      content: "",
      genres: ["Thriller"],
      imageUrl: "/images/nature.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // @ts-ignore
      rating: 20,
      comments: 5,
      storyStatus: "ongoing",
    },
    {
      id: "3",
      title: "The Journalist",
      author: { id: "a1", name: "Jane Moore", email: "jane@example.com", createdAt: "" },
      content: "",
      genres: ["Adventure"],
      imageUrl: "/images/nature.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // @ts-ignore
      rating: 20,
      comments: 5,
      storyStatus: "ongoing",
    },
    {
      id: "4",
      title: "The Journalist",
      author: { id: "a1", name: "Jane Moore", email: "jane@example.com", createdAt: "" },
      content: "",
      genres: ["Thriller"],
      imageUrl: "/images/nature.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // @ts-ignore
      rating: 20,
      comments: 5,
      storyStatus: "ongoing",
    },
    {
      id: "5",
      title: "The Journalist",
      author: { id: "a1", name: "Jane Moore", email: "jane@example.com", createdAt: "" },
      content: "",
      genres: ["Thriller"],
      imageUrl: "/images/nature.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // @ts-ignore
      rating: 20,
      comments: 5,
      storyStatus: "ongoing",
    },
    {
      id: "6",
      title: "The Journalist",
      author: { id: "a1", name: "Jane Moore", email: "jane@example.com", createdAt: "" },
      content: "",
      genres: ["Thriller"],
      imageUrl: "/images/nature.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // @ts-ignore
      rating: 20,
      comments: 5,
      storyStatus: "ongoing",
    },
  ];

  // For downloads, we'll show empty initially but structure is ready
  const downloadedStories: StoryResponseDto[] = [];

  const currentStories =
    activeTab === "library" ? libraryStories : downloadedStories;

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto pb-20">
      {/* Tabs */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("library")}
            className={`pb-3 text-sm relative ${
              activeTab === "library"
                ? `text-complimentary-colour ${Magnetik_Bold.className}`
                : `text-primary-shade-3 ${Magnetik_Regular.className}`
            }`}
          >
            My Library
            {activeTab === "library" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-complimentary-colour rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("downloads")}
            className={`pb-3 text-sm relative ${
              activeTab === "downloads"
                ? `text-complimentary-colour ${Magnetik_Bold.className}`
                : `text-primary-shade-3 ${Magnetik_Regular.className}`
            }`}
          >
            My Downloads
            {activeTab === "downloads" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-complimentary-colour rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-4">
          {currentStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>

      {/* Empty State for Downloads */}
      {activeTab === "downloads" && downloadedStories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 bg-complimentary-colour/10 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-10 h-10 text-complimentary-colour" />
          </div>
          <h3
            className={`text-sm text-primary-colour text-center mb-2 ${Magnetik_Medium.className}`}
          >
            No downloaded stories
          </h3>
          <p
            className={`text-xs text-primary-shade-4 text-center mb-6 ${Magnetik_Regular.className}`}
          >
            Download stories to read them offline anytime!
          </p>
        </div>
      )}
    </div>
  );
};

export default NewLibraryView;
