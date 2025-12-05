"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Magnetik_Bold, Magnetik_Medium } from "@/lib/font";
import { useUserAchievements } from "@/src/hooks/useUserAchievements";
import { Skeleton } from "@heroui/skeleton";

export const BadgesModal = () => {
  const { badges, isLoading } = useUserAchievements();

  if (isLoading) {
    return (
      <>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className={`text-xl ${Magnetik_Bold.className}`}>Badges</h2>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 text-center rounded-lg bg-accent-shade-1">
                <Skeleton className="w-12 h-12 mx-auto mb-2 rounded-full" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </ModalBody>
      </>
    );
  }

  if (badges.length === 0) {
    return (
      <>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className={`text-xl ${Magnetik_Bold.className}`}>Badges</h2>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🏆</div>
            <p className={`text-grey-3 ${Magnetik_Medium.className}`}>
              No badges earned yet
            </p>
            <p className="text-xs text-grey-3 mt-2">
              Keep reading and writing to earn badges!
            </p>
          </div>
        </ModalBody>
      </>
    );
  }

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>Badges</h2>
        <p className="text-sm text-grey-3">{badges.length} badge{badges.length !== 1 ? 's' : ''} earned</p>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="grid grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div key={badge.id} className="p-4 text-center rounded-lg bg-accent-shade-1">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-orange-500 rounded-full">
                <span className="text-xl text-white">{badge.icon || "⭐"}</span>
              </div>
              <p className={`text-xs ${Magnetik_Medium.className}`}>
                {badge.name}
              </p>
              {badge.earnedAt && (
                <p className="text-[10px] text-grey-3 mt-1">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </ModalBody>
    </>
  );
};
