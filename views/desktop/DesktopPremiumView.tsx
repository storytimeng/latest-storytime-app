"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@heroui/button";
import { Modal, ModalContent } from "@heroui/modal";
import { Bookmark, Download, Loader2, Volume2 } from "lucide-react";
import {
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import { cn } from "@/lib/utils";
import { DESKTOP_ROUTES } from "@/config/desktopRoutes";
import { reactivateSubscription } from "@/src/lib/subscriptions";
import { usePremiumFeatures } from "@/src/hooks/usePremiumFeatures";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";
import CancelPremiumModal from "@/components/reusables/customUI/CancelPremiumModal";
import SubscriptionUpgradePanel from "@/components/reusables/customUI/SubscriptionUpgradePanel";
import { showToast } from "@/lib/showNotification";

const features = [
  {
    icon: Volume2,
    title: "Read with audio",
    description: "Enjoy stories with natural narration and playback controls.",
  },
  {
    icon: Download,
    title: "Download stories",
    description: "Save stories to your library and read them later.",
  },
  {
    icon: Bookmark,
    title: "Read offline",
    description: "Keep reading without an internet connection.",
  },
];

function formatExpiryDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function DesktopPremiumView() {
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
    <>
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-24 w-24">
                <Image
                  src="/images/logo.png"
                  alt="Storytime Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h2
                className={cn(
                  "mt-4 text-2xl text-[#361B17] md:text-3xl",
                  Magnetik_SemiBold.className,
                )}
              >
                Storytime Premium
              </h2>
              <p
                className={cn(
                  "mt-2 max-w-md text-sm text-[#361B17]/60",
                  Magnetik_Regular.className,
                )}
              >
                Unlock audio narration, downloads, and offline reading across
                the desktop and mobile app.
              </p>

              {premiumLoading && isAuthenticated() && (
                <Loader2 className="mt-4 h-5 w-5 animate-spin text-complimentary-colour" />
              )}

              {isPremium && !premiumLoading && (
                <p
                  className={cn(
                    "mt-4 text-sm text-complimentary-colour",
                    Magnetik_Medium.className,
                  )}
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
          </div>

          <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-complimentary-colour/10">
                  <Icon className="h-6 w-6 text-complimentary-colour" />
                </div>
                <div>
                  <h3
                    className={cn(
                      "text-base text-[#361B17]",
                      Magnetik_SemiBold.className,
                    )}
                  >
                    {title}
                  </h3>
                  <p
                    className={cn(
                      "mt-1 text-sm text-[#361B17]/60",
                      Magnetik_Regular.className,
                    )}
                  >
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
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

          <div className="mt-6 space-y-4 text-center">
            {showNewCheckout ? (
              <p
                className={cn(
                  "text-xs text-[#361B17]/50",
                  Magnetik_Regular.className,
                )}
              >
                Secure payment via Paystack. Cancel anytime from Settings.
              </p>
            ) : (
              isPremium &&
              !premiumLoading && (
                <>
                  <p
                    className={cn(
                      "text-sm text-[#361B17]",
                      Magnetik_Medium.className,
                    )}
                  >
                    {isSubscriptionCancelled
                      ? "You can reactivate anytime before your access ends."
                      : "Enjoy unlimited access to your Premium benefits."}
                  </p>
                  <Button
                    as={Link}
                    href={DESKTOP_ROUTES.home}
                    className={cn(
                      "w-full bg-primary-shade-6 text-white",
                      Magnetik_Medium.className,
                    )}
                    size="lg"
                  >
                    Start reading
                  </Button>
                  {isSubscriptionCancelled ? (
                    <Button
                      variant="bordered"
                      className={cn(
                        "w-full border-complimentary-colour text-complimentary-colour",
                        Magnetik_Medium.className,
                      )}
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
                      className={cn(
                        "text-sm text-[#361B17]/50 transition-colors hover:text-[#361B17]",
                        Magnetik_Regular.className,
                      )}
                    >
                      Cancel subscription
                    </button>
                  )}
                </>
              )
            )}
          </div>
        </section>
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
    </>
  );
}
