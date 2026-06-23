"use client";

import React, { useMemo } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import useSWR from "swr";
import {
  PageHeader,
  ProfileCard,
  SecurityModal,
  FAQsModal,
  SupportModal,
  DeleteAccountModal,
  ClearCacheModal,
  LogoutModal,
  SubscriptionModal,
  SettingsList,
} from "@/components/reusables/customUI";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";
import { useModalNavigation } from "@/hooks/useModalNavigation";
import {
  SETTINGS_OPTIONS,
  SUBSCRIPTION_SETTING_OPTION,
} from "@/config/settings";
import { useSupportStore } from "@/src/stores/useSupportStore";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";
import { usePremiumFeatures } from "@/src/hooks/usePremiumFeatures";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { fetchPaymentHistory } from "@/src/lib/subscriptions";
import { showToast } from "@/lib/showNotification";

const SettingsView = () => {
  const { isOpen, activeModal, openModal, closeModal } = useModalNavigation();
  const openSupportModal = useSupportStore((state) => state.openModal);
  const isOnline = useOnlineStatus();
  const { isAuthenticated } = useAuthStore();
  const {
    isPremium,
    isSubscriptionCancelled,
    isLoading: premiumLoading,
  } = usePremiumFeatures();

  const isLoggedIn = isAuthenticated();

  const { data: paymentHistory } = useSWR(
    isLoggedIn ? "subscription-history" : null,
    fetchPaymentHistory,
    { revalidateOnFocus: false },
  );

  const hasPaymentHistory = (paymentHistory?.payments?.length ?? 0) > 0;

  const settingsOptions = useMemo(() => {
    const showSubscription =
      isLoggedIn &&
      !premiumLoading &&
      (isPremium || isSubscriptionCancelled || hasPaymentHistory);

    if (!showSubscription) {
      return SETTINGS_OPTIONS;
    }

    const options = [...SETTINGS_OPTIONS];
    const securityIndex = options.findIndex((opt) => opt.id === "security");
    const insertAt = securityIndex >= 0 ? securityIndex + 1 : 1;
    options.splice(insertAt, 0, SUBSCRIPTION_SETTING_OPTION);
    return options;
  }, [
    isLoggedIn,
    premiumLoading,
    isPremium,
    isSubscriptionCancelled,
    hasPaymentHistory,
  ]);

  const handleOptionClick = (id: string) => {
    if (id === "faqs") {
      openSupportModal("faqs");
    } else if (id === "terms-policy") {
      openSupportModal("terms");
    } else if (id === "support") {
      openSupportModal("support");
    } else {
      if (!isOnline && (id === "security" || id === "delete-account")) {
        showToast({
          type: "error",
          message: "This setting is unavailable while offline",
        });
        return;
      }
      openModal(id);
    }
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case "security":
        return <SecurityModal />;

      case "subscription":
        return <SubscriptionModal />;

      case "faqs":
        return <FAQsModal />;

      case "support":
        return <SupportModal />;

      case "delete-account":
        return <DeleteAccountModal onClose={closeModal} />;

      case "clear-cache":
        return <ClearCacheModal />;

      case "logout":
        return <LogoutModal onClose={closeModal} />;

      default:
        return (
          <>
            <ModalHeader>
              <h2 className={`text-xl ${Magnetik_Bold.className}`}>
                Coming Soon
              </h2>
            </ModalHeader>
            <ModalBody className="pb-6">
              <p className={`text-grey-3 ${Magnetik_Regular.className}`}>
                This feature is coming soon!
              </p>
            </ModalBody>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-accent-shade-1">
      <div className="px-4 pt-4 pb-6">
        <PageHeader
          title="Settings"
          backLink="/profile"
          titleClassName="text-lg font-medium text-primary-colour"
          backButtonClassName="text-primary-colour"
          showBackButton={true}
        />

        <div className="mt-6">
          <ProfileCard
            containerClassName="bg-transparent px-0 pb-0 mt-0"
            className="h-auto"
            textClassName="text-primary-colour"
            useLiveData={true}
          />
        </div>
      </div>

      <SettingsList
        options={settingsOptions}
        onOptionClick={handleOptionClick}
      />

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="m-0"
        classNames={{
          wrapper: "items-end",
          base: "m-0 max-h-[85vh]",
          backdrop: "bg-black/50",
        }}
      >
        <ModalContent>{renderModalContent()}</ModalContent>
      </Modal>
    </div>
  );
};

export default SettingsView;
