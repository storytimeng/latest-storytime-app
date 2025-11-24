"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";

const SupportModal = () => {
  return (
    <>
      <ModalHeader>
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>Support</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-4">
          <p className={`text-grey-2 ${Magnetik_Regular.className}`}>
            Need help? Choose how you&apos;d like to reach out to our support
            team.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border border-light-grey-2 rounded-lg cursor-pointer hover:bg-accent-shade-1 transition-colors">
              <Mail size={20} className="text-grey-2" />
              <div>
                <p className={`font-medium ${Magnetik_Medium.className}`}>
                  Email Support
                </p>
                <p
                  className={`text-sm text-grey-2 ${Magnetik_Regular.className}`}
                >
                  support@storytime.com
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border border-light-grey-2 rounded-lg cursor-pointer hover:bg-accent-shade-1 transition-colors">
              <MessageCircle size={20} className="text-grey-2" />
              <div>
                <p className={`font-medium ${Magnetik_Medium.className}`}>
                  Live Chat
                </p>
                <p
                  className={`text-sm text-grey-2 ${Magnetik_Regular.className}`}
                >
                  Chat with our support team
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border border-light-grey-2 rounded-lg cursor-pointer hover:bg-accent-shade-1 transition-colors">
              <Phone size={20} className="text-grey-2" />
              <div>
                <p className={`font-medium ${Magnetik_Medium.className}`}>
                  Phone Support
                </p>
                <p
                  className={`text-sm text-grey-2 ${Magnetik_Regular.className}`}
                >
                  +1 (555) 123-4567
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button color="warning" className="w-full" size="lg">
              Start Live Chat
            </Button>
          </div>
        </div>
      </ModalBody>
    </>
  );
};

export default SupportModal;
