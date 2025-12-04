"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { cn } from "@/lib/utils";

interface CacheLoadingModalProps {
  isOpen: boolean;
  onLoadCache: () => void;
  onDiscardCache: () => void;
  cacheType: "chapters" | "episodes";
  autoLoadDelay?: number; // Delay in seconds before auto-loading (default 30)
}

export const CacheLoadingModal: React.FC<CacheLoadingModalProps> = ({
  isOpen,
  onLoadCache,
  onDiscardCache,
  cacheType,
  autoLoadDelay = 30,
}) => {
  const [countdown, setCountdown] = useState(autoLoadDelay);

  // Reset countdown when modal opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(autoLoadDelay);
    }
  }, [isOpen, autoLoadDelay]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auto-load cache when countdown reaches 0
          onLoadCache();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdown, onLoadCache]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onDiscardCache}
      isDismissable={false}
      hideCloseButton
      placement="center"
      classNames={{
        backdrop: "bg-black/50",
        wrapper: "items-center justify-center",
      }}
    >
      <ModalContent className="bg-universal-white max-w-[90%] w-[400px] rounded-2xl">
        <ModalHeader className="flex flex-col gap-1 pb-2">
          <h2
            className={cn(
              "text-xl text-primary-colour",
              Magnetik_Bold.className
            )}
          >
            Unsaved {cacheType === "chapters" ? "Chapters" : "Episodes"} Found
          </h2>
        </ModalHeader>

        <ModalBody className="py-4">
          <div className="space-y-4">
            <p
              className={cn(
                "text-sm text-primary-colour",
                Magnetik_Regular.className
              )}
            >
              We found unsaved {cacheType} for this story from a previous
              session. Would you like to restore them?
            </p>

            <div className="bg-accent-shade-2 rounded-lg p-4 space-y-2">
              <p
                className={cn(
                  "text-sm text-primary-colour font-medium",
                  Magnetik_Medium.className
                )}
              >
                Auto-loading in {countdown} seconds...
              </p>
              <div className="w-full bg-light-grey-2 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-complimentary-colour h-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${((autoLoadDelay - countdown) / autoLoadDelay) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-red/10 border border-red/30 rounded-lg p-3">
              <p className={cn("text-xs text-red", Magnetik_Regular.className)}>
                ⚠️ Warning: Discarding will permanently delete your unsaved{" "}
                {cacheType}. This action cannot be undone.
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="pt-2">
          <Button
            variant="bordered"
            className={cn(
              "border-red text-red hover:bg-red/10",
              Magnetik_Medium.className
            )}
            onPress={onDiscardCache}
          >
            Discard Cache
          </Button>
          <Button
            className={cn(
              "bg-complimentary-colour text-universal-white",
              Magnetik_Medium.className
            )}
            onPress={onLoadCache}
          >
            Load Cache Now
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
