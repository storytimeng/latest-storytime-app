"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Magnetik_Bold, Magnetik_Medium } from "@/lib/font";

export const BadgesModal = () => {
  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>Badges</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 text-center rounded-lg bg-accent-shade-1">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-orange-500 rounded-full">
              <span className="text-xl text-white">⭐</span>
            </div>
            <p className={`text-xs ${Magnetik_Medium.className}`}>
              First Story
            </p>
          </div>
          <div className="p-4 text-center rounded-lg opacity-50 bg-grey-5">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-grey-3">
              <span className="text-xl text-white">🏆</span>
            </div>
            <p className={`text-xs ${Magnetik_Medium.className}`}>Top Writer</p>
          </div>
          <div className="p-4 text-center rounded-lg opacity-50 bg-grey-5">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-grey-3">
              <span className="text-xl text-white">📚</span>
            </div>
            <p className={`text-xs ${Magnetik_Medium.className}`}>Bookworm</p>
          </div>
        </div>
      </ModalBody>
    </>
  );
};
