"use client";

import React from "react";
import { ModalHeader, ModalBody, Button } from "@heroui/react";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";

export const StoriesModal = () => {
  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>My Stories</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-accent-shade-1 rounded-lg">
            <div className="w-12 h-16 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white text-xs">📖</span>
            </div>
            <div className="flex-1">
              <h3 className={`text-sm ${Magnetik_Medium.className}`}>
                The Adventure Begins
              </h3>
              <p
                className={`text-xs text-grey-3 ${Magnetik_Regular.className}`}
              >
                Adventure • Ongoing
              </p>
              <p
                className={`text-xs text-grey-4 ${Magnetik_Regular.className}`}
              >
                1.2K views • 45 likes
              </p>
            </div>
          </div>
          <div className="text-center py-4">
            <Button className="bg-primary-colour text-white">
              Write New Story
            </Button>
          </div>
        </div>
      </ModalBody>
    </>
  );
};
