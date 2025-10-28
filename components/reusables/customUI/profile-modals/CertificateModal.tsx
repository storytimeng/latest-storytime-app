"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/react";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";

export const CertificateModal = () => {
  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>Certificate</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📜</div>
          <p className={`text-grey-3 ${Magnetik_Regular.className}`}>
            No certificate yet
          </p>
          <p
            className={`text-sm text-grey-4 mt-2 ${Magnetik_Regular.className}`}
          >
            Complete achievements to earn certificates
          </p>
        </div>
      </ModalBody>
    </>
  );
};
