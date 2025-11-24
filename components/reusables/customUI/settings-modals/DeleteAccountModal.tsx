"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@/components/ui/button";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";

const DeleteAccountModal = () => {
  return (
    <>
      <ModalHeader>
        <h2 className={`text-xl text-red ${Magnetik_Bold.className}`}>
          Delete Account
        </h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-4">
          <p className={`text-grey-2 ${Magnetik_Regular.className}`}>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </p>
          <div className="bg-red/10 p-3 rounded-lg border border-red/20">
            <p className={`text-red text-sm ${Magnetik_Medium.className}`}>
              ⚠️ Warning: All your stories, progress, and data will be
              permanently lost.
            </p>
          </div>

          <div className="space-y-2">
            <p className={`text-sm font-medium ${Magnetik_Medium.className}`}>
              What will be deleted:
            </p>
            <ul
              className={`text-sm text-grey-2 space-y-1 ${Magnetik_Regular.className}`}
            >
              <li>• All your written stories</li>
              <li>• Reading progress and bookmarks</li>
              <li>• Profile information and preferences</li>
              <li>• Account history and achievements</li>
            </ul>
          </div>

          <div className="flex gap-3 mt-6">
            <Button color="default" variant="bordered" className="flex-1">
              Cancel
            </Button>
            <Button color="danger" className="flex-1">
              Delete Account
            </Button>
          </div>
        </div>
      </ModalBody>
    </>
  );
};

export default DeleteAccountModal;
