"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Info, X } from "lucide-react";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { cn } from "@/lib";
import {
  Magnetik_Bold,
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import {
  formatJoinedAgo,
  getReferralActivityLabel,
  getReferralDisplayName,
  getReferralInitials,
  REFERRAL_FILTER_OPTIONS,
  type AmbassadorReferralItem,
  type ReferralFilter,
  type ReferralImpactStats,
} from "@/src/lib/referrals";
import {
  shareReferralViaFacebook,
  shareReferralViaTwitter,
  shareReferralViaWhatsApp,
  shareReferralLink,
} from "@/lib/share";

const HOW_REFERRALS_WORK_STEPS = [
  "Share your unique referral link with friends.",
  "When they sign up using your link, they become your referral.",
  "Earn points when your referrals publish stories and stay active.",
  "Track your progress toward rewards in your Ambassador Dashboard.",
  "Climb the leaderboard and unlock special perks.",
] as const;

interface ShareGrowHeaderProps {
  onInfoClick: () => void;
  backHref?: string;
}

export function ShareGrowHeader({
  onInfoClick,
  backHref = "/ambassador/dashboard",
}: ShareGrowHeaderProps) {
  return (
    <div className="bg-primary-colour text-white px-4 pt-5 pb-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href={backHref} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <button
            type="button"
            onClick={onInfoClick}
            className="w-8 h-8 rounded-full bg-complimentary-colour/20 flex items-center justify-center text-complimentary-colour"
            aria-label="How referrals work"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1">
          <h1 className={cn(Magnetik_Bold.className, "text-2xl leading-tight")}>
            Share & Grow
          </h1>
          <p
            className={cn(Magnetik_Regular.className, "text-sm text-white/85")}
          >
            Invite storytellers to join
          </p>
        </div>
      </div>
    </div>
  );
}

interface ReferralLinkCardProps {
  displaySharePath: string;
  shareUrl: string;
  referralCode: string;
  copied: boolean;
  onCopy: () => void;
}

export function ReferralLinkCard({
  displaySharePath,
  shareUrl,
  referralCode,
  copied,
  onCopy,
}: ReferralLinkCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-complimentary-colour/40 p-4 space-y-4 shadow-sm -mt-4 mx-4">
      <div className="space-y-1">
        <h2
          className={cn(
            Magnetik_SemiBold.className,
            "text-sm text-primary-colour",
          )}
        >
          Your Unique Referral Link
        </h2>
        <p className={cn(Magnetik_Regular.className, "text-xs text-grey-2")}>
          Share this link to invite new storytellers
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-grey-4 bg-accent-shade-1 px-3 py-2">
        <p
          className={cn(
            Magnetik_Medium.className,
            "flex-1 text-sm text-complimentary-colour truncate",
          )}
        >
          {displaySharePath}
        </p>
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            "shrink-0 h-9 px-4 rounded-full bg-complimentary-colour text-white text-xs",
            Magnetik_SemiBold.className,
          )}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="space-y-2">
        <p className={cn(Magnetik_Regular.className, "text-xs text-grey-2")}>
          Share via
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => shareReferralViaWhatsApp(shareUrl, referralCode)}
            className="w-11 h-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center text-lg"
            aria-label="Share on WhatsApp"
          >
            W
          </button>
          <button
            type="button"
            onClick={() => shareReferralViaFacebook(shareUrl)}
            className="w-11 h-11 rounded-xl bg-[#1877F2] text-white flex items-center justify-center text-lg font-bold"
            aria-label="Share on Facebook"
          >
            f
          </button>
          <button
            type="button"
            onClick={() => shareReferralViaTwitter(shareUrl)}
            className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center text-sm font-bold"
            aria-label="Share on X"
          >
            X
          </button>
          <button
            type="button"
            onClick={() => void shareReferralLink(shareUrl, referralCode)}
            className="w-11 h-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center text-lg"
            aria-label="Share link"
          >
            ↗
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReferralImpactCard({ stats }: { stats: ReferralImpactStats }) {
  return (
    <div className="mx-4 rounded-2xl bg-white border border-grey-5 shadow-sm p-5 text-center space-y-4">
      <h2
        className={cn(
          Magnetik_SemiBold.className,
          "text-sm text-primary-colour text-left",
        )}
      >
        Your Referral Impact
      </h2>

      <div className="space-y-1">
        <p
          className={cn(
            Magnetik_Bold.className,
            "text-4xl text-complimentary-colour",
          )}
        >
          {stats.totalPeopleReferred}
        </p>
        <p
          className={cn(
            Magnetik_SemiBold.className,
            "text-sm text-primary-colour",
          )}
        >
          Total People Referred
        </p>
        <p className={cn(Magnetik_Regular.className, "text-xs text-grey-2")}>
          {stats.activeThisMonth} active this month
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 pt-1 text-xs">
        <span className="text-[#34A853]">• {stats.newCount} New</span>
        <span className="text-complimentary-colour">
          • {stats.activeCount} Active
        </span>
        <span className="text-grey-3">• {stats.inactiveCount} Inactive</span>
      </div>
    </div>
  );
}

function ReferralStatusBadge({
  status,
}: {
  status: AmbassadorReferralItem["status"];
}) {
  const isActive = status === "active";
  const isPending = status === "pending";

  return (
    <span
      className={cn(
        "shrink-0 px-3 py-1 rounded-full text-[10px] capitalize",
        Magnetik_SemiBold.className,
        isActive && "bg-primary-colour text-white",
        isPending &&
          "bg-accent-shade-2 text-primary-colour border border-grey-4",
        !isActive &&
          !isPending &&
          "bg-accent-shade-2 text-complimentary-colour border border-complimentary-colour/30",
      )}
    >
      {status}
    </span>
  );
}

function ReferralRow({ referral }: { referral: AmbassadorReferralItem }) {
  const name = getReferralDisplayName(referral.user);

  return (
    <div className="rounded-2xl bg-white border border-grey-5 px-4 py-3 flex items-center gap-3 shadow-sm">
      <div className="w-11 h-11 rounded-full bg-accent-shade-2 overflow-hidden shrink-0 flex items-center justify-center">
        {referral.user?.avatar ? (
          <Image
            src={referral.user.avatar}
            alt={name}
            width={44}
            height={44}
            className="object-cover w-full h-full"
          />
        ) : (
          <span
            className={cn(
              Magnetik_SemiBold.className,
              "text-xs text-complimentary-colour",
            )}
          >
            {getReferralInitials(referral.user)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            Magnetik_SemiBold.className,
            "text-sm text-primary-colour truncate",
          )}
        >
          {name}
        </p>
        <p className={cn(Magnetik_Regular.className, "text-xs text-grey-2")}>
          {formatJoinedAgo(referral.signedUpAt)}
        </p>
        <p className={cn(Magnetik_Regular.className, "text-xs text-grey-3")}>
          {getReferralActivityLabel(referral.storiesPublished)}
        </p>
      </div>
      <ReferralStatusBadge status={referral.status} />
    </div>
  );
}

interface RecentReferralsSectionProps {
  referrals: AmbassadorReferralItem[];
  filter: ReferralFilter;
  onFilterChange: (filter: ReferralFilter) => void;
}

export function RecentReferralsSection({
  referrals,
  filter,
  onFilterChange,
}: RecentReferralsSectionProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const selectedLabel =
    REFERRAL_FILTER_OPTIONS.find((option) => option.value === filter)?.label ??
    "All";

  const visibleReferrals = showAll ? referrals : referrals.slice(0, 5);

  return (
    <div className="px-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2
          className={cn(
            Magnetik_SemiBold.className,
            "text-sm text-primary-colour",
          )}
        >
          Recent Referrals
        </h2>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={cn(
              "flex items-center gap-1 rounded-full border border-complimentary-colour/40 px-3 py-1 text-xs text-complimentary-colour",
              Magnetik_Medium.className,
            )}
          >
            {selectedLabel}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 z-10 min-w-[120px] rounded-xl border border-grey-5 bg-white shadow-lg py-1">
              {REFERRAL_FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onFilterChange(option.value);
                    setShowAll(false);
                    setMenuOpen(false);
                  }}
                  className={cn(
                    "block w-full text-left px-3 py-2 text-xs text-primary-colour hover:bg-accent-shade-1",
                    Magnetik_Regular.className,
                    filter === option.value && "text-complimentary-colour",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {referrals.length === 0 ? (
        <div className="rounded-2xl bg-white border border-grey-5 p-6 text-center text-sm text-grey-2">
          No referrals match this filter.
        </div>
      ) : (
        <div className="space-y-2">
          {visibleReferrals.map((referral) => (
            <ReferralRow key={referral.id} referral={referral} />
          ))}
        </div>
      )}

      {referrals.length > 5 && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className={cn(
            Magnetik_Medium.className,
            "text-sm text-complimentary-colour underline underline-offset-2",
          )}
        >
          View All Referrals
        </button>
      )}
    </div>
  );
}

export function ReferralEmptyState({ onShare }: { onShare: () => void }) {
  return (
    <div className="px-6 py-10 flex flex-col items-center text-center space-y-5">
      <span className="w-28 h-28 rounded-full bg-accent-shade-2 flex items-center justify-center text-5xl text-complimentary-colour/60">
        ◠
      </span>
      <div className="space-y-2">
        <h2
          className={cn(
            Magnetik_SemiBold.className,
            "text-lg text-primary-colour",
          )}
        >
          Start Your Referral Journey
        </h2>
        <p
          className={cn(
            Magnetik_Regular.className,
            "text-sm text-grey-2 leading-relaxed max-w-xs",
          )}
        >
          You haven&apos;t shared your referral link yet! Start inviting friends
          and fellow storytellers to join Storytime and earn rewards.
        </p>
      </div>
      <button
        type="button"
        onClick={onShare}
        className={cn(
          "w-full max-w-sm h-12 rounded-full bg-primary-colour text-white text-sm",
          Magnetik_SemiBold.className,
        )}
      >
        Share Your Link
      </button>
    </div>
  );
}

export function HowReferralsWorkModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="bottom"
      hideCloseButton
      classNames={{ base: "rounded-t-3xl max-w-md mx-auto" }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between px-4 pt-4 pb-2">
          <p
            className={cn(
              Magnetik_SemiBold.className,
              "text-base text-primary-colour",
            )}
          >
            How Referrals Work
          </p>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5 text-primary-colour" />
          </button>
        </ModalHeader>
        <ModalBody className="px-4 pb-6 space-y-4">
          <ol className="space-y-3">
            {HOW_REFERRALS_WORK_STEPS.map((step, index) => (
              <li
                key={step}
                className={cn(
                  Magnetik_Regular.className,
                  "text-sm text-primary-colour flex gap-3 leading-relaxed",
                )}
              >
                <span
                  className={cn(
                    Magnetik_SemiBold.className,
                    "w-6 h-6 shrink-0 rounded-md bg-complimentary-colour text-white text-xs flex items-center justify-center",
                  )}
                >
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "w-full h-11 rounded-full bg-primary-colour text-white text-sm",
              Magnetik_SemiBold.className,
            )}
          >
            Okay
          </button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
