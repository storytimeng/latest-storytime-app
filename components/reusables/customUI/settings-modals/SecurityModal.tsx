"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Switch } from "@heroui/switch";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";

const SecurityModal = () => {
  return (
    <>
      <ModalHeader>
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>Security</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-4">
          <p className={`text-grey-2 ${Magnetik_Regular.className}`}>
            Manage your security settings and privacy preferences.
          </p>
          <div className="flex items-center justify-between">
            <span className={`${Magnetik_Medium.className}`}>
              Two-Factor Authentication
            </span>
            <Switch size="sm" color="warning" />
          </div>
          <div className="flex items-center justify-between">
            <span className={`${Magnetik_Medium.className}`}>
              Login Notifications
            </span>
            <Switch size="sm" color="warning" defaultSelected />
          </div>
        </div>
      </ModalBody>
    </>
  );
};

export default SecurityModal;
