"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/reusables/customUI";

const AllGenres = () => {
  const router = useRouter();

  // Standard genre list to match the design
  const allGenres = [
    "Anonymous",
    "As E Dey Hot",
    "Romance",
    "Science Fiction",
    "Thriller",
    "Drama",
    "Poetry",
    "Biography",
    "Adventure",
    "Horror",
    "Folklore",
    "Memoir",
    "Literary Fiction",
    "Legend",
    "Historical Fiction",
    "Short Stories",
  ];

  const handleGenreClick = (genre: string) => {
    // Navigate to the genre-specific page
    router.push(`/all-genres/${encodeURIComponent(genre.toLowerCase())}`);
  };

  return (
    <div className="bg-accent-shade-1 min-h-screen px-4 pt-4">
      {/* Header */}
      <PageHeader title="Genre Pick" backLink="/" />

      {/* Genre Grid */}
      <div className="grid grid-cols-3 gap-3 pb-8 mt-10">
        {allGenres.map((genre) => (
          <Button
            key={genre}
            onClick={() => handleGenreClick(genre)}
            className="relative py-[14px] text-white leading-none h-fit font-medium rounded-lg border-none shadow-sm"
            style={{
              backgroundImage: `repeating-linear-gradient(-45deg, #f89a28, #f89a28 18px, #ec8e1c 18px, #ec8e1c 36px)`,
              minHeight: "20px",
            }}
          >
            <span className="relative z-10 text-sm leading-none h-fit">
              {genre}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AllGenres;
