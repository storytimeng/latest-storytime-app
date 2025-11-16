"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/react";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";

interface DefaultModalProps {
  title?: string;
  icon?: string;
}

export const DefaultModal: React.FC<DefaultModalProps> = ({
  title = "Details",
  icon = "📱",
}) => {
  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>{title}</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">{icon}</div>
          <p className={`text-grey-3 ${Magnetik_Regular.className}`}>
            Coming soon...
          </p>
        </div>
      </ModalBody>
    </>
  );
};
