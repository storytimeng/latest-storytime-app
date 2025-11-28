"use client";

import React from "react";
import { Magnetik_Regular } from "@/lib/font";
import data from "@/data/data.json";
import { PageHeader, StoryGroup } from "@/components/reusables/customUI";

interface CategoryViewProps {
  category: string;
}

interface Story {
  id: number;
  title: string;
  author: string;
  rating: number;
  comments: number;
  genre: string;
  image: string;
  sample: string;
  status: string;
}

const CategoryView = ({ category }: CategoryViewProps) => {
  // Map category slugs to data and display names
  const categoryMap: Record<string, { data: Story[]; displayName: string }> = {
    "recently-added": {
      data: data.stories,
      displayName: "Recently Added Stories",
    },
    "old-stories": { data: data.oldStories, displayName: "Old Stories" },
    anonymous: { data: data.anonymousStories, displayName: "Anonymous" },
    "hot-stories": { data: data.hotStories, displayName: "As E Dey Hot" },
  };

  const categoryData = categoryMap[category] || {
    data: [],
    displayName: "Stories",
  };
  const { data: stories, displayName } = categoryData;

  return (
    <div className="min-h-screen px-4 pt-4">
      {/* Header */}
      <PageHeader title={displayName} backLink="/home" />

      {/* Story Grid */}
      <StoryGroup
        stories={stories}
        layout="grid"
        containerClassName="grid-cols-2 gap-4"
        cardClassName="w-full"
        className="pb-8"
      />

      {stories.length === 0 && (
        <div className="text-center py-12">
          <p className={`text-grey-3 ${Magnetik_Regular.className}`}>
            No stories found in this category.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryView;
