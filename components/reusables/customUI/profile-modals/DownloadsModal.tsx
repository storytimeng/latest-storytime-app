"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/react";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";

export const DownloadsModal = () => {
  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>My Downloads</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-accent-shade-1 rounded-lg">
            <div className="w-12 h-16 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white text-xs">⬇️</span>
            </div>
            <div className="flex-1">
              <h3 className={`text-sm ${Magnetik_Medium.className}`}>
                The Mystery Novel
              </h3>
              <p
                className={`text-xs text-grey-3 ${Magnetik_Regular.className}`}
              >
                Mystery • Downloaded
              </p>
              <p
                className={`text-xs text-grey-4 ${Magnetik_Regular.className}`}
              >
                2.3 MB • PDF
              </p>
            </div>
          </div>
          <div className="text-center py-4 text-grey-3">
            <p className={`text-sm ${Magnetik_Regular.className}`}>
              Download stories to read offline
            </p>
          </div>
        </div>
      </ModalBody>
    </>
  );
};
