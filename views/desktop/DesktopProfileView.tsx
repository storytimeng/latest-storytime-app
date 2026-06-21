"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal, ModalContent } from "@heroui/modal";
import { Award, ChevronRight, Shield } from "lucide-react";
import {
  GenreButton,
  PremiumBanner,
  ProfileCard,
  CertificateModal,
  BadgesModal,
  ReadingModal,
  WritingModal,
  EditProfileModal,
  EditGenresModal,
  LeaderboardModal,
  BecomeAmbassadorModal,
  AmbassadorDeclinedModal,
} from "@/components/reusables/customUI";
import { cn } from "@/lib/utils";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { genreToCategorySlug } from "@/lib/genre";
import { DESKTOP_ROUTES } from "@/config/desktopRoutes";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { useUserAchievements } from "@/src/hooks/useUserAchievements";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";
import { useGenres } from "@/src/hooks/useGenres";
import { useAmbassadorOverview } from "@/src/hooks/useAmbassador";
import { getAmbassadorRoutes } from "@/lib/ambassadorRoutes";

type ProfileOption = {
  id: string;
  label: string;
  icon: string;
  type: "page" | "modal";
  path?: string;
};

function openProfileModal(
  router: ReturnType<typeof useRouter>,
  modalId: string,
) {
  router.push(`${DESKTOP_ROUTES.profile}?modal=${modalId}`, { scroll: false });
}

export function DesktopProfileView() {
  const router = useRouter();
  const ambassadorRoutes = getAmbassadorRoutes("desktop");
  const searchParams = useSearchParams();
  const isOnline = useOnlineStatus();
  const activeModal = searchParams.get("modal");
  const [lastActiveModal, setLastActiveModal] = useState<string | null>(null);
  const [ambassadorEntryPath, setAmbassadorEntryPath] = useState(
    ambassadorRoutes.hub,
  );

  const { user } = useUserProfile();
  const { badges, certificates } = useUserAchievements();
  const { genres: apiGenres } = useGenres();
  const { overview: ambassadorOverview, isLoading: ambassadorLoading } =
    useAmbassadorOverview();

  useEffect(() => {
    if (activeModal) {
      setLastActiveModal(activeModal);
    }
  }, [activeModal]);

  useEffect(() => {
    setAmbassadorEntryPath(
      ambassadorOverview?.isAmbassador
        ? ambassadorRoutes.entryPath
        : ambassadorRoutes.hub,
    );
  }, [ambassadorOverview?.isAmbassador, ambassadorRoutes]);

  const ambassadorApplication = ambassadorOverview?.application;

  const ambassadorOption: ProfileOption = ambassadorLoading
    ? {
        id: "ambassador-loading",
        label: "Ambassador",
        icon: "🌟",
        type: "page",
        path: ambassadorRoutes.hub,
      }
    : ambassadorOverview?.isAmbassador
      ? {
          id: "ambassador-dashboard",
          label: "Ambassador Dashboard",
          icon: "🌟",
          type: "page",
          path: ambassadorEntryPath,
        }
      : ambassadorApplication?.status === "pending"
        ? {
            id: "ambassador-status",
            label: "Application Status",
            icon: "⏳",
            type: "page",
            path: ambassadorRoutes.status,
          }
        : ambassadorApplication?.status === "declined"
          ? {
              id: "ambassador-declined",
              label: "Application Status",
              icon: "⏳",
              type: "modal",
            }
          : {
              id: "ambassador",
              label: "Become an Ambassador",
              icon: "🌟",
              type: "modal",
            };

  const profileOptions: ProfileOption[] = [
    {
      id: "stories",
      label: "My Stories",
      icon: "📚",
      type: "page",
      path: DESKTOP_ROUTES.write,
    },
    {
      id: "library",
      label: "My Library",
      icon: "📖",
      type: "page",
      path: DESKTOP_ROUTES.library,
    },
    {
      id: "drafts",
      label: "My Drafts",
      icon: "📝",
      type: "page",
      path: `${DESKTOP_ROUTES.myStories}?tab=drafts`,
    },
    {
      id: "downloads",
      label: "My Downloads",
      icon: "⬇️",
      type: "page",
      path: `${DESKTOP_ROUTES.library}?tab=downloads`,
    },
    { id: "reading", label: "Reading time", icon: "⏰", type: "modal" },
    { id: "writing", label: "Writing time", icon: "✍️", type: "modal" },
    { id: "leaderboard", label: "Leaderboard", icon: "🏅", type: "modal" },
    ambassadorOption,
    {
      id: "history",
      label: "Reading History",
      icon: "📜",
      type: "page",
      path: `${DESKTOP_ROUTES.library}?tab=History`,
    },
  ];

  const userGenres = user?.favoriteGenres || user?.genres || [];
  const genres = userGenres.length > 0 ? userGenres : apiGenres || [];

  const handleGenreClick = (genre: string) => {
    router.push(DESKTOP_ROUTES.category(genreToCategorySlug(genre)));
  };

  const handleOptionClick = (option: ProfileOption) => {
    if (option.type === "page" && option.path) {
      router.push(option.path);
      return;
    }
    openProfileModal(router, option.id);
  };

  const handleModalClose = () => {
    router.push(DESKTOP_ROUTES.profile, { scroll: false });
  };

  const renderModalContent = () => {
    const modalToRender = activeModal || lastActiveModal;
    if (!modalToRender) return null;

    switch (modalToRender) {
      case "certificate":
        return <CertificateModal />;
      case "badges":
        return <BadgesModal />;
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
      case "ambassador":
        return <BecomeAmbassadorModal />;
      case "ambassador-declined":
        return <AmbassadorDeclinedModal />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          <div className="bg-primary-colour px-6 py-5 text-white">
            <ProfileCard
              showSettings
              useLiveData
              hideEditButton={!isOnline}
              settingsHref={DESKTOP_ROUTES.settings}
              onEditProfile={() =>
                isOnline && openProfileModal(router, "edit-profile")
              }
              containerClassName="mt-0 bg-transparent px-0 pb-0"
            />
          </div>

          <div className="grid gap-4 border-t border-black/10 p-4 sm:grid-cols-2 md:p-6">
            <button
              type="button"
              onClick={() => openProfileModal(router, "badges")}
              className="flex items-center gap-4 rounded-xl border border-black/10 p-4 text-left transition-colors hover:bg-black/[0.02]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f8951d] text-white">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p
                  className={cn(
                    "text-sm text-[#361B17]",
                    Magnetik_Medium.className,
                  )}
                >
                  Badges
                </p>
                <p
                  className={cn(
                    "text-xs text-[#361B17]/60",
                    Magnetik_Regular.className,
                  )}
                >
                  {badges.length} earned
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => openProfileModal(router, "certificate")}
              className="flex items-center gap-4 rounded-xl border border-black/10 p-4 text-left transition-colors hover:bg-black/[0.02]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f8951d] text-white">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p
                  className={cn(
                    "text-sm text-[#361B17]",
                    Magnetik_Medium.className,
                  )}
                >
                  Certificates
                </p>
                <p
                  className={cn(
                    "text-xs text-[#361B17]/60",
                    Magnetik_Regular.className,
                  )}
                >
                  {certificates.length} earned
                </p>
              </div>
            </button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <section className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3
                className={cn(
                  "text-base text-[#361B17]",
                  Magnetik_Medium.className,
                )}
              >
                Favorite genres
              </h3>
              <button
                type="button"
                onClick={() =>
                  isOnline && openProfileModal(router, "edit-genres")
                }
                disabled={!isOnline}
                className={cn(
                  "text-sm text-primary-colour hover:underline",
                  !isOnline && "cursor-not-allowed opacity-50",
                )}
              >
                Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {genres.slice(0, 12).map((genre: string) => (
                <GenreButton
                  key={genre}
                  genre={genre}
                  isSelected={false}
                  onClick={() => handleGenreClick(genre)}
                />
              ))}
              {genres.length === 0 && (
                <p
                  className={cn(
                    "text-sm text-[#361B17]/60",
                    Magnetik_Regular.className,
                  )}
                >
                  No genres selected yet
                </p>
              )}
            </div>
            <Link
              href={DESKTOP_ROUTES.allGenres}
              className={cn(
                "mt-4 inline-block text-sm text-primary-colour hover:underline",
                Magnetik_Medium.className,
              )}
            >
              Browse all genres →
            </Link>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
            <h3
              className={cn(
                "mb-3 text-base text-[#361B17]",
                Magnetik_Medium.className,
              )}
            >
              Your account
            </h3>
            <div className="divide-y divide-black/5 rounded-xl border border-black/10">
              {profileOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-black/[0.02]"
                >
                  <span className="flex items-center gap-3">
                    <span aria-hidden>{option.icon}</span>
                    <span
                      className={cn(
                        "text-sm text-[#361B17]",
                        Magnetik_Regular.className,
                      )}
                    >
                      {option.label}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#361B17]/40" />
                </button>
              ))}
            </div>
          </section>
        </div>

        <PremiumBanner
          emoji="✨"
          title="Go Premium"
          subtitle="Unlock advanced voices, playback controls, and offline reading"
          link={DESKTOP_ROUTES.premium}
        />
      </div>

      <Modal
        isOpen={!!activeModal}
        onClose={handleModalClose}
        placement="center"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[85vh] max-w-lg",
          backdrop: "bg-black/50",
        }}
      >
        <ModalContent>{renderModalContent()}</ModalContent>
      </Modal>
    </>
  );
}
