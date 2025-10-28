"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { MyStoriesCard } from "@/components/reusables/customUI";

interface Story {
  id: string;
  title: string;
  status: "Ongoing" | "Completed" | "Draft";
  genre: string;
  writingDate: string;
  coverImage: string;
}

const MyStoriesView = () => {
  const [activeTab, setActiveTab] = useState<
    "Recent" | "Ongoing" | "Published" | "Drafts"
  >("Recent");

  // Mock data - replace with actual data
  const stories: Story[] = [
    {
      id: "1",
      title: "The Lost Ship",
      status: "Ongoing",
      genre: "Adventure",
      writingDate: "12-02-2024",
      coverImage: "/images/nature.jpg",
    },
    {
      id: "2",
      title: "The Lost Ship",
      status: "Completed",
      genre: "Thriller",
      writingDate: "12-02-2024",
      coverImage: "/images/nature.jpg",
    },
    {
      id: "3",
      title: "The Lost Ship",
      status: "Ongoing",
      genre: "Adventure",
      writingDate: "12-02-2024",
      coverImage: "/images/nature.jpg",
    },
    {
      id: "4",
      title: "The Lost Ship",
      status: "Completed",
      genre: "Thriller",
      writingDate: "12-02-2024",
      coverImage: "/images/nature.jpg",
    },
  ];

  const filteredStories = stories.filter((story) => {
    switch (activeTab) {
      case "Recent":
        return true; // Show all stories
      case "Ongoing":
        return story.status === "Ongoing";
      case "Published":
        return story.status === "Completed";
      case "Drafts":
        return story.status === "Draft";
      default:
        return true;
    }
  });

  const handleEdit = (storyId: string) => {
    // Navigate to edit story page
    window.location.href = `/edit-story/${storyId}`;
  };

  const handleDelete = (storyId: string) => {
    // TODO: Show confirmation dialog and delete story
    // Implement actual delete functionality
  };

  const tabs = ["Recent", "Ongoing", "Published", "Drafts"] as const;

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/app">
            <ArrowLeft className="w-6 h-6 text-primary-colour" />
          </Link>
          <h1
            className={`text-xl text-primary-colour ${Magnetik_Bold.className}`}
          >
            My Stories
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-6">
        <div className="flex gap-6 border-b border-light-grey-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm relative ${
                activeTab === tab
                  ? `text-complimentary-colour ${Magnetik_Medium.className}`
                  : `text-primary-shade-3 ${Magnetik_Regular.className}`
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-complimentary-colour" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="px-4 pb-24">
        <div className="grid grid-cols-2 gap-4">
          {filteredStories.map((story) => (
            <MyStoriesCard
              key={story.id}
              story={story}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyStoriesView;
