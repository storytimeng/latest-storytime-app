"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";

const FAQsModal = () => {
  return (
    <>
      <ModalHeader>
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>FAQs</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-4">
          <div>
            <h3 className={`font-semibold mb-2 ${Magnetik_Medium.className}`}>
              How do I reset my password?
            </h3>
            <p className={`text-grey-2 text-sm ${Magnetik_Regular.className}`}>
              Go to Settings &gt; Change password to update your password.
            </p>
          </div>
          <div>
            <h3 className={`font-semibold mb-2 ${Magnetik_Medium.className}`}>
              How do I contact support?
            </h3>
            <p className={`text-grey-2 text-sm ${Magnetik_Regular.className}`}>
              You can reach out through the Support option in settings.
            </p>
          </div>
          <div>
            <h3 className={`font-semibold mb-2 ${Magnetik_Medium.className}`}>
              How do I delete my account?
            </h3>
            <p className={`text-grey-2 text-sm ${Magnetik_Regular.className}`}>
              Go to Settings &gt; Delete Account. Please note this action is
              irreversible.
            </p>
          </div>
          <div>
            <h3 className={`font-semibold mb-2 ${Magnetik_Medium.className}`}>
              Can I recover deleted stories?
            </h3>
            <p className={`text-grey-2 text-sm ${Magnetik_Regular.className}`}>
              Unfortunately, deleted stories cannot be recovered. Make sure to
              backup important content.
            </p>
          </div>
        </div>
      </ModalBody>
    </>
  );
};

export default FAQsModal;
