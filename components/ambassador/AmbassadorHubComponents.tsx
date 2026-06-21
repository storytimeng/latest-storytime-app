"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  FileText,
  Link2,
  Shield,
  Star,
  Trophy,
  X,
} from "lucide-react";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { cn } from "@/lib";
import {
  Magnetik_Bold,
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import type { MonthlyGoal } from "@/src/lib/ambassador-dashboard";
import { useAmbassadorRoutes } from "@/components/ambassador/AmbassadorRoutesProvider";

interface AmbassadorHubHeaderProps {
  displayName: string;
  avatarUrl: string;
  levelLabel: string;
  backHref?: string;
}

export function AmbassadorHubHeader({
  displayName,
  avatarUrl,
  levelLabel,
  backHref = "/profile",
}: AmbassadorHubHeaderProps) {
  return (
    <div className="bg-primary-colour text-white px-4 pt-5 pb-6">
      <div className="max-w-md mx-auto">
        <div className="relative flex items-center justify-center mb-5">
          <Link href={backHref} className="absolute left-0 text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className={cn(Magnetik_Medium.className, "text-lg")}>
            Ambassador Hub
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/20 shrink-0">
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={cn(Magnetik_SemiBold.className, "text-base truncate")}
            >
              Welcome back, {displayName}!
            </p>
            <p
              className={cn(
                Magnetik_Regular.className,
                "text-xs text-white/80 mt-0.5",
              )}
            >
              {levelLabel}
            </p>
          </div>
          <span className="w-10 h-10 rounded-full bg-complimentary-colour/20 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-complimentary-colour fill-complimentary-colour/30" />
          </span>
        </div>
      </div>
    </div>
  );
}

function CircularProgress({ percent }: { percent: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const ringColor =
    percent >= 100 ? "#34A853" : percent > 0 ? "#34A853" : "#D9D9D9";
  const accentColor = percent >= 100 ? "#34A853" : "#E53935";

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg width="144" height="144" viewBox="0 0 144 144" className="mx-auto">
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke="#EBEBEB"
          strokeWidth="10"
        />
        {percent > 0 && (
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 72 72)"
          />
        )}
        {percent === 0 && <circle cx="72" cy="12" r="6" fill={accentColor} />}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <p
          className={cn(
            Magnetik_Bold.className,
            "text-2xl text-primary-colour",
          )}
        >
          {percent}%
        </p>
        <p className={cn(Magnetik_Regular.className, "text-xs text-grey-2")}>
          Monthly Goal
        </p>
      </div>
    </div>
  );
}

interface MonthlyProgressCardProps {
  monthLabel: string;
  daysRemaining: number;
  goals: MonthlyGoal[];
  progressPercent: number;
  onAction: () => void;
}

export function MonthlyProgressCard({
  monthLabel,
  daysRemaining,
  goals,
  progressPercent,
  onAction,
}: MonthlyProgressCardProps) {
  const allComplete = progressPercent >= 100;

  return (
    <div className="rounded-2xl bg-white border border-grey-5 shadow-sm p-4 -mt-4 mx-4 space-y-4">
      <div className="flex items-center justify-between">
        <p
          className={cn(
            Magnetik_SemiBold.className,
            "text-sm text-primary-colour",
          )}
        >
          {monthLabel} Progress
        </p>
        <p className={cn(Magnetik_Regular.className, "text-xs text-grey-2")}>
          {daysRemaining} days left
        </p>
      </div>

      <CircularProgress percent={progressPercent} />

      <div className="space-y-2">
        <p
          className={cn(
            Magnetik_SemiBold.className,
            "text-sm text-primary-colour",
          )}
        >
          This Month&apos;s Goals
        </p>
        {goals.map((goal) => (
          <label
            key={goal.id}
            className="flex items-center gap-2 text-sm text-primary-colour"
          >
            <span
              className={cn(
                "w-5 h-5 rounded border flex items-center justify-center shrink-0",
                goal.completed
                  ? "bg-[#34A853] border-[#34A853]"
                  : "border-grey-3 bg-white",
              )}
            >
              {goal.completed && <Check className="w-3.5 h-3.5 text-white" />}
            </span>
            <span
              className={cn(
                Magnetik_Regular.className,
                goal.completed && "line-through text-grey-2",
              )}
            >
              {goal.label}
            </span>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={onAction}
        disabled={allComplete}
        className={cn(
          "w-full h-11 rounded-full text-sm",
          Magnetik_SemiBold.className,
          allComplete
            ? "bg-primary-colour text-white"
            : "border-2 border-complimentary-colour text-complimentary-colour bg-white",
        )}
      >
        {allComplete ? "Task Completed" : "Complete remaining tasks"}
      </button>
    </div>
  );
}

interface ImpactStat {
  value: number;
  label: string;
  trend: string;
  positive: boolean;
}

export function ImpactStatsGrid({ stats }: { stats: ImpactStat[] }) {
  return (
    <div className="px-4 space-y-3">
      <h2
        className={cn(
          Magnetik_SemiBold.className,
          "text-sm text-primary-colour",
        )}
      >
        Your Impact
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white border border-grey-5 p-4 shadow-sm"
          >
            <p
              className={cn(
                Magnetik_Bold.className,
                "text-2xl text-complimentary-colour",
              )}
            >
              {stat.value}
            </p>
            <p
              className={cn(
                Magnetik_Regular.className,
                "text-xs text-primary-colour mt-1",
              )}
            >
              {stat.label}
            </p>
            <p
              className={cn(
                Magnetik_Regular.className,
                "text-[10px] mt-1",
                stat.positive ? "text-[#34A853]" : "text-red",
              )}
            >
              {stat.trend}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  {
    icon: Link2,
    title: "Share Your Link",
    subtitle: "Invite new storytellers",
  },
  {
    icon: FileText,
    title: "Monthly Report",
    subtitle: "Submit your monthly impact",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    subtitle: "See top ambassadors",
  },
  {
    icon: Star,
    title: "View Score Breakdown",
    subtitle: "Understand your points",
  },
] as const;

export function QuickActionsList() {
  const routes = useAmbassadorRoutes();
  const hrefs = [
    routes.share,
    routes.report,
    routes.leaderboard,
    routes.breakdown,
  ] as const;

  return (
    <div className="px-4 space-y-3">
      <h2
        className={cn(
          Magnetik_SemiBold.className,
          "text-sm text-primary-colour",
        )}
      >
        Quick Actions
      </h2>
      <div className="space-y-2">
        {QUICK_ACTIONS.map((action, index) => {
          const Icon = action.icon;
          const href = hrefs[index];
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-2xl bg-white border border-grey-5 px-4 py-3 shadow-sm"
            >
              <span className="w-10 h-10 rounded-xl bg-accent-shade-2 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-complimentary-colour" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    Magnetik_SemiBold.className,
                    "text-sm text-primary-colour",
                  )}
                >
                  {action.title}
                </p>
                <p
                  className={cn(
                    Magnetik_Regular.className,
                    "text-xs text-grey-2 mt-0.5",
                  )}
                >
                  {action.subtitle}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-grey-3 shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

interface MilestoneCardProps {
  onDownload: () => void;
}

export function MilestoneCard({ onDownload }: MilestoneCardProps) {
  return (
    <div className="mx-4 rounded-2xl bg-accent-shade-2 border border-complimentary-colour/30 p-5 text-center space-y-3">
      <span className="text-5xl leading-none" aria-hidden>
        🎓
      </span>
      <h3
        className={cn(
          Magnetik_SemiBold.className,
          "text-base text-primary-colour",
        )}
      >
        6 Months as Ambassador!
      </h3>
      <p
        className={cn(
          Magnetik_Regular.className,
          "text-sm text-grey-2 leading-relaxed",
        )}
      >
        Congratulations on your dedication! Download your certificate or
        continue for another term.
      </p>
      <button
        type="button"
        onClick={onDownload}
        className={cn(
          "w-full h-11 rounded-full bg-complimentary-colour text-white text-sm",
          Magnetik_SemiBold.className,
        )}
      >
        Download Certificate
      </button>
    </div>
  );
}

interface AmbassadorCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  obtainedDate: string;
  title?: string;
  onDone?: () => void;
}

export function AmbassadorCertificateModal({
  isOpen,
  onClose,
  recipientName,
  obtainedDate,
  title = "Certificate 1",
  onDone,
}: AmbassadorCertificateModalProps) {
  const handleDone = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
    onDone?.();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="bottom"
      hideCloseButton
      classNames={{
        base: "rounded-t-3xl max-w-md mx-auto",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between px-4 pt-4 pb-2">
          <button type="button" onClick={onClose} aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-primary-colour" />
          </button>
          <p
            className={cn(
              Magnetik_SemiBold.className,
              "text-sm text-primary-colour",
            )}
          >
            {title}
          </p>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5 text-primary-colour" />
          </button>
        </ModalHeader>
        <ModalBody className="px-4 pb-6 space-y-4">
          <div className="rounded-xl border-4 border-amber-900/80 bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 p-4 aspect-[4/3] relative overflow-hidden">
            <div className="flex justify-between items-start">
              <p
                className={cn(
                  Magnetik_Bold.className,
                  "text-sm text-amber-900",
                )}
              >
                Storytime
              </p>
              <p className="text-[10px] text-amber-900 text-center leading-tight">
                CERTIFICATE
                <br />
                OF AMBASSADORSHIP
              </p>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <span className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-4 border-amber-800 flex items-center justify-center mb-3">
                <Shield className="w-8 h-8 text-white" />
              </span>
              <p className="text-[10px] uppercase tracking-wide text-amber-900/80">
                This certifies that
              </p>
              <p
                className={cn(
                  Magnetik_Bold.className,
                  "text-sm text-amber-950 uppercase mt-1",
                )}
              >
                {recipientName}
              </p>
              <p className="text-[9px] text-amber-900/70 mt-2 leading-relaxed max-w-xs">
                has demonstrated dedication, expertise, and commitment as a
                Storytime Ambassador for six months.
              </p>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p
              className={cn(
                Magnetik_Medium.className,
                "text-sm text-primary-colour",
              )}
            >
              {title}
            </p>
            <p className="inline-block rounded-full bg-grey-5 px-4 py-1.5 text-xs text-grey-2">
              Obtained on {obtainedDate}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "flex-1 h-11 rounded-full border border-primary-colour text-primary-colour bg-white text-sm",
                Magnetik_Medium.className,
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDone}
              className={cn(
                "flex-1 h-11 rounded-full bg-primary-colour text-white text-sm",
                Magnetik_Medium.className,
              )}
            >
              Save / Print
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: () => void;
}

export function AmbassadorCelebrationModal({
  isOpen,
  onClose,
  onViewDetails,
}: CelebrationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      hideCloseButton
      classNames={{ base: "rounded-2xl max-w-sm mx-4" }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between px-4 pt-4">
          <p
            className={cn(
              Magnetik_SemiBold.className,
              "text-sm text-primary-colour",
            )}
          >
            Celebrating 6 months Dedications
          </p>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5 text-primary-colour" />
          </button>
        </ModalHeader>
        <ModalBody className="px-4 pb-6 text-center space-y-3">
          <div className="rounded-xl border-4 border-amber-900/60 bg-gradient-to-br from-amber-50 to-amber-100 aspect-[3/2] flex items-center justify-center">
            <Shield className="w-12 h-12 text-amber-700" />
          </div>
          <p
            className={cn(
              Magnetik_Bold.className,
              "text-2xl text-complimentary-colour",
            )}
          >
            Congrats
          </p>
          <p className={cn(Magnetik_Regular.className, "text-sm text-grey-2")}>
            You&apos;ve earned the &apos;6 months Dedications&apos; certificate
          </p>
          <button
            type="button"
            onClick={onViewDetails}
            className={cn(
              Magnetik_Medium.className,
              "text-sm text-primary-colour underline underline-offset-2",
            )}
          >
            View Details
          </button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
