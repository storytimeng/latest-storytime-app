"use client";

import React, { useEffect, useState } from "react";
import { Modal, ModalContent } from "@heroui/modal";

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
  EditProfileModal,
  EditGenresModal,
  LeaderboardModal,
  DefaultModal,
} from "@/components/reusables/customUI";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Award } from "lucide-react";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { useUserAchievements } from "@/src/hooks/useUserAchievements";
import { useApiUserStats } from "@/src/hooks/useApiUserStats";

const ProfileView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeModal = searchParams.get("modal");
  
  // Keep track of the last active modal to preserve content during exit animation
  const [lastActiveModal, setLastActiveModal] = useState<string | null>(null);

  useEffect(() => {
    if (activeModal) {
      setLastActiveModal(activeModal);
    }
  }, [activeModal]);
  
  // Fetch user data
  const { user } = useUserProfile();
  const { badges, certificates } = useUserAchievements();
  const { stats } = useApiUserStats();

  const profileOptions = [
    { id: "certificate", label: "Certificate", icon: "📜", type: "modal" },
    { id: "badges", label: "Badges", icon: "🏆", type: "modal" },
    { id: "stories", label: "My Stories", icon: "📚", type: "page", path: "/pen" },
    { id: "library", label: "My Library", icon: "📖", type: "page", path: "/library" },
    { id: "drafts", label: "My Drafts", icon: "📝", type: "page", path: "/pen?tab=drafts" },
    { id: "downloads", label: "My Downloads", icon: "⬇️", type: "page", path: "/downloads" },
    { id: "reading", label: "Reading time", icon: "⏰", type: "modal" },
    { id: "writing", label: "Writing time", icon: "✍️", type: "modal" },
    { id: "leaderboard", label: "Leaderboard", icon: "🏅", type: "modal" },
    { id: "history", label: "Reading History", icon: "📜", type: "page", path: "/library?tab=History" },
  ];

  // Use user's favorite genres from profile, fallback to defaults
  const userGenres = user?.favoriteGenres || user?.genres || [];
  const defaultGenres = ["Action", "Adventure", "Anthology", "Biography", "Classic", "Comedy"];
  const genres = userGenres.length > 0 ? userGenres : defaultGenres;

  // Handle genre click - navigate to category page
  const handleGenreClick = (genre: string) => {
    router.push(`/category?genre=${encodeURIComponent(genre)}`);
  };

  const handleOptionClick = (option: typeof profileOptions[0]) => {
    if (option.type === "page" && option.path) {
      // Navigate to dedicated page
      router.push(option.path);
    } else if (option.type === "modal") {
      // Open modal via URL
      const params = new URLSearchParams(searchParams.toString());
      params.set("modal", option.id);
      router.push(`?${params.toString()}`, { scroll: false });
    }
  };

  const handleModalClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const renderModalContent = () => {
    // Use activeModal if present, otherwise use lastActiveModal (for exit animation)
    const modalToRender = activeModal || lastActiveModal;
    if (!modalToRender) return null;

    switch (modalToRender) {
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
      case "edit-profile":
        return <EditProfileModal />;
      case "edit-genres":
        return <EditGenresModal />;
      case "leaderboard":
        return <LeaderboardModal />;
      default:
        const option = profileOptions.find((opt) => opt.id === modalToRender);
        if (!option) return null;
        
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
            backLink="/home"
            titleClassName="text-lg font-medium text-white"
            backButtonClassName="text-white"
            showBackButton={true}
          />

          {/* Profile Section */}
          <ProfileCard showSettings={true} useLiveData={true} />

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
                  <p className="text-xs text-grey-3 mt-1">{badges.length || 0}</p>
                </div>
                <div className="w-px mx-4 bg-primary-shade-1"></div>
                <div className="flex-1 text-center my-[4px]">
                  <h3 className="mb-2 text-sm font-magnetik-medium text-primary-colour">
                    Certificate
                  </h3>
                  <div className="w-8 h-8 bg-[#f8951d] rounded-lg flex items-center justify-center mx-auto">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs text-grey-3 mt-1">{certificates.length || 0}</p>
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
              <div className="flex items-center justify-between mb-2">
                <h3
                  className={`body-text-medium-small-auto text-primary-colour`}
                >
                  Genre
                </h3>
                <button 
                  onClick={() => router.push("?modal=edit-genres", { scroll: false })}
                  className="text-primary-colour p-1"
                >
                  <span className="text-xl">✎</span>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {genres.slice(0, 6).map((genre) => (
                  <GenreButton
                    key={genre}
                    genre={genre}
                    isSelected={false}
                    onClick={() => handleGenreClick(genre)}
                  />
                ))}
              </div>
            </div>

            {/* Profile Options */}
            <div className="space-y-[1px] mb-[34px] bg-primary-shade-1">
              {profileOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
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
        isOpen={!!activeModal}
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
