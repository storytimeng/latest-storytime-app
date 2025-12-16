"use client";

import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import {
  PageHeader,
  ProfileCard,
  SecurityModal,
  FAQsModal,
  SupportModal,
  DeleteAccountModal,
  ClearCacheModal,
  SettingsList,
} from "@/components/reusables/customUI";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";
import { useModalNavigation } from "@/hooks/useModalNavigation";
import { SETTINGS_OPTIONS } from "@/config/settings";

/**
 * SettingsView Component
 * Main settings page with profile card and settings options
 * Uses modal navigation via URL parameters for better UX
 */
const SettingsView = () => {
  const { isOpen, activeModal, openModal, closeModal } = useModalNavigation();

  const renderModalContent = () => {
    switch (activeModal) {
      case "security":
        return <SecurityModal />;

      case "faqs":
        return <FAQsModal />;

      case "support":
        return <SupportModal />;

      case "delete-account":
        return <DeleteAccountModal />;

      case "clear-cache":
        return <ClearCacheModal />;

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
      {/* Header */}
      <div className="px-4 pt-4 pb-6">
        <PageHeader
          title="Settings"
          backLink="/profile"
          titleClassName="text-lg font-medium text-primary-colour"
          backButtonClassName="text-primary-colour"
          showBackButton={true}
        />

        {/* Profile Section */}
        <div className="mt-6">
          <ProfileCard
            containerClassName="bg-transparent px-0 pb-0 mt-0"
            className="h-auto"
            textClassName="text-primary-colour"
            useLiveData={true}
          />
        </div>
      </div>

      {/* Settings Options */}
      <SettingsList options={SETTINGS_OPTIONS} onOptionClick={openModal} />

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="m-0"
        classNames={{
          wrapper: "items-end",
          base: "m-0 max-h-[80vh]",
          backdrop: "bg-black/50",
        }}
      >
        <ModalContent>{renderModalContent()}</ModalContent>
      </Modal>
    </div>
  );
};

export default SettingsView;
