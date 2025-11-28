"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Story {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  genres?: string[];
  author?: {
    penName: string;
  };
}

interface StoriesCarouselProps {
  stories: Story[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showDots?: boolean;
}

export function StoriesCarousel({
  stories,
  autoPlay = false,
  autoPlayInterval = 5000,
  showControls = true,
  showDots = true,
}: StoriesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isDragging || stories.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stories.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isDragging, stories.length]);

  // Animate to current index
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.offsetWidth;
    animate(x, -currentIndex * width, {
      type: "spring",
      stiffness: 300,
      damping: 30,
    });
  }, [currentIndex, x]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  if (stories.length === 0) {
    return (
      <div className="relative h-52 rounded-xl bg-accent-colour flex items-center justify-center">
        <p className="text-grey-2">No stories available</p>
      </div>
    );
  }

  const currentStory = stories[currentIndex];

  return (
    <div className="relative w-full">
      {/* Main Carousel */}
      <div
        ref={containerRef}
        className="relative overflow-hidden border-none rounded-xl"
      >
        <motion.div
          className="flex"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -(stories.length - 1) * (containerRef.current?.offsetWidth || 0), right: 0 }}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => {
            setIsDragging(false);
            const width = containerRef.current?.offsetWidth || 0;
            const offset = x.get();
            const newIndex = Math.round(-offset / width);
            setCurrentIndex(Math.max(0, Math.min(newIndex, stories.length - 1)));
          }}
        >
          {stories.map((story) => (
            <motion.div
              key={story.id}
              className="relative h-52 rounded-xl flex-shrink-0 w-full"
            >
              <Link href={`/story/${story.id}`} className="block w-full h-full">
                {story.coverImage ? (
                  <Image
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-full object-cover rounded-xl"
                    width={400}
                    height={208}
                    priority={story.id === currentStory.id}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-shade-3 to-primary-shade-6 rounded-xl" />
                )}

                {/* Genre Badge */}
                {story.genres && story.genres.length > 0 && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-accent-colour body-text-smallest-medium-auto px-3 py-[3px] rounded-[2px] text-primary-colour">
                      {story.genres[0]}
                    </div>
                  </div>
                )}

                {/* Story Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center bg-gradient-to-t from-black/100 to-transparent">
                  <h3 className="text-white text-lg font-bold mb-1 line-clamp-1">
                    {story.title}
                  </h3>
                  {story.description && (
                    <p className="text-white/90 text-[10px] leading-relaxed line-clamp-2 mb-1">
                      {story.description}
                    </p>
                  )}
                  {story.author && (
                    <span className="text-[10px] font-bold text-complimentary-colour">
                      by {story.author.penName}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Controls */}
      {showControls && stories.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
            aria-label="Previous story"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
            aria-label="Next story"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {showDots && stories.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-6 bg-primary-colour"
                  : "w-2 bg-grey-2"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
