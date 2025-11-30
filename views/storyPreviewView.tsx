"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";

interface Story {
  id: string;
  title: string;
  status: "Ongoing" | "Completed";
  genre: string;
  author: string;
  coverImage: string;
  description: string;
  tags: string[];
  isAnonymous: boolean;
  onlyOnStorytime: boolean;
  hasTrigger: boolean;
}

const StoryPreviewView = () => {
  // Mock data - this would typically come from props or API
  const story: Story = {
    id: "1",
    title: "The Lost Ship",
    status: "Ongoing",
    genre: "Thriller",
    author: "Anonymous",
    coverImage: "/images/nature.jpg",
    description: `The sons of the morning ascended to the heavenly court, having been summoned by Elohim Himself.

The archangels rode their horses—Lucifer on his silver stallion, Michael on his chestnut stallion, and Gabriel on his golden stallion. Behind them, their winged hosts followed.

A disgruntled look was etched on Lucifer's face. Only curiosity and wonder filled Gabriel's and Michael's.

They knew this was the general assembly where Elohim would finally share his upcoming plans for the cosmos.)`,
    tags: ["Only on Storytime", "Trigger Warning"],
    isAnonymous: true,
    onlyOnStorytime: true,
    hasTrigger: true,
  };

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto relative">
      {/* Header with Background Image */}
      <div className="relative overflow-hidden h-80">
        <Image
          src={story.coverImage}
          alt={story.title}
          fill
          className="object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />

        {/* Header Controls */}
        <div className="absolute z-10 flex items-center justify-between top-5 left-4 right-4">
          <Link href="/my-stories">
            <ArrowLeft className="w-6 h-6 text-universal-white" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="bg-accent-shade-1 -mt-6 relative z-10 rounded-t-2xl min-h-[calc(100vh-20rem)]">
        <div className="px-4 pt-6 pb-24">
          {/* Story Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h1
                  className={`text-2xl text-primary-colour mb-1 ${Magnetik_Bold.className}`}
                >
                  {story.title}
                </h1>
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    story.status === "Ongoing"
                      ? "text-complimentary-colour bg-complimentary-colour/10"
                      : "text-success-colour bg-success-colour/10"
                  } ${Magnetik_Medium.className}`}
                >
                  ({story.status})
                </span>
              </div>
            </div>

            {/* Genre Badge */}
            <div className="mb-3">
              <span
                className={`inline-block text-xs px-3 py-1 rounded-full bg-complimentary-colour text-universal-white ${Magnetik_Medium.className}`}
              >
                {story.genre}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {story.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded-full bg-primary-shade-2/10 text-primary-shade-4 ${Magnetik_Regular.className}`}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px my-4 bg-light-grey-2" />

            {/* Description */}
            <div className="space-y-4">
              <p
                className={`text-primary-shade-5 text-sm leading-relaxed ${Magnetik_Regular.className}`}
              >
                {story.description}
              </p>
            </div>

            {/* Author */}
            <div className="mt-6 text-center">
              <p
                className={`text-primary-colour text-lg ${Magnetik_Bold.className}`}
              >
                {story.author}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="absolute bottom-6 left-4 right-4">
          <Link href={`/edit-story/${story.id}`}>
            <Button
              className={`w-full bg-primary-shade-6 text-universal-white py-3 ${Magnetik_Medium.className}`}
            >
              Edit
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StoryPreviewView;
