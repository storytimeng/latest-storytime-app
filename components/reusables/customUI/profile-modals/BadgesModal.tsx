"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/react";
import { Magnetik_Bold, Magnetik_Medium } from "@/lib/font";

export const BadgesModal = () => {
  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>Badges</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-accent-shade-1 rounded-lg">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xl">⭐</span>
            </div>
            <p className={`text-xs ${Magnetik_Medium.className}`}>
              First Story
            </p>
          </div>
          <div className="text-center p-4 bg-grey-5 rounded-lg opacity-50">
            <div className="w-12 h-12 bg-grey-3 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xl">🏆</span>
            </div>
            <p className={`text-xs ${Magnetik_Medium.className}`}>Top Writer</p>
          </div>
          <div className="text-center p-4 bg-grey-5 rounded-lg opacity-50">
            <div className="w-12 h-12 bg-grey-3 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xl">📚</span>
            </div>
            <p className={`text-xs ${Magnetik_Medium.className}`}>Bookworm</p>
          </div>
        </div>
      </ModalBody>
    </>
  );
};
