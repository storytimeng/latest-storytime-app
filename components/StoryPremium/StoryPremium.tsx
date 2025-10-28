"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Avatar,
  Select,
  SelectItem,
  Slider,
  SharedSelection,
} from "@heroui/react";
import {
  ThumbsUp,
  MessageCircle,
  MoreVertical,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import Link from "next/link";

interface StoryPremiumProps {
  title?: string;
  authorName?: string;
  content?: string;
  authorNote?: string;
}

export const StoryPremium = ({
  title = "The Lost Ship",
  authorName = "Jane Moore",
  content = `The sons of the morning ascended to the heavenly court, having been summoned by Elohim Himself.

The archangels rode their horses—Lucifer on his silver stallion, Michael on his chestnut stallion, and Gabriel on his golden stallion. Behind them, their winged hosts followed.

A disgruntled look was etched on Lucifer's face. Only curiosity and wonder filled Gabriel's and Michael's.

They knew this was the general assembly where Elohim would finally share his upcoming plans for the cosmos.) (The sons of the morning ascended to the heavenly court, having been summoned by Elohim Himself.

The archangels rode their horses—Lucifer on his silver stallion, Michael on his chestnut stallion, and Gabriel on his golden stallion. Behind them, their winged hosts followed.

A disgruntled look was etched on Lucifer's face. Only curiosity and wonder filled Gabriel's and Michael's.

They knew this was the general assembly where Elohim would finally share his upcoming plans for the cosmos.) (The sons of the morning ascended to the heavenly court, having been summoned by Elohim Himself.

The archangels rode their horses—Lucifer on his silver stallion, Michael on his chestnut stallion, and Gabriel on his golden stallion. Behind them, their winged hosts followed. A disgruntled look was etched on Lucifer's face. Only curiosity and wonder filled Gabriel's and Michael's.`,
  authorNote = "The author's note goes here...The archangels rode their horses—Lucifer on his silver stallion, Michael on his chestnut stallion, and Gabriel on his golden stallion.",
}: StoryPremiumProps) => {
  const [selectedChapter, setSelectedChapter] = useState("1");
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(20);
  const [showComments, setShowComments] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isChapterSelectorVisible, setIsChapterSelectorVisible] =
    useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Audio player state
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(38); // Current time in seconds (00:38)
  const [duration, setDuration] = useState(306); // Total duration in seconds (05:06)
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 1.5x, 2x, 2.5x, 3x
  const [isSliderActive, setIsSliderActive] = useState(false); // Track slider interaction
  const audioRef = useRef<HTMLAudioElement>(null);

  // Handle scroll to show/hide navigation bars
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? "down" : "up";

      // Show title/header navigation when scrolling up, hide when scrolling down
      // Also show when at the very top
      if (scrollDirection === "up" || currentScrollY < 10) {
        setIsNavVisible(true);
      } else if (scrollDirection === "down" && currentScrollY > 100) {
        setIsNavVisible(false);
      }

      // Chapter selector appears only when scrolling up and past a certain point
      // But hide it when very close to the top to avoid covering the title
      if (
        scrollDirection === "up" &&
        currentScrollY > 100 &&
        currentScrollY < 1000
      ) {
        setIsChapterSelectorVisible(true);
      } else if (scrollDirection === "down" || currentScrollY < 80) {
        setIsChapterSelectorVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  // Auto-progress slider when playing
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying && !isSliderActive) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) => {
          const newTime = prevTime + playbackSpeed;
          // Stop at duration to prevent overflow
          return newTime >= duration ? duration : newTime;
        });
      }, 1000); // Update every second
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, playbackSpeed, duration, isSliderActive]);

  // Stop playing when reaching the end
  useEffect(() => {
    if (currentTime >= duration) {
      setIsPlaying(false);
      setCurrentTime(duration);
    }
  }, [currentTime, duration]);

  const chapters = {
    "1": "Chapter 1",
    "2": "Chapter 2",
    "3": "Chapter 3",
    "4": "Chapter 4",
    "5": "Chapter 5",
  };

  const comments = [
    {
      id: 1,
      author: "Jane Moore",
      content:
        "Very interesting and exciting story. I love every details of the story. I learnt a lot while reading.",
    },
    {
      id: 2,
      author: "Jane Moore",
      content:
        "Very interesting and exciting story. I love every details of the story. I learnt a lot while reading.",
    },
  ];

  const handleLike = () => {
    setLiked(!liked);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  // Audio player functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleAudioPlayer = () => {
    setShowAudioPlayer(!showAudioPlayer);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Here you would control actual audio playback
  };

  const handleSpeedChange = () => {
    const speeds = [1, 1.5, 2, 2.5, 3];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const handleSeek = (value: number | number[]) => {
    const newTime = Array.isArray(value) ? value[0] : value;
    setCurrentTime(newTime);
    // Here you would seek the actual audio
  };

  const handlePreviousChapter = () => {
    const currentChapterNum = parseInt(selectedChapter);
    if (currentChapterNum > 1) {
      setSelectedChapter((currentChapterNum - 1).toString());
    }
  };

  const handleNextChapter = () => {
    const currentChapterNum = parseInt(selectedChapter);
    const maxChapter = Object.keys(chapters).length;
    if (currentChapterNum < maxChapter) {
      setSelectedChapter((currentChapterNum + 1).toString());
    }
  };

  return (
    <div className="min-h-screen bg-accent-shade-1 relative overflow-hidden max-w-[28rem] mx-auto">
      {/* Header */}
      <div
        className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-accent-shade-1 px-4 pt-5 pb-4 z-40 transition-transform duration-300 ${
          isNavVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <Link href="/">
            <ArrowLeft className="w-6 h-6 text-primary-colour" />
          </Link>
        </div>
      </div>

      {/* Title Bar */}
      <div
        className={`fixed top-16 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-accent-colour px-4 py-3 z-40 transition-transform duration-300 ${
          isNavVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <h1
            className={`text-lg text-primary-colour truncate flex-1 min-w-0 pr-2 ${Magnetik_Bold.className}`}
          >
            {title}
          </h1>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex-shrink-0 border-none"
          >
            <MoreVertical className="w-5 h-5 rotate-90 text-primary-colour" />
          </Button>
        </div>

        {/* Dropdown Menu - Positioned absolutely */}
        {showDropdown && (
          <div className="absolute top-full right-4 mt-1 w-40 bg-universal-white rounded-lg shadow-lg border border-light-grey-2 z-50">
            <button
              className="w-full px-4 py-3 text-left text-sm text-primary-colour hover:bg-accent-shade-1 border-b border-light-grey-2"
              onClick={() => setShowDropdown(false)}
            >
              Add to library
            </button>
            <button
              className="w-full px-4 py-3 text-left text-sm text-primary-colour hover:bg-accent-shade-1"
              onClick={() => setShowDropdown(false)}
            >
              Save to download
            </button>
          </div>
        )}
      </div>

      {/* Chapter Selector Bar */}
      <div
        className={`fixed top-28 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-accent-shade-1 px-4 py-3 z-40 transition-transform duration-300 ${
          isChapterSelectorVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Select
          placeholder="Chapter 1"
          variant="flat"
          classNames={{
            base: "w-fit min-w-0",
            mainWrapper: "w-fit min-w-0",
            innerWrapper:
              "w-fit min-w-0 bg-transparent gap-2 data-[open=true]:gap-2",
            trigger:
              "w-fit min-w-0 bg-transparent border-none shadow-none hover:bg-transparent data-[hover=true]:bg-transparent gap-2 data-[open=true]:gap-2 data-[open=true]:bg-transparent",
            value: "w-fit min-w-0 text-primary-colour ",
            selectorIcon: "text-primary-colour  !static",
            popoverContent: "min-w-fit w-auto p-0",
            listbox: "w-auto min-w-fit p-0",
          }}
          popoverProps={{
            placement: "bottom-start",
            offset: 4,
            classNames: {
              content:
                "min-w-fit w-auto overflow-visible p-0 bg-universal-white border border-light-grey-2 rounded-lg shadow-lg",
            },
          }}
          selectedKeys={[selectedChapter]}
          onSelectionChange={(keys) => {
            const keyArray = Array.from(keys as Set<string>);
            const value = keyArray[0] as string;
            setSelectedChapter(value);
          }}
        >
          {Object.entries(chapters).map(([key, value], index) => (
            <SelectItem
              key={key}
              classNames={{
                base: `
                  w-auto min-w-fit px-4 py-3 text-sm
                  [&[data-hover="true"]]:!bg-accent-shade-1
                  ${
                    index < Object.entries(chapters).length - 1
                      ? "border-b border-light-grey-2"
                      : ""
                  }
                `,
                title: `
                  ${
                    selectedChapter === key
                      ? "text-primary-colour"
                      : "text-primary-shade-3"
                  }
                `,
              }}
            >
              {value}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pt-44 pb-24" ref={scrollContainerRef}>
        {/* Story Content */}
        <div className="space-y-4 mb-6">
          <p
            className={`text-primary-shade-5 text-sm leading-relaxed ${Magnetik_Regular.className}`}
          >
            {content}
          </p>

          {/* Divider */}
          <div className="h-px bg-light-grey-2 w-full my-6" />

          {/* Author Section */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar
              src="/images/placeholder-image.svg"
              name={authorName}
              size="sm"
              className="w-6 h-6"
            />
            <span
              className={`text-primary-colour text-xs ${Magnetik_Medium.className}`}
            >
              By {authorName}
            </span>
          </div>
          <p
            className={`text-primary-shade-5 text-xs leading-relaxed ${Magnetik_Regular.className}`}
          >
            {authorNote}
          </p>
        </div>

        {/* Interaction Section */}
        <div className="bg-accent-shade-2 rounded-lg p-2 space-y-2">
          {/* Like and Comment Stats */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className="flex items-center gap-1 border-none text-primary-colour p-0 min-w-0"
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${
                      liked
                        ? "fill-complimentary-colour text-complimentary-colour "
                        : "text-primary-shade-1"
                    }`}
                  />
                  <span className={`text-xs ${Magnetik_Regular.className}`}>
                    Like
                  </span>
                </Button>
              </div>
              <div className="flex items-center gap-4 text-xs text-primary-colour">
                <span className={`${Magnetik_Regular.className} flex flex-row`}>
                  <ThumbsUp
                    className={`w-4 h-4 ${"text-complimentary-colour mr-[1.5px]"}`}
                  />
                  {likes} Likes
                </span>
              </div>
            </div>
            <div className="h-px bg-primary-shade-1" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-1 text-primary-colour p-0 min-w-0 border-none"
                >
                  <MessageCircle className="w-4 h-4 text-primary-shade-1" />
                  <span className={`text-xs ${Magnetik_Regular.className}`}>
                    Comment
                  </span>
                </Button>
              </div>
              <div className="flex items-center gap-4 text-xs text-primary-colour">
                <span className={`${Magnetik_Regular.className} flex flex-row`}>
                  <MessageCircle className="w-4 h-4 text-complimentary-colour mr-[1.5px]" />
                  {comments.length} comments
                </span>
              </div>
            </div>
          </div>
          {/* Divider */}
          <div className="h-px bg-primary-shade-1 -mx-2" />

          {/* Comments */}
          {showComments && (
            <div className="space-y-3 px-2 flex flex-col justify-center">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-t border-light-grey-2 pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar
                      src="/images/placeholder-image.svg"
                      name={comment.author}
                      size="sm"
                      className="w-4 h-4"
                    />
                    <span
                      className={`text-primary-colour text-xs ${Magnetik_Medium.className}`}
                    >
                      {comment.author}
                    </span>
                  </div>
                  <p
                    className={`text-primary-shade-4 text-xs leading-relaxed ${Magnetik_Regular.className}`}
                  >
                    {comment.content}
                  </p>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-colour border-none text-xs mt-2 p-0"
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-[#FFEBD0CC] backdrop-blur-sm z-40 transition-all duration-300 ${
          isNavVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {showAudioPlayer ? (
          /* Audio Player Interface */
          <div className="px-4 py-4 space-y-4">
            {/* Progress Bar and Time */}
            <div className="space-y-2">
              <Slider
                size="sm"
                step={1}
                maxValue={duration}
                minValue={0}
                value={currentTime}
                onChange={handleSeek}
                onPointerDown={() => setIsSliderActive(true)}
                onPointerUp={() => setIsSliderActive(false)}
                onMouseDown={() => setIsSliderActive(true)}
                onMouseUp={() => setIsSliderActive(false)}
                onMouseLeave={() => setIsSliderActive(false)}
                onTouchStart={() => setIsSliderActive(true)}
                onTouchEnd={() => setIsSliderActive(false)}
                className="w-full"
                classNames={{
                  base: "max-w-full h-2",
                  track: "bg-accent-shade-1 h-2",
                  filler: "bg-complimentary-colour h-2",
                  thumb: `${
                    isSliderActive ? "opacity-100" : "opacity-0"
                  } bg-complimentary-colour border-2 border-universal-white shadow-md transition-opacity duration-200`,
                }}
              />

              <div className="flex justify-between items-center">
                <span
                  className={`text-xs text-primary-colour ${Magnetik_Regular.className}`}
                >
                  {formatTime(currentTime)}
                </span>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSpeedChange}
                  className="text-primary-colour min-w-0 px-3 border-none"
                >
                  <span className={`text-sm ${Magnetik_Medium.className}`}>
                    {playbackSpeed}x
                  </span>
                </Button>

                <span
                  className={`text-xs text-primary-colour ${Magnetik_Regular.className}`}
                >
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center justify-between">
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                onClick={handlePreviousChapter}
                className="flex-shrink-0 bg-accent-shade-1 rounded-full p-[6px]"
              >
                <SkipBack className="w-6 h-6 text-complimentary-colour" />
              </Button>

              <Button
                isIconOnly
                variant="ghost"
                size="lg"
                onClick={togglePlayPause}
                className="bg-complimentary-colour rounded-full flex-shrink-0"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-universal-white" />
                ) : (
                  <Play className="w-8 h-8 text-universal-white ml-1" />
                )}
              </Button>

              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                onClick={handleNextChapter}
                className="flex-shrink-0 bg-accent-shade-1 rounded-full p-[6px]"
              >
                <SkipForward className="w-6 h-6 text-complimentary-colour" />
              </Button>
            </div>
          </div>
        ) : (
          /* Default Navigation */
          <div className="px-4 py-4">
            <div className="flex items-center justify-between w-full">
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                onClick={handlePreviousChapter}
                className="flex-shrink-0 bg-accent-shade-1 border-complimentary-shade-1 rounded-full p-[6px]"
              >
                <ChevronLeft className="w-6 h-6 text-complimentary-colour" />
              </Button>

              <Button
                isIconOnly
                variant="ghost"
                size="lg"
                onClick={toggleAudioPlayer}
                className="bg-complimentary-colour rounded-full flex-shrink-0"
              >
                <Volume2 className="w-8 h-8 text-universal-white fill-universal-white" />
              </Button>

              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                onClick={handleNextChapter}
                className="flex-shrink-0 bg-accent-shade-1 border-complimentary-shade-1 rounded-full p-[6px]"
              >
                <ChevronRight className="w-6 h-6 text-complimentary-colour" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Audio Element for future audio functionality */}
      <audio
        ref={audioRef}
        className="hidden"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
      />
    </div>
  );
};
