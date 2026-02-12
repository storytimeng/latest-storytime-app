"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Search, Filter, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { useSearchParams } from "next/navigation";
import { useReadingHistory } from "@/src/hooks/useReadingHistory";
import { PageHeader } from "@/components/reusables";

interface LibraryItem {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  genre: string;
  status: "Reading" | "Completed" | "Want to Read";
  progress?: number; // Reading progress in percentage
}

const LibraryView = () => {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") as "All" | "Reading" | "Completed" | "Want to Read" | "History" | null;
  
  const [activeTab, setActiveTab] = useState<
    "All" | "Reading" | "Completed" | "Want to Read" | "History"
  >(initialTab || "All");
  const [searchQuery, setSearchQuery] = useState("");

  const { history, isLoading: isLoadingHistory } = useReadingHistory();

  // Map history to LibraryItems
  const libraryItems: LibraryItem[] = history.map((item: any) => {
    const story = item.story;
    const progress = 0; // Reading history doesn't include progress
    const status = story.storyStatus === "complete" ? "Completed" : "Reading";
    
    return {
      id: story.id,
      title: story.title,
      author: story.author?.penName || "Anonymous",
      coverImage: story.imageUrl || "/images/nature.jpg",
      genre: "Fiction", // Reading history doesn't include genres
      status: status,
      progress: progress,
    };
  });

  const filteredItems = libraryItems.filter((item) => {
    const matchesTab = activeTab === "All" || activeTab === "History" || item.status === activeTab;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs = ["All", "Reading", "Completed", "Want to Read", "History"] as const;

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto">
      {/* Header with PageHeader and Pen button */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <PageHeader 
            title="📚 Library" 
            showBackButton 
            backLink="/home"
            titleClassName={`text-xl text-primary-colour ${Magnetik_Bold.className}`}
            className="mb-0"
          />
          <Link href="/pen">
            <Button
              className={`bg-primary-shade-6 text-universal-white px-6 py-2 rounded-full ${Magnetik_Medium.className}`}
              size="sm"
            >
              ✏️ Pen
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-primary-shade-3" />
          <input
            type="text"
            placeholder="Search stories, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 bg-universal-white rounded-lg border border-light-grey-2 text-primary-colour placeholder:text-primary-shade-3 ${Magnetik_Regular.className}`}
          />
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            className="absolute -translate-y-1/2 right-2 top-1/2"
          >
            <Filter className="w-4 h-4 text-primary-shade-3" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-6">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-colors ${
                activeTab === tab
                  ? `bg-complimentary-colour text-universal-white ${Magnetik_Medium.className}`
                  : `bg-universal-white text-primary-shade-3 border border-light-grey-2 ${Magnetik_Regular.className}`
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-complimentary-colour/10">
            <BookOpen className="w-10 h-10 text-complimentary-colour" />
          </div>
          <h3
            className={`text-lg text-primary-colour text-center mb-2 ${Magnetik_Medium.className}`}
          >
            No stories found
          </h3>
          <p
            className={`text-primary-shade-4 text-center mb-6 ${Magnetik_Regular.className}`}
          >
            {searchQuery
              ? "Try adjusting your search terms or browse all stories."
              : activeTab === "History" 
                ? "You haven't read any stories yet."
                : "Start building your library by adding stories you love!"}
          </p>
          <Link href="/home">
            <Button
              className={`bg-complimentary-colour text-universal-white px-6 py-2 ${Magnetik_Medium.className}`}
            >
              Browse Stories
            </Button>
          </Link>
        </div>
      )}

      {/* Library Items */}
      <div className="px-4 pb-24">
        {isLoadingHistory ? (
           <div className="flex justify-center py-10">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-colour"></div>
           </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Link href={`/story/${item.id}`} key={item.id}>
                <div className="flex gap-3 p-3 transition-shadow border rounded-lg bg-universal-white border-light-grey-3 hover:shadow-sm">
                  {/* Cover Image */}
                  <div className="relative flex-shrink-0 w-16 h-20 overflow-hidden rounded-lg bg-light-grey-2">
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-primary-colour text-sm font-medium truncate ${Magnetik_Medium.className}`}
                        >
                          {item.title}
                        </h3>
                        <p
                          className={`text-primary-shade-4 text-xs truncate ${Magnetik_Regular.className}`}
                        >
                          by {item.author}
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 text-xs px-2 py-1 rounded-full bg-complimentary-colour/10 text-complimentary-colour ml-2 ${Magnetik_Regular.className}`}
                      >
                        {item.genre}
                      </span>
                    </div>

                    {/* Status and Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            item.status === "Reading"
                              ? "bg-success-colour/10 text-success-colour"
                              : item.status === "Completed"
                                ? "bg-complimentary-colour/10 text-complimentary-colour"
                                : "bg-primary-shade-2/10 text-primary-shade-4"
                          } ${Magnetik_Regular.className}`}
                        >
                          {item.status}
                        </span>
                        {item.progress !== undefined && (
                          <span
                            className={`text-xs text-primary-shade-4 ${Magnetik_Regular.className}`}
                          >
                            {item.progress}%
                          </span>
                        )}
                      </div>

                      {item.progress !== undefined && (
                        <div className="w-full h-1 rounded-full bg-light-grey-2">
                          <div
                            className="h-1 transition-all duration-300 rounded-full bg-complimentary-colour"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryView;
