"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib";
import {
  Magnetik_Bold,
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import { PrimaryFormButton } from "@/components/ambassador/application-form-ui";
import {
  CharacterCounter,
  FormNumberStepper,
  FormTextArea,
  MonthlyReportFieldGroup,
  MonthlyReportIntroCard,
} from "@/components/ambassador/monthly-report-form-ui";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import {
  fetchAmbassadorDashboard,
  fetchMonthlyReport,
  MONTHLY_REPORT_ACTIVITIES_MIN_LENGTH,
  submitMonthlyReport,
  type AmbassadorType,
  type MonthlyReport,
} from "@/src/lib/ambassadors";
import { useRequireAmbassador } from "@/src/hooks/useRequireAmbassador";
import { useAmbassadorRoutes } from "@/components/ambassador/AmbassadorRoutesProvider";
import { showToast } from "@/lib/showNotification";

type ViewPhase = "form" | "success";

interface FormErrors {
  newReferrals?: string;
  referralStoriesPublished?: string;
  activitiesDescription?: string;
  form?: string;
}

interface SubmissionSummary {
  totalReferrals: number;
  totalEventsHosted: number;
  monthsActive: number;
  firstName: string;
}

function getCurrentReportPeriod(): {
  year: number;
  month: number;
  label: string;
} {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    label: now.toLocaleString("en-US", { month: "long", year: "numeric" }),
  };
}

function getActivitiesPlaceholder(type: AmbassadorType): string {
  return type === "campus"
    ? "Describe reading circles, workshops, or campus events..."
    : "Describe reading circles, workshops, or community events...";
}

function hydrateFormFromReport(report: MonthlyReport) {
  return {
    newReferrals: report.newReferrals,
    referralStoriesPublished:
      report.referralStoriesPublished ?? report.storiesWritten ?? 0,
    activitiesDescription:
      report.activitiesDescription ?? report.highlights ?? "",
    programFeedback: report.programFeedback ?? "",
  };
}

function ReportSuccessScreen({
  summary,
  ambassadorType,
}: {
  summary: SubmissionSummary;
  ambassadorType: AmbassadorType;
}) {
  const router = useRouter();
  const routes = useAmbassadorRoutes();
  const scopeLabel = ambassadorType === "campus" ? "campus" : "community";

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto px-6 flex flex-col items-center justify-center text-center pb-12">
      <div className="w-24 h-24 rounded-full bg-[#34A853] flex items-center justify-center mb-6">
        <Check className="w-12 h-12 text-white" strokeWidth={3} />
      </div>
      <h1
        className={cn(
          Magnetik_Bold.className,
          "text-2xl text-primary-colour mb-3",
        )}
      >
        Report Submitted!!
      </h1>
      <p
        className={cn(
          Magnetik_Regular.className,
          "text-sm text-grey-2 leading-relaxed mb-8 max-w-xs",
        )}
      >
        Thank you for sharing your impact on your {scopeLabel}. Your
        contributions help us improve the program and celebrate your
        achievements.
      </p>

      <div className="rounded-2xl bg-white border border-grey-5 shadow-sm p-5 mb-8 max-w-sm">
        <p
          className={cn(
            Magnetik_Regular.className,
            "text-sm text-primary-colour leading-relaxed",
          )}
        >
          You&apos;ve referred {summary.totalReferrals} user
          {summary.totalReferrals === 1 ? "" : "s"} and hosted{" "}
          {summary.totalEventsHosted} for the whole {summary.monthsActive} month
          {summary.monthsActive === 1 ? "" : "s"}. Amazing work,{" "}
          {summary.firstName}! 🎉
        </p>
      </div>

      <PrimaryFormButton onClick={() => router.push(routes.dashboard)}>
        Back to Dashboard
      </PrimaryFormButton>
      <Link
        href={routes.profile}
        className={cn(
          Magnetik_Medium.className,
          "mt-4 text-sm text-primary-colour underline underline-offset-2",
        )}
      >
        Back to Profile
      </Link>
    </div>
  );
}

export default function AmbassadorReportView() {
  const router = useRouter();
  const routes = useAmbassadorRoutes();
  const { isLoading: guardLoading, isAmbassador } = useRequireAmbassador();
  const period = getCurrentReportPeriod();
  const { user } = useUserProfile();

  const [phase, setPhase] = useState<ViewPhase>("form");
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [dashboardStats, setDashboardStats] = useState<{
    totalReferrals: number;
    monthsActive: number;
  } | null>(null);
  const [ambassadorType, setAmbassadorType] =
    useState<AmbassadorType>("campus");
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [summary, setSummary] = useState<SubmissionSummary | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [newReferrals, setNewReferrals] = useState(0);
  const [referralStoriesPublished, setReferralStoriesPublished] = useState(0);
  const [activitiesDescription, setActivitiesDescription] = useState("");
  const [programFeedback, setProgramFeedback] = useState("");

  useEffect(() => {
    fetchMonthlyReport(period.year, period.month)
      .then((data) => {
        setReport(data.report);
        const form = hydrateFormFromReport(data.report);
        setNewReferrals(form.newReferrals);
        setReferralStoriesPublished(form.referralStoriesPublished);
        setActivitiesDescription(form.activitiesDescription);
        setProgramFeedback(form.programFeedback);
      })
      .catch(() => {
        showToast({ type: "error", message: "Failed to load monthly report" });
      })
      .finally(() => setLoading(false));
  }, [period.year, period.month]);

  useEffect(() => {
    fetchAmbassadorDashboard()
      .then((dashboard) => {
        setAmbassadorType(dashboard.ambassador.type);
        const acceptedAt = dashboard.ambassador.acceptedAt
          ? new Date(dashboard.ambassador.acceptedAt)
          : null;
        const monthsActive = acceptedAt
          ? Math.max(
              1,
              Math.ceil(
                (Date.now() - acceptedAt.getTime()) /
                  (1000 * 60 * 60 * 24 * 30),
              ),
            )
          : 1;
        setDashboardStats({
          totalReferrals: dashboard.stats.totalReferrals,
          monthsActive,
        });
      })
      .catch(() => undefined);
  }, []);

  const status = report?.status ?? "inactive";
  const isInactive = status === "inactive";
  const isLocked =
    status === "submitted" || status === "processing" || status === "completed";
  const isProcessing = status === "submitted" || status === "processing";

  const canEdit = !isInactive && !isLocked;
  const isBusy = savingDraft || submitting;

  const activitiesLength = activitiesDescription.trim().length;

  const isSubmitReady = useMemo(() => {
    return (
      activitiesLength >= MONTHLY_REPORT_ACTIVITIES_MIN_LENGTH &&
      newReferrals >= 0 &&
      referralStoriesPublished >= 0
    );
  }, [activitiesLength, newReferrals, referralStoriesPublished]);

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateSubmit = (): boolean => {
    const nextErrors: FormErrors = {};

    if (activitiesLength < MONTHLY_REPORT_ACTIVITIES_MIN_LENGTH) {
      nextErrors.activitiesDescription = `Please write at least ${MONTHLY_REPORT_ACTIVITIES_MIN_LENGTH} characters about your activities.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    setErrors({});
    try {
      const result = await submitMonthlyReport({
        year: period.year,
        month: period.month,
        asDraft: true,
        newReferrals,
        referralStoriesPublished,
        activitiesDescription: activitiesDescription.trim() || undefined,
        programFeedback: programFeedback.trim() || undefined,
      });
      setReport(result.report);
      showToast({ type: "success", message: "Draft saved" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save draft";
      setErrors({ form: message });
      showToast({ type: "error", message });
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateSubmit()) return;

    setSubmitting(true);
    setErrors({});
    try {
      const result = await submitMonthlyReport({
        year: period.year,
        month: period.month,
        asDraft: false,
        newReferrals,
        referralStoriesPublished,
        activitiesDescription: activitiesDescription.trim(),
        programFeedback: programFeedback.trim() || undefined,
      });
      setReport(result.report);
      if (result.summary) {
        setSummary(result.summary);
      } else {
        setSummary({
          totalReferrals: dashboardStats?.totalReferrals ?? newReferrals,
          totalEventsHosted: result.report.eventsHosted,
          monthsActive: dashboardStats?.monthsActive ?? 1,
          firstName:
            user?.firstName?.trim() || user?.penName?.trim() || "Ambassador",
        });
      }
      setPhase("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit report";
      setErrors({ form: message });
      showToast({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  if (guardLoading || !isAmbassador) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-colour" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-colour" />
      </div>
    );
  }

  if (phase === "success" && summary) {
    return (
      <ReportSuccessScreen summary={summary} ambassadorType={ambassadorType} />
    );
  }

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto pb-28">
      <div className="bg-primary-colour text-white px-4 pt-5 pb-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(routes.dashboard)}
            className="text-white"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className={cn(Magnetik_Medium.className, "text-lg")}>
            Monthly Report
          </h1>
          <p
            className={cn(Magnetik_Regular.className, "text-xs text-white/80")}
          >
            {period.label}
          </p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {isInactive && (
          <div className="rounded-2xl bg-white border border-grey-5 p-4 text-sm text-grey-2">
            Monthly reports for {period.label} are not available yet.
          </div>
        )}

        {isProcessing && (
          <div className="rounded-2xl bg-white border border-blue-200 p-4 flex gap-3">
            <FileText className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800">
              Your report is{" "}
              {status === "processing" ? "being processed" : "submitted"}.
              We&apos;ll notify you when it&apos;s complete.
            </p>
          </div>
        )}

        {status === "completed" && (
          <div className="rounded-2xl border border-[#34A853]/30 bg-[#34A853]/5 p-4 text-sm text-primary-colour">
            Report processed! Your scores have been updated.
          </div>
        )}

        {errors.form && (
          <div className="rounded-2xl border border-red/30 bg-red/5 p-3 text-sm text-red">
            {errors.form}
          </div>
        )}

        {!isInactive && (
          <>
            <MonthlyReportIntroCard />

            <div className="rounded-2xl bg-white border border-grey-5 shadow-sm p-4 space-y-5">
              <MonthlyReportFieldGroup
                label="New users introduced"
                required
                helper="Approximate number is fine"
              >
                <FormNumberStepper
                  id="field-newReferrals"
                  value={newReferrals}
                  onChange={(value) => {
                    setNewReferrals(value);
                    clearError("newReferrals");
                  }}
                  disabled={!canEdit || isBusy}
                  invalid={!!errors.newReferrals}
                  errorMessage={errors.newReferrals}
                />
              </MonthlyReportFieldGroup>

              <MonthlyReportFieldGroup
                label="Stories published by your referrals"
                required
                helper="Stories created by users you referred"
              >
                <FormNumberStepper
                  id="field-referralStories"
                  value={referralStoriesPublished}
                  onChange={(value) => {
                    setReferralStoriesPublished(value);
                    clearError("referralStoriesPublished");
                  }}
                  disabled={!canEdit || isBusy}
                  invalid={!!errors.referralStoriesPublished}
                  errorMessage={errors.referralStoriesPublished}
                />
              </MonthlyReportFieldGroup>

              <MonthlyReportFieldGroup
                label="Activities and events hosted"
                required
              >
                <FormTextArea
                  id="field-activitiesDescription"
                  value={activitiesDescription}
                  onChange={(value) => {
                    setActivitiesDescription(value);
                    clearError("activitiesDescription");
                  }}
                  placeholder={getActivitiesPlaceholder(ambassadorType)}
                  rows={5}
                  focused={focusedField === "activitiesDescription"}
                  onFocus={() => setFocusedField("activitiesDescription")}
                  onBlur={() => setFocusedField(null)}
                  disabled={!canEdit || isBusy}
                  invalid={!!errors.activitiesDescription}
                  errorMessage={errors.activitiesDescription}
                />
                <CharacterCounter
                  current={activitiesLength}
                  minimum={MONTHLY_REPORT_ACTIVITIES_MIN_LENGTH}
                />
              </MonthlyReportFieldGroup>

              <MonthlyReportFieldGroup
                label="Feedback or suggestions for the program"
                helper="Optional, but highly valued!"
              >
                <FormTextArea
                  id="field-programFeedback"
                  value={programFeedback}
                  onChange={setProgramFeedback}
                  placeholder="Share what's working well and ideas for improvement"
                  rows={4}
                  focused={focusedField === "programFeedback"}
                  onFocus={() => setFocusedField("programFeedback")}
                  onBlur={() => setFocusedField(null)}
                  disabled={!canEdit || isBusy}
                />
              </MonthlyReportFieldGroup>
            </div>
          </>
        )}
      </div>

      {canEdit && !isInactive && (
        <div className="fixed bottom-0 left-0 right-0 bg-accent-shade-1 border-t border-grey-5 px-4 py-4 max-w-md mx-auto">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isBusy}
              className={cn(
                "flex-1 h-12 rounded-full border border-primary-colour text-primary-colour bg-white text-sm",
                Magnetik_Medium.className,
              )}
            >
              {savingDraft ? "Saving..." : "Save As Draft"}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isBusy || !isSubmitReady}
              className={cn(
                "flex-1 h-12 rounded-full bg-primary-colour text-white text-sm disabled:opacity-50",
                Magnetik_SemiBold.className,
              )}
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
