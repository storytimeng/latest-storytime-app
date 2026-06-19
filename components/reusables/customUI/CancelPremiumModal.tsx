"use client";

import React, { useEffect, useState } from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Volume2, Download, Bookmark } from "lucide-react";
import {
  Magnetik_Bold,
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import { cancelSubscription } from "@/src/lib/subscriptions";
import { showToast } from "@/lib/showNotification";

const retentionBenefits = [
  {
    icon: Volume2,
    label: "Listen to stories with audio",
  },
  {
    icon: Download,
    label: "Download stories for later",
  },
  {
    icon: Bookmark,
    label: "Read offline anywhere",
  },
];

interface CancelPremiumModalProps {
  isOpen: boolean;
  premiumExpiresAt: string | null;
  onClose: () => void;
  onCancelled: () => void;
}

function formatExpiryDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const CancelPremiumModal: React.FC<CancelPremiumModalProps> = ({
  isOpen,
  premiumExpiresAt,
  onClose,
  onCancelled,
}) => {
  const [step, setStep] = useState<"retain" | "confirm">("retain");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep("retain");
      setIsCancelling(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setStep("retain");
    onClose();
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      const result = await cancelSubscription();
      onCancelled();
      handleClose();
      showToast({
        type: "success",
        message: result.message,
        duration: 4000,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to cancel subscription";
      showToast({ type: "error", message });
    } finally {
      setIsCancelling(false);
    }
  };

  if (step === "confirm") {
    return (
      <>
        <ModalHeader className="flex flex-col gap-1 pb-2">
          <h2
            className={`text-lg text-primary-colour ${Magnetik_SemiBold.className}`}
          >
            Confirm cancellation
          </h2>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="space-y-5">
            <p
              className={`text-sm text-primary-shade-4 leading-relaxed ${Magnetik_Regular.className}`}
            >
              {premiumExpiresAt
                ? `Your Premium access will remain until ${formatExpiryDate(premiumExpiresAt)}. After that date, audio, downloads, and offline reading will no longer be available.`
                : "After your current period ends, audio, downloads, and offline reading will no longer be available."}
            </p>
            <p
              className={`text-sm text-primary-shade-4 ${Magnetik_Regular.className}`}
            >
              You will not be charged again.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                className={`w-full bg-primary-shade-6 text-universal-white ${Magnetik_Medium.className}`}
                onPress={() => setStep("retain")}
                isDisabled={isCancelling}
              >
                Go back
              </Button>
              <Button
                variant="bordered"
                className={`w-full border-red-300 text-red-600 ${Magnetik_Medium.className}`}
                onPress={handleConfirmCancel}
                isLoading={isCancelling}
                isDisabled={isCancelling}
              >
                Yes, cancel my subscription
              </Button>
            </div>
          </div>
        </ModalBody>
      </>
    );
  }

  return (
    <>
      <ModalHeader className="flex flex-col gap-1 pb-2">
        <h2
          className={`text-lg text-primary-colour ${Magnetik_Bold.className}`}
        >
          We would love to keep you
        </h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-5">
          <p
            className={`text-sm text-primary-shade-4 leading-relaxed ${Magnetik_Regular.className}`}
          >
            Premium makes Storytime richer — stories you can hear, save, and
            enjoy even without an internet connection.
          </p>

          <ul className="space-y-3">
            {retentionBenefits.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-complimentary-colour/10 shrink-0">
                  <Icon className="w-4 h-4 text-complimentary-colour" />
                </div>
                <span
                  className={`text-sm text-primary-colour ${Magnetik_Medium.className}`}
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>

          {premiumExpiresAt && (
            <p
              className={`text-xs text-primary-shade-4 bg-complimentary-colour/5 rounded-lg px-3 py-2.5 ${Magnetik_Regular.className}`}
            >
              If you cancel now, you keep Premium until{" "}
              {formatExpiryDate(premiumExpiresAt)} — no further charges.
            </p>
          )}

          <div className="flex flex-col gap-3 pt-1">
            <Button
              className={`w-full bg-primary-shade-6 text-universal-white py-3 ${Magnetik_Medium.className}`}
              onPress={handleClose}
            >
              Keep Premium
            </Button>
            <button
              type="button"
              onClick={() => setStep("confirm")}
              className={`text-sm text-primary-shade-4 hover:text-primary-colour transition-colors ${Magnetik_Regular.className}`}
            >
              Continue to cancel
            </button>
          </div>
        </div>
      </ModalBody>
    </>
  );
};

export default CancelPremiumModal;
