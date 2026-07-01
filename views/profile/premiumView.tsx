"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalContent } from "@heroui/modal";
import { ArrowLeft, Volume2, Download, Bookmark, Loader2 } from "lucide-react";
import { Link } from "@/components/AppLink";
import Image from "next/image";
import {
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import { reactivateSubscription } from "@/src/lib/subscriptions";
import { usePremiumFeatures } from "@/src/hooks/usePremiumFeatures";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";
import CancelPremiumModal from "@/components/reusables/customUI/CancelPremiumModal";
import SubscriptionUpgradePanel from "@/components/reusables/customUI/SubscriptionUpgradePanel";
import { showToast } from "@/lib/showNotification";

const features = [
  {
    icon: <Volume2 className="w-6 h-6 text-complimentary-colour" />,
    title: "Read with audio",
    description: "Enjoy stories with audio.",
  },
  {
    icon: <Download className="w-6 h-6 text-complimentary-colour" />,
    title: "Download Stories",
    description: "Download stories and read later.",
  },
  {
    icon: <Bookmark className="w-6 h-6 text-complimentary-colour" />,
    title: "Read offline",
    description: "Read stories offline on Storytime.",
  },
];

function formatExpiryDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const PremiumView = () => {
  const { isAuthenticated } = useAuthStore();
  const openAuthModal = useAuthModalStore((state) => state.openModal);
  const {
    isPremium,
    isLoading: premiumLoading,
    premiumExpiresAt,
    isSubscriptionCancelled,
    currentPlanCode,
    refreshPremiumStatus,
  } = usePremiumFeatures();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const showNewCheckout = !isPremium && !premiumLoading;
  const showUpgrade = isPremium && !premiumLoading;

  const handleOpenCancelModal = () => {
    if (!isAuthenticated()) {
      openAuthModal("login");
      return;
    }
    setIsCancelModalOpen(true);
  };

  const handleReactivate = async () => {
    if (!isAuthenticated()) {
      openAuthModal("login");
      return;
    }

    setIsReactivating(true);
    try {
      const result = await reactivateSubscription();
      refreshPremiumStatus();
      showToast({
        type: "success",
        message: result.message,
        duration: 4000,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to reactivate subscription";
      showToast({ type: "error", message });
    } finally {
      setIsReactivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto">
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/home">
            <ArrowLeft className="w-6 h-6 text-primary-colour" />
          </Link>
        </div>
      </div>

      <div className="px-4 pb-24 space-y-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative w-24 h-24">
            <Image
              src="/images/logo.png"
              alt="Storytime Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1
            className={`text-xl text-primary-colour ${Magnetik_SemiBold.className}`}
          >
            Storytime Premium
          </h1>

          {premiumLoading && isAuthenticated() && (
            <Loader2 className="w-5 h-5 animate-spin text-complimentary-colour" />
          )}

          {isPremium && !premiumLoading && (
            <p
              className={`text-sm text-complimentary-colour leading-relaxed max-w-[16rem] ${Magnetik_Medium.className}`}
            >
              {isSubscriptionCancelled
                ? `Premium access continues until ${
                    premiumExpiresAt
                      ? formatExpiryDate(premiumExpiresAt)
                      : "your period ends"
                  }. Your subscription is cancelled.`
                : `Your Premium membership is active${
                    premiumExpiresAt
                      ? ` until ${formatExpiryDate(premiumExpiresAt)}`
                      : ""
                  }.`}
            </p>
          )}
        </div>

        <div className="space-y-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg bg-complimentary-colour/10">
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3
                  className={`text-md text-primary-colour mb-1 ${Magnetik_SemiBold.className}`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`text-primary-shade-4 text-sm ${Magnetik_Regular.className}`}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {showNewCheckout && (
          <SubscriptionUpgradePanel variant="new" showHeading />
        )}

        {showUpgrade && (
          <SubscriptionUpgradePanel
            variant="upgrade"
            currentPlanCode={currentPlanCode}
            showHeading
          />
        )}

        <div className="space-y-6 text-center">
          {showNewCheckout ? (
            <p
              className={`text-primary-shade-4 text-xs ${Magnetik_Regular.className}`}
            >
              Secure payment. Cancel anytime from Settings.
            </p>
          ) : (
            isPremium &&
            !premiumLoading && (
              <>
                <p
                  className={`text-primary-colour text-[14px] ${Magnetik_Medium.className}`}
                >
                  {isSubscriptionCancelled
                    ? "You can reactivate anytime before your access ends."
                    : "Enjoy unlimited access to your Premium benefits."}
                </p>
                <Button
                  as={Link}
                  href="/home"
                  className={`w-full bg-primary-shade-6 text-universal-white py-4 text-lg ${Magnetik_Medium.className}`}
                  size="lg"
                >
                  Start reading
                </Button>
                {isSubscriptionCancelled ? (
                  <Button
                    variant="bordered"
                    className={`w-full border-complimentary-colour text-complimentary-colour ${Magnetik_Medium.className}`}
                    onPress={handleReactivate}
                    isLoading={isReactivating}
                    isDisabled={isReactivating}
                  >
                    Reactivate subscription
                  </Button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenCancelModal}
                    className={`text-sm text-primary-shade-4 hover:text-primary-colour transition-colors ${Magnetik_Regular.className}`}
                  >
                    Cancel subscription
                  </button>
                )}
              </>
            )
          )}
        </div>
      </div>

      <Modal
        isOpen={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        placement="center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <CancelPremiumModal
              isOpen={isCancelModalOpen}
              premiumExpiresAt={premiumExpiresAt}
              onClose={onClose}
              onCancelled={refreshPremiumStatus}
            />
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PremiumView;
