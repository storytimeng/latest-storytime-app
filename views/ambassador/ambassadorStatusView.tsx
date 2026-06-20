"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  Check,
  FileText,
  HelpCircle,
  Loader2,
  Pencil,
  Users,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib";
import {
  Magnetik_Bold,
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import { AmbassadorHeader } from "@/components/ambassador/AmbassadorHeader";
import { PrimaryFormButton } from "@/components/ambassador/application-form-ui";
import { useAmbassadorOverview } from "@/src/hooks/useAmbassador";
import {
  formatAmbassadorTypeLabel,
  formatApplicationDate,
  formatApplicationDateShort,
  getDecisionCountdown,
  withdrawAmbassadorApplication,
  getAmbassadorEntryPath,
  type AmbassadorApplication,
  type ApplicationStatus,
} from "@/src/lib/ambassadors";
import { showToast } from "@/lib/showNotification";
import { useSupportStore } from "@/src/stores/useSupportStore";
import { mutate } from "swr";

const WAITING_TIPS = [
  {
    title: "Read Popular Stories",
    description: "Discover trending stories and engage with the community",
    icon: BookOpen,
    href: "/home",
  },
  {
    title: "Join Community Discussions",
    description: "Connect with other readers and writers on Storytime",
    icon: Users,
    href: "/home",
  },
  {
    title: "Review Ambassador Guidelines",
    description: "Familiarize yourself with ambassador responsibilities",
    icon: FileText,
    href: "/ambassador",
  },
  {
    title: "Start Writing Your Own Story",
    description: "Share your creativity and build your portfolio",
    icon: Pencil,
    href: "/pen",
  },
] as const;

type JourneyStepState = "completed" | "current" | "upcoming" | "declined";

interface JourneyStep {
  title: string;
  description: string;
  dateLabel?: string;
  state: JourneyStepState;
}

function buildJourneySteps(
  application: AmbassadorApplication,
  status: ApplicationStatus,
): JourneyStep[] {
  const submittedDate = formatApplicationDateShort(application.createdAt);
  const decisionDate = formatApplicationDateShort(application.reviewDeadline);

  if (status === "declined") {
    const reviewedDate = application.reviewedAt
      ? formatApplicationDateShort(application.reviewedAt)
      : undefined;

    return [
      {
        title: "Application Submitted",
        description: submittedDate,
        state: "completed",
      },
      {
        title: "Under Review",
        description: "Completed",
        state: "completed",
      },
      {
        title: "Decision Notification",
        description: application.declineReason || "Application not approved",
        dateLabel: reviewedDate,
        state: "declined",
      },
      {
        title: "Ambassador Onboarding",
        description: "Upon approval",
        state: "upcoming",
      },
    ];
  }

  return [
    {
      title: "Application Submitted",
      description: submittedDate,
      state: "completed",
    },
    {
      title: "Under Review",
      description: "In progress",
      state: "current",
    },
    {
      title: "Decision Notification",
      description: `By ${decisionDate}`,
      state: "upcoming",
    },
    {
      title: "Ambassador Onboarding",
      description: "Upon approval",
      state: "upcoming",
    },
  ];
}

function JourneyIcon({ state }: { state: JourneyStepState }) {
  if (state === "completed") {
    return (
      <span className="w-6 h-6 rounded-md bg-complimentary-colour flex items-center justify-center shrink-0">
        <Check className="w-4 h-4 text-white" strokeWidth={3} />
      </span>
    );
  }

  if (state === "current") {
    return (
      <span className="w-6 h-6 rounded-md border-2 border-complimentary-colour shrink-0" />
    );
  }

  if (state === "declined") {
    return (
      <span className="w-6 h-6 rounded-md bg-red flex items-center justify-center shrink-0">
        <XCircle className="w-4 h-4 text-white" />
      </span>
    );
  }

  return (
    <span className="w-6 h-6 rounded-md border-2 border-dashed border-grey-4 shrink-0" />
  );
}

function downloadApplicationCopy(application: AmbassadorApplication) {
  const lines = [
    "Storytime Ambassador Application",
    "================================",
    `Application ID: #${application.applicationReference}`,
    `Status: ${application.status}`,
    `Submitted: ${formatApplicationDate(application.createdAt)}`,
    `Ambassador Role: ${formatAmbassadorTypeLabel(application.type)}`,
    `Location: ${application.city}, ${application.country}`,
    application.institution ? `Institution: ${application.institution}` : null,
    `Decision expected by: ${formatApplicationDate(application.reviewDeadline)}`,
  ].filter(Boolean);

  const blob = new Blob([lines.join("\n")], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${application.applicationReference}-application.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AmbassadorStatusView() {
  const router = useRouter();
  const openSupportModal = useSupportStore((state) => state.openModal);
  const { overview, isLoading } = useAmbassadorOverview();
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (!isLoading && overview?.isAmbassador) {
      router.replace("/ambassador/dashboard");
      return;
    }
    if (!isLoading && !overview?.application) {
      router.replace("/ambassador");
      return;
    }
    if (!isLoading && overview?.application?.status === "accepted") {
      router.replace(getAmbassadorEntryPath());
      return;
    }
    if (!isLoading && overview?.application?.status === "declined") {
      router.replace("/ambassador/declined");
    }
  }, [isLoading, overview, router]);

  const handleWithdraw = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to withdraw your ambassador application? You can submit a new application later.",
    );
    if (!confirmed) return;

    setWithdrawing(true);
    try {
      await withdrawAmbassadorApplication();
      await mutate("ambassador-overview");
      showToast({
        type: "success",
        message: "Your application has been withdrawn.",
      });
      router.push("/profile");
    } catch (err) {
      showToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to withdraw application",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-colour" />
      </div>
    );
  }

  const application = overview?.application;

  if (!application) {
    return null;
  }

  const journeySteps = buildJourneySteps(application, "pending");
  const countdown = getDecisionCountdown(application.reviewDeadline);

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto pb-10">
      <AmbassadorHeader
        title="Application Status"
        subtitle="Track your ambassador application progress"
        backHref="/profile"
      />

      <div className="px-4 py-5 space-y-5">
        <div className="rounded-2xl border border-complimentary-colour/40 bg-accent-shade-2 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-lg bg-complimentary-colour flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </span>
            <div>
              <h2
                className={cn(
                  Magnetik_SemiBold.className,
                  "text-base text-primary-colour",
                )}
              >
                Application Under Review
              </h2>
              <p
                className={cn(
                  Magnetik_Regular.className,
                  "text-sm text-grey-2 mt-1 leading-relaxed",
                )}
              >
                Thank you for applying to become a Storytime Ambassador! Our
                team is carefully reviewing your application.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-grey-2">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>
              Submitted on {formatApplicationDate(application.createdAt)}
            </span>
          </div>
        </div>

        <div className="text-center space-y-3">
          <p
            className={cn(
              Magnetik_Medium.className,
              "text-xs tracking-widest text-grey-3 uppercase",
            )}
          >
            Decision Expected
          </p>
          <div className="flex gap-3 justify-center">
            <div className="min-w-[110px] rounded-2xl bg-complimentary-colour px-4 py-3 text-white">
              <p
                className={cn(Magnetik_Bold.className, "text-2xl leading-none")}
              >
                {countdown.days}
              </p>
              <p className={cn(Magnetik_Regular.className, "text-sm mt-1")}>
                Days
              </p>
            </div>
            <div className="min-w-[110px] rounded-2xl bg-complimentary-colour px-4 py-3 text-white">
              <p
                className={cn(Magnetik_Bold.className, "text-2xl leading-none")}
              >
                {countdown.hours}
              </p>
              <p className={cn(Magnetik_Regular.className, "text-sm mt-1")}>
                Hours
              </p>
            </div>
          </div>
          <p className={cn(Magnetik_Regular.className, "text-xs text-grey-2")}>
            You&apos;ll receive an email notification when we&apos;ve made a
            decision
          </p>
        </div>

        <div className="space-y-4">
          <h3
            className={cn(
              Magnetik_SemiBold.className,
              "text-sm text-primary-colour",
            )}
          >
            Your Application Journey
          </h3>
          <div className="space-y-0">
            {journeySteps.map((step, index) => (
              <div key={step.title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <JourneyIcon state={step.state} />
                  {index < journeySteps.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 flex-1 min-h-8 my-1",
                        step.state === "completed"
                          ? "bg-complimentary-colour"
                          : "bg-grey-4",
                      )}
                    />
                  )}
                </div>
                <div className="pb-5 min-w-0">
                  <p
                    className={cn(
                      Magnetik_SemiBold.className,
                      "text-sm text-primary-colour",
                    )}
                  >
                    {step.title}
                  </p>
                  <p
                    className={cn(
                      Magnetik_Regular.className,
                      "text-xs text-grey-2 mt-0.5",
                    )}
                  >
                    {step.description}
                  </p>
                  {step.dateLabel && (
                    <p className="text-xs text-grey-3 mt-0.5">
                      {step.dateLabel}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3
            className={cn(
              Magnetik_SemiBold.className,
              "text-sm text-primary-colour",
            )}
          >
            What to Do While You Wait
          </h3>
          {WAITING_TIPS.map((tip) => {
            const Icon = tip.icon;
            return (
              <button
                key={tip.title}
                type="button"
                onClick={() => router.push(tip.href)}
                className="w-full text-left rounded-2xl border border-grey-4 bg-white p-4 flex items-start gap-3"
              >
                <span className="w-10 h-10 rounded-xl bg-accent-shade-2 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-complimentary-colour" />
                </span>
                <div>
                  <p
                    className={cn(
                      Magnetik_SemiBold.className,
                      "text-sm text-primary-colour",
                    )}
                  >
                    {tip.title}
                  </p>
                  <p
                    className={cn(
                      Magnetik_Regular.className,
                      "text-xs text-grey-2 mt-1",
                    )}
                  >
                    {tip.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-grey-4 bg-white p-4 space-y-3">
          <h3
            className={cn(
              Magnetik_SemiBold.className,
              "text-sm text-primary-colour",
            )}
          >
            Application Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-grey-2">Application ID</span>
              <span
                className={cn(Magnetik_Medium.className, "text-primary-colour")}
              >
                #{application.applicationReference}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-grey-2">Submission Date</span>
              <span className="text-primary-colour text-right">
                {formatApplicationDateShort(application.createdAt)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-grey-2">Ambassador Role</span>
              <span className="text-primary-colour text-right">
                {formatAmbassadorTypeLabel(application.type)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-grey-2">Location</span>
              <span className="text-primary-colour text-right">
                {application.city}, {application.country}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <PrimaryFormButton onClick={() => router.push("/home")}>
            Home
          </PrimaryFormButton>

          <button
            type="button"
            onClick={handleWithdraw}
            disabled={withdrawing}
            className={cn(
              "w-full h-12 rounded-full border border-red text-red text-sm disabled:opacity-60",
              Magnetik_SemiBold.className,
            )}
          >
            {withdrawing ? "Withdrawing..." : "Withdraw Application"}
          </button>

          <button
            type="button"
            onClick={() => downloadApplicationCopy(application)}
            className={cn(
              Magnetik_Medium.className,
              "w-full text-sm text-primary-colour underline underline-offset-2",
            )}
          >
            Download Copy
          </button>
        </div>

        <div className="rounded-2xl bg-white border border-grey-4 p-4 flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary-colour flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 text-white" />
          </span>
          <div>
            <p
              className={cn(
                Magnetik_SemiBold.className,
                "text-sm text-primary-colour",
              )}
            >
              Need Help?
            </p>
            <p
              className={cn(
                Magnetik_Regular.className,
                "text-xs text-grey-2 mt-1",
              )}
            >
              Have questions about your application or the ambassador program?
            </p>
            <button
              type="button"
              onClick={() => openSupportModal("support")}
              className={cn(
                Magnetik_Medium.className,
                "text-sm text-complimentary-colour mt-2",
              )}
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
