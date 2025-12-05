"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { useApiUserStats } from "@/src/hooks/useApiUserStats";
import { Skeleton } from "@heroui/skeleton";

export const ReadingModal = () => {
  const { stats, isLoading } = useApiUserStats();

  // Convert minutes to hours and minutes
  const formatTime = (minutes: number = 0) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (isLoading) {
    return (
      <>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className={`text-xl ${Magnetik_Bold.className}`}>Reading Time</h2>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="space-y-4">
            <div className="text-center p-6 bg-accent-shade-1 rounded-lg">
              <Skeleton className="w-12 h-12 mx-auto mb-2 rounded-full" />
              <Skeleton className="h-8 w-24 mx-auto mb-2" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          </div>
        </ModalBody>
      </>
    );
  }

  const totalReadingTime = stats.readingTime || 0;
  const storiesRead = stats.storiesRead || 0;
  const readingStreak = stats.readingStreak || 0;

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>Reading Time</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-4">
          <div className="text-center p-6 bg-accent-shade-1 rounded-lg">
            <div className="text-4xl text-primary-colour mb-2">⏰</div>
            <h3 className={`text-2xl ${Magnetik_Bold.className}`}>
              {formatTime(totalReadingTime)}
            </h3>
            <p className={`text-sm text-grey-3 ${Magnetik_Regular.className}`}>
              Total reading time
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-accent-shade-1 rounded-lg">
              <h4 className={`text-lg ${Magnetik_Medium.className}`}>
                {storiesRead}
              </h4>
              <p
                className={`text-xs text-grey-3 ${Magnetik_Regular.className}`}
              >
                Stories read
              </p>
            </div>
            <div className="text-center p-4 bg-accent-shade-1 rounded-lg">
              <h4 className={`text-lg ${Magnetik_Medium.className}`}>
                {readingStreak} {readingStreak === 1 ? 'day' : 'days'}
              </h4>
              <p
                className={`text-xs text-grey-3 ${Magnetik_Regular.className}`}
              >
                Reading streak
              </p>
            </div>
          </div>
        </div>
      </ModalBody>
    </>
  );
};
