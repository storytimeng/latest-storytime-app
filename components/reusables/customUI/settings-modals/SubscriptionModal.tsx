"use client";

import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import {
  Magnetik_Bold,
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import { Button } from "@/components/ui/button";
import { usePremiumFeatures } from "@/src/hooks/usePremiumFeatures";
import {
  fetchPaymentHistory,
  reactivateSubscription,
} from "@/src/lib/subscriptions";
import { showToast } from "@/lib/showNotification";
import CancelPremiumModal from "@/components/reusables/customUI/CancelPremiumModal";
import SubscriptionUpgradePanel from "@/components/reusables/customUI/SubscriptionUpgradePanel";
import { planDurationLabel } from "@/src/lib/subscription-ui";
import { useStorytimeShell } from "@/src/hooks/useStorytimeShell";
import { premiumPathForShell } from "@/lib/shellRouting";

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusLabel(status: string): string {
  switch (status) {
    case "success":
      return "Paid";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    case "abandoned":
      return "Abandoned";
    case "active":
      return "Active";
    case "cancelled":
      return "Cancelled";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "success":
    case "active":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-amber-100 text-amber-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-light-grey-2 text-primary-shade-4";
  }
}

const SubscriptionModal: React.FC = () => {
  const shell = useStorytimeShell();
  const premiumHref = premiumPathForShell(shell);
  const {
    isPremium,
    premiumExpiresAt,
    isSubscriptionCancelled,
    currentPlanCode,
    currentPlanName,
    refreshPremiumStatus,
  } = usePremiumFeatures();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const { data: historyData, isLoading: historyLoading } = useSWR(
    "subscription-history",
    fetchPaymentHistory,
    { revalidateOnFocus: false },
  );

  const payments = historyData?.payments ?? [];

  const handleReactivate = async () => {
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
      <ModalHeader className="flex flex-col gap-1 pb-2">
        <h2
          className={`text-xl text-primary-colour ${Magnetik_Bold.className}`}
        >
          Subscription
        </h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="flex flex-col gap-3">
          {isPremium ? (
            <div className="shrink-0 rounded-xl border border-light-grey-2 bg-universal-white p-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className={`text-xs text-primary-shade-4 uppercase tracking-wide ${Magnetik_Medium.className}`}
                  >
                    Storytime Premium
                  </p>
                  <p
                    className={`text-sm text-primary-colour mt-1 ${Magnetik_SemiBold.className}`}
                  >
                    {isSubscriptionCancelled
                      ? "Cancelled — access until expiry"
                      : currentPlanName
                        ? `${planDurationLabel(currentPlanCode ?? "")} plan`
                        : "Active membership"}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${statusBadgeClass(
                    isSubscriptionCancelled ? "cancelled" : "active",
                  )} ${Magnetik_Medium.className}`}
                >
                  {isSubscriptionCancelled ? "Cancelled" : "Active"}
                </span>
              </div>
              {premiumExpiresAt && (
                <p
                  className={`text-sm text-primary-shade-4 ${Magnetik_Regular.className}`}
                >
                  {isSubscriptionCancelled
                    ? `Access ends ${formatDate(premiumExpiresAt)}`
                    : `Access through ${formatDate(premiumExpiresAt)}`}
                </p>
              )}
            </div>
          ) : (
            <div className="shrink-0 rounded-xl border border-light-grey-2 bg-universal-white p-3">
              <p
                className={`text-sm text-primary-shade-4 ${Magnetik_Regular.className}`}
              >
                You do not have an active Premium subscription.
              </p>
            </div>
          )}

          <section className="flex min-h-0 flex-col">
            <h3
              className={`text-sm text-primary-colour mb-2 ${Magnetik_SemiBold.className}`}
            >
              Payment history
            </h3>
            <div className="min-h-[10.5rem] max-h-[13.5rem] overflow-y-auto rounded-xl border border-light-grey-2 bg-light-grey-1/40 p-2">
              {historyLoading ? (
                <div className="flex h-full min-h-[10.5rem] items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-colour" />
                </div>
              ) : payments.length === 0 ? (
                <p
                  className={`flex min-h-[10.5rem] items-center justify-center text-sm text-primary-shade-4 text-center px-4 ${Magnetik_Regular.className}`}
                >
                  No payments yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {payments.map((payment) => (
                    <li
                      key={payment.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-light-grey-2 bg-universal-white px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p
                          className={`text-sm text-primary-colour truncate ${Magnetik_Medium.className}`}
                        >
                          {payment.planName ?? "Premium plan"}
                        </p>
                        <p
                          className={`text-xs text-primary-shade-4 ${Magnetik_Regular.className}`}
                        >
                          {formatDate(payment.paidAt ?? payment.createdAt)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`text-sm text-primary-colour ${Magnetik_SemiBold.className}`}
                        >
                          {payment.formattedAmount}
                        </p>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${statusBadgeClass(payment.status)} ${Magnetik_Medium.className}`}
                        >
                          {statusLabel(payment.status)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {isPremium && (
            <section className="shrink-0 border-t border-light-grey-2 pt-3">
              <SubscriptionUpgradePanel
                variant="upgrade"
                layout="modal"
                currentPlanCode={currentPlanCode}
                showHeading
              />
            </section>
          )}

          <div className="flex shrink-0 flex-col gap-2 pt-1">
            {!isPremium && (
              <Button
                as={Link}
                href={premiumHref}
                variant="primary"
                className="w-full"
              >
                Get Premium
              </Button>
            )}

            {isPremium && isSubscriptionCancelled && (
              <Button
                variant="bordered"
                className="w-full border-complimentary-colour text-complimentary-colour"
                onPress={handleReactivate}
                isLoading={isReactivating}
                isDisabled={isReactivating}
              >
                Reactivate subscription
              </Button>
            )}

            {isPremium && !isSubscriptionCancelled && (
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className={`text-sm text-primary-shade-4 hover:text-primary-colour transition-colors text-center ${Magnetik_Regular.className}`}
              >
                Cancel subscription
              </button>
            )}
          </div>
        </div>
      </ModalBody>

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
};

export default SubscriptionModal;
