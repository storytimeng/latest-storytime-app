"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { useApiUserStats } from "@/src/hooks/useApiUserStats";
import { Skeleton } from "@heroui/skeleton";

export const WritingModal = () => {
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
          <h2 className={`text-xl ${Magnetik_Bold.className}`}>Writing Time</h2>
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

  const totalWritingTime = stats.writingTime || 0;
  const storiesWritten = stats.storiesWritten || 0;
  const writingStreak = stats.writingStreak || 0;

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>Writing Time</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-4">
          <div className="text-center p-6 bg-accent-shade-1 rounded-lg">
            <div className="text-4xl text-primary-colour mb-2">✍️</div>
            <h3 className={`text-2xl ${Magnetik_Bold.className}`}>
              {formatTime(totalWritingTime)}
            </h3>
            <p className={`text-sm text-grey-3 ${Magnetik_Regular.className}`}>
              Total writing time
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-accent-shade-1 rounded-lg">
              <h4 className={`text-lg ${Magnetik_Medium.className}`}>
                {storiesWritten}
              </h4>
              <p
                className={`text-xs text-grey-3 ${Magnetik_Regular.className}`}
              >
                Stories written
              </p>
            </div>
            <div className="text-center p-4 bg-accent-shade-1 rounded-lg">
              <h4 className={`text-lg ${Magnetik_Medium.className}`}>
                {writingStreak} {writingStreak === 1 ? 'day' : 'days'}
              </h4>
              <p
                className={`text-xs text-grey-3 ${Magnetik_Regular.className}`}
              >
                Writing streak
              </p>
            </div>
          </div>
        </div>
      </ModalBody>
    </>
  );
};
