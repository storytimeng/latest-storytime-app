"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";

export const ReadingModal = () => {
  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>Reading Time</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-4">
          <div className="text-center p-6 bg-accent-shade-1 rounded-lg">
            <div className="text-4xl text-primary-colour mb-2">⏰</div>
            <h3 className={`text-2xl ${Magnetik_Bold.className}`}>2h 45m</h3>
            <p className={`text-sm text-grey-3 ${Magnetik_Regular.className}`}>
              This week
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-accent-shade-1 rounded-lg">
              <h4 className={`text-lg ${Magnetik_Medium.className}`}>
                15h 30m
              </h4>
              <p
                className={`text-xs text-grey-3 ${Magnetik_Regular.className}`}
              >
                This month
              </p>
            </div>
            <div className="text-center p-4 bg-accent-shade-1 rounded-lg">
              <h4 className={`text-lg ${Magnetik_Medium.className}`}>127h</h4>
              <p
                className={`text-xs text-grey-3 ${Magnetik_Regular.className}`}
              >
                All time
              </p>
            </div>
          </div>
        </div>
      </ModalBody>
    </>
  );
};
