"use client";

import React, { useEffect, useState } from "react";
import { Modal, ModalContent, useDisclosure } from "@heroui/modal";

import { ChevronRight } from "lucide-react";
import {
  PageHeader,
  GenreButton,
  PremiumBanner,
  ProfileCard,
} from "@/components/reusables/customUI";
import {
  CertificateModal,
  BadgesModal,
  StoriesModal,
  LibraryModal,
  DraftsModal,
  DownloadsModal,
  ReadingModal,
  WritingModal,
  DefaultModal,
} from "@/components/reusables/customUI";
import { useRouter } from "next/navigation";
import { Shield, Award } from "lucide-react";
const ProfileView = () => {
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

  const profileOptions = [
    { id: "certificate", label: "Certificate", icon: "📜" },
    { id: "badges", label: "Badges", icon: "🏆" },
    { id: "stories", label: "My Stories", icon: "📚" },
    { id: "library", label: "My Library", icon: "📖" },
    { id: "drafts", label: "My Drafts", icon: "📝" },
    { id: "downloads", label: "My Downloads", icon: "⬇️" },
    { id: "reading", label: "Reading time", icon: "⏰" },
    { id: "writing", label: "Writing time", icon: "✍️" },
  ];

  const genres = [
    "Action",
    "Adventure",
    "Anthology",
    "Biography",
    "Classic",
    "Comedy",
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
      case "certificate":
        return <CertificateModal />;
      case "badges":
        return <BadgesModal />;
      case "stories":
        return <StoriesModal />;
      case "library":
        return <LibraryModal />;
      case "drafts":
        return <DraftsModal />;
      case "downloads":
        return <DownloadsModal />;
      case "reading":
        return <ReadingModal />;
      case "writing":
        return <WritingModal />;
      default:
        const option = profileOptions.find((opt) => opt.id === activeModal);
        return (
          <DefaultModal
            title={option?.label || "Details"}
            icon={option?.icon || "📱"}
          />
        );
    }
  };

  return (
    <>
      <div className="min-h-screen bg-primary-colour">
        {/* Header */}
        <div className="px-4 pt-4 pb-6 text-white bg-primary-colour">
          <PageHeader
            title="Profile"
            backLink="/"
            titleClassName="text-lg font-medium text-white"
            backButtonClassName="text-white"
            showBackButton={true}
          />

          {/* Profile Section */}
          <ProfileCard showSettings={true} />

          {/* Badge/Certificate Card - Bleeding into next section */}
          <div className="relative z-20 -mb-16">
            <div className="bg-white rounded-lg p-[10px] shadow-lg">
              <div className="flex">
                <div className="flex-1 text-center my-[4px]">
                  <h3 className="mb-2 text-sm font-magnetik-medium text-primary-colour">
                    Badge
                  </h3>
                  <div className="w-8 h-8 bg-[#f8951d] rounded-lg flex items-center justify-center mx-auto">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="w-px mx-4 bg-primary-shade-1"></div>
                <div className="flex-1 text-center my-[4px]">
                  <h3 className="mb-2 text-sm font-magnetik-medium text-primary-colour">
                    Certificate
                  </h3>
                  <div className="w-8 h-8 bg-[#f8951d] rounded-lg flex items-center justify-center mx-auto">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section - Background visible behind bleeding card */}
        <div className="min-h-screen bg-accent-shade-1">
          <div className="px-4 pt-20">
            {/* Added top padding to accommodate bleeding card */}
            {/* Genre Section */}
            <div className="pb-10">
              <h3
                className={`body-text-medium-small-auto text-primary-colour mb-2 `}
              >
                Genre
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {genres.map((genre) => (
                  <GenreButton
                    key={genre}
                    genre={genre}
                    isSelected={false}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </div>

            {/* Profile Options */}
            <div className="space-y-[1px] mb-[34px] bg-primary-shade-1">
              {profileOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  className="flex items-center justify-between px-4 py-4 transition-colors bg-white cursor-pointer hover:bg-grey-5"
                >
                  <span
                    className={`text-primary-colour body-text-small-regular-auto`}
                  >
                    {option.label}
                  </span>
                  <ChevronRight size={16} className="text-grey-3" />
                </div>
              ))}
            </div>

            {/* Premium Banner */}
            <PremiumBanner emoji="🎯" className="" />
          </div>
        </div>
      </div>

      {/* Bottom Sheet Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
        className="m-0"
        classNames={{
          wrapper: "items-end",
          base: "m-0  max-h-[80vh]",
          backdrop: "bg-black/50",
        }}
      >
        <ModalContent>{renderModalContent()}</ModalContent>
      </Modal>
    </>
  );
};

export default ProfileView;
