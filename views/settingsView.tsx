"use client";

import React, { useEffect, useState } from "react";
import {
  Switch,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/react";
import {
  ChevronRight,
  Bell,
  Shield,
  Key,
  HelpCircle,
  Phone,
  Trash2,
  LogOut,
} from "lucide-react";
import {
  PageHeader,
  ProfileCard,
  SecurityModal,
  FAQsModal,
  SupportModal,
  DeleteAccountModal,
} from "@/components/reusables/customUI";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SettingsView = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Get search params from window.location (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setActiveModal(params.get("modal"));
    }
  }, []);

  const settingsOptions = [
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell size={20} />,
      hasToggle: true,
      isEnabled: true,
    },
    {
      id: "security",
      label: "Security",
      icon: <Shield size={20} />,
      hasToggle: false,
      // No route, so modal is default
    },
    {
      id: "change-password",
      label: "Change password",
      icon: <Key size={20} />,
      hasToggle: false,
      route: "/app/settings/change-password", // This navigates to a page
    },
    {
      id: "faqs",
      label: "FAQs",
      icon: <HelpCircle size={20} />,
      hasToggle: false,
      // No route, so modal is default
    },
    {
      id: "terms-policy",
      label: "Terms & Policy",
      icon: <Phone size={20} />,
      hasToggle: false,
      route: "/app/settings/terms-policy", // This navigates to a page
    },
    {
      id: "support",
      label: "Support",
      icon: <Phone size={20} />,
      hasToggle: false,
      // No route, so modal is default
    },
    {
      id: "delete-account",
      label: "Delete Account",
      icon: <Trash2 size={20} />,
      hasToggle: false,
      // No route, so modal is default
      isDanger: true,
    },
    {
      id: "logout",
      label: "Log Out",
      icon: <LogOut size={20} />,
      hasToggle: false,
      route: "/auth/login", // This navigates to a page
      isDanger: true,
    },
  ];

  // Handle modal state based on URL params
  useEffect(() => {
    if (activeModal) {
      onOpen();
    } else {
      onClose();
    }
  }, [activeModal, onOpen, onClose]);

  // Listen for URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        setActiveModal(params.get("modal"));
      }
    };

    // Listen for popstate (browser back/forward)
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  const handleOptionClick = (optionId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("modal", optionId);
    router.push(`?${params.toString()}`);
    setActiveModal(optionId);
  };

  const handleModalClose = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("modal");
    router.push(`?${params.toString()}`);
    setActiveModal(null);
  };

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
      <div className=" px-4 pt-4 pb-6">
        <PageHeader
          title="Settings"
          backLink="/app/profile"
          titleClassName="text-lg font-medium text-grey-1"
          backButtonClassName="text-grey-1"
          showBackButton={true}
        />

        {/* Profile Section */}
        <div className="mt-6">
          <ProfileCard
            containerClassName="bg-transparent px-0 pb-0 mt-0"
            className="h-auto"
            textClassName="text-primary-colour"
          />
        </div>
      </div>

      {/* Settings Options */}
      <div className="px-4 pt-6">
        <div className=" rounded-lg overflow-hidden">
          {settingsOptions.map((option, index) => (
            <div key={option.id}>
              {option.hasToggle ? (
                // Notification toggle option
                <div className="flex items-center justify-between py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="text-primary-colour">{option.icon}</div>
                    <span
                      className={`text-primary-colour ${Magnetik_Regular.className}`}
                    >
                      {option.label}
                    </span>
                  </div>
                  <Switch
                    defaultSelected={option.isEnabled}
                    color="warning"
                    size="sm"
                  />
                </div>
              ) : option.route ? (
                // Navigation option - has route so navigate to page
                <Link href={option.route}>
                  <div className="flex items-center justify-between py-4 px-4 cursor-pointer hover:bg-light-grey-1 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className={`${
                          option.isDanger
                            ? "text-red-500"
                            : "text-primary-colour"
                        }`}
                      >
                        {option.icon}
                      </div>
                      <span
                        className={`${
                          option.isDanger
                            ? "text-red-500"
                            : "text-primary-colour"
                        } ${Magnetik_Regular.className}`}
                      >
                        {option.label}
                      </span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`${
                        option.isDanger ? "text-red-500" : "text-primary-colour"
                      }`}
                    />
                  </div>
                </Link>
              ) : (
                // Modal option - no route so open modal via URL params
                <div
                  onClick={() => handleOptionClick(option.id)}
                  className="flex items-center justify-between py-4 px-4 cursor-pointer hover:bg-light-grey-1 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`${
                        option.isDanger ? "text-red" : "text-primary-colour"
                      }`}
                    >
                      {option.icon}
                    </div>
                    <span
                      className={`${
                        option.isDanger ? "text-red" : "text-primary-colour"
                      } ${Magnetik_Regular.className}`}
                    >
                      {option.label}
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`${
                      option.isDanger ? "text-red" : "text-grey-2"
                    }`}
                  />
                </div>
              )}

              {/* Divider - not for last item */}
              {index < settingsOptions.length - 1 && (
                <div className="h-px bg-light-grey-2 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
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
