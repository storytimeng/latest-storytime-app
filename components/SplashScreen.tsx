"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  onComplete?: () => void;
  minDisplayTime?: number;
}

export const SplashScreen = ({
  onComplete,
  minDisplayTime = 2000,
}: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-accent-shade-1 animate-fade-in">
      <div className="flex flex-col items-center justify-center px-8 space-y-6">
        {/* Pulsating Banner Logo */}
        <div className="relative w-full max-w-md aspect-[1200/630] animate-pulse-scale">
          <Image
            src="/images/banner.png"
            alt="Storytime"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Loading Indicator */}
        <div className="flex space-x-2">
          <div
            className="w-3 h-3 rounded-full bg-complimentary-colour animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-3 h-3 rounded-full bg-complimentary-colour animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-3 h-3 rounded-full bg-complimentary-colour animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
