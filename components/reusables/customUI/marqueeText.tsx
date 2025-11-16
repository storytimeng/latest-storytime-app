"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MarqueeTextProps {
  text: string;
  className?: string;
  speed?: number;
}

const MarqueeText = ({ text, className, speed = 30 }: MarqueeTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.scrollWidth;
        setShouldScroll(textWidth > containerWidth);
      }
    };

    // Small delay to ensure DOM is rendered
    const timer = setTimeout(checkOverflow, 100);

    window.addEventListener("resize", checkOverflow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [text]);

  const animationDuration = shouldScroll
    ? Math.max(3, text.length / speed)
    : undefined;

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden whitespace-nowrap", className)}
    >
      <span
        ref={textRef}
        className={cn("inline-block", shouldScroll && "animate-marquee")}
        style={{
          animationDuration: animationDuration
            ? `${animationDuration}s`
            : undefined,
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default MarqueeText;
