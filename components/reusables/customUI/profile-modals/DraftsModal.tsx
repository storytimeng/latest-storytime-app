"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@/components/ui/button";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";

export const DraftsModal = () => {
  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>My Drafts</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent-shade-1">
            <div className="flex items-center justify-center w-12 h-16 rounded bg-grey-3">
              <span className="text-xs text-white">📝</span>
            </div>
            <div className="flex-1">
              <h3 className={`text-sm ${Magnetik_Medium.className}`}>
                Untitled Story
              </h3>
              <p
                className={`text-xs text-grey-3 ${Magnetik_Regular.className}`}
              >
                Romance • Draft
              </p>
              <p
                className={`text-xs text-grey-4 ${Magnetik_Regular.className}`}
              >
                Last edited 2 days ago
              </p>
            </div>
          </div>
          <div className="py-4 text-center">
            <Button className="w-full text-white bg-primary-colour">
              Continue Writing
            </Button>
          </div>
        </div>
      </ModalBody>
    </>
  );
};
