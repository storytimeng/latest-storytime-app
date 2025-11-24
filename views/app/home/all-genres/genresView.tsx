"use client";

import React from "react";
import data from "@/data/data.json";
import { PageHeader, StoryGroup } from "@/components/reusables/customUI";

interface GenresViewProps {
  genre: string;
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

const GenresView = ({ genre }: GenresViewProps) => {
  // Decode and capitalize genre for display
  const decodedGenre = decodeURIComponent(genre);
  const displayGenre =
    decodedGenre.charAt(0).toUpperCase() + decodedGenre.slice(1);

  // Combine all stories with the selected genre from all story categories
  const allGenreStories: Story[] = [
    ...data.stories.filter(
      (story) => story.genre.toLowerCase() === decodedGenre.toLowerCase()
    ),
    ...data.oldStories.filter(
      (story) => story.genre.toLowerCase() === decodedGenre.toLowerCase()
    ),
    ...data.anonymousStories.filter(
      (story) => story.genre.toLowerCase() === decodedGenre.toLowerCase()
    ),
    ...data.hotStories.filter(
      (story) => story.genre.toLowerCase() === decodedGenre.toLowerCase()
    ),
  ];

  // If no stories found, show sample adventure stories for demonstration
  const storiesToShow =
    allGenreStories.length > 0
      ? allGenreStories
      : [
          {
            id: 1,
            title: "The Journalist",
            author: "Jane Moore",
            rating: 20,
            comments: 5,
            genre: displayGenre,
            image: "/images/nature.jpg",
            sample: "An exciting adventure story...",
            status: "Ongoing",
          },
          {
            id: 2,
            title: "The Journalist",
            author: "Jane Moore",
            rating: 20,
            comments: 5,
            genre: displayGenre,
            image: "/images/nature.jpg",
            sample: "Another thrilling adventure...",
            status: "Ongoing",
          },
          {
            id: 3,
            title: "The Journalist",
            author: "Jane Moore",
            rating: 20,
            comments: 5,
            genre: displayGenre,
            image: "/images/nature.jpg",
            sample: "More adventure awaits...",
            status: "Ongoing",
          },
          {
            id: 4,
            title: "The Journalist",
            author: "Jane Moore",
            rating: 20,
            comments: 5,
            genre: displayGenre,
            image: "/images/nature.jpg",
            sample: "Epic adventure continues...",
            status: "Ongoing",
          },
          {
            id: 5,
            title: "The Journalist",
            author: "Jane Moore",
            rating: 20,
            comments: 5,
            genre: displayGenre,
            image: "/images/nature.jpg",
            sample: "The ultimate adventure...",
            status: "Ongoing",
          },
          {
            id: 6,
            title: "The Journalist",
            author: "Jane Moore",
            rating: 20,
            comments: 5,
            genre: displayGenre,
            image: "/images/nature.jpg",
            sample: "Final adventure tale...",
            status: "Ongoing",
          },
        ];

  return (
    <div className="bg-accent-shade-1 min-h-screen px-4 pt-4">
      {/* Header */}
      <PageHeader title={displayGenre} backLink="/all-genres" />

      {/* Story Grid */}
      <StoryGroup
        stories={storiesToShow}
        layout="grid"
        containerClassName="grid-cols-2 gap-4 mt-10"
        cardClassName="w-full"
        className="pb-8"
      />
    </div>
  );
};

export default GenresView;
