"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Loader2, CheckCircle2, Clock, FileText } from "lucide-react";
import { Magnetik_Medium, Magnetik_SemiBold } from "@/lib/font";
import { AmbassadorHeader } from "@/components/ambassador/AmbassadorHeader";
import {
  fetchMonthlyReport,
  submitMonthlyReport,
  fetchAmbassadorDashboard,
  type MonthlyReport,
  type AmbassadorType,
} from "@/src/lib/ambassadors";
import { showToast } from "@/lib/showNotification";

function getPreviousMonth(): { year: number; month: number; label: string } {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return {
    year: prev.getFullYear(),
    month: prev.getMonth() + 1,
    label: prev.toLocaleString("en", { month: "long", year: "numeric" }),
  };
}

export default function AmbassadorReportView() {
  const period = getPreviousMonth();
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [ambassadorType, setAmbassadorType] =
    useState<AmbassadorType>("campus");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [storiesRead, setStoriesRead] = useState("0");
  const [storiesWritten, setStoriesWritten] = useState("0");
  const [newReferrals, setNewReferrals] = useState("0");
  const [eventsHosted, setEventsHosted] = useState("0");
  const [studentsReached, setStudentsReached] = useState("0");
  const [readingSessions, setReadingSessions] = useState("0");
  const [socialPosts, setSocialPosts] = useState("0");
  const [communityEvents, setCommunityEvents] = useState("0");
  const [onlineReach, setOnlineReach] = useState("0");
  const [highlights, setHighlights] = useState("");

  useEffect(() => {
    Promise.all([
      fetchMonthlyReport(period.year, period.month),
      fetchAmbassadorDashboard(),
    ])
      .then(([reportData, dashboard]) => {
        setReport(reportData.report);
        setAmbassadorType(dashboard.ambassador.type);
        const r = reportData.report;
        setStoriesRead(String(r.storiesRead));
        setStoriesWritten(String(r.storiesWritten));
        setNewReferrals(String(r.newReferrals));
        setEventsHosted(String(r.eventsHosted));
        setStudentsReached(String(r.studentsReached));
        setReadingSessions(String(r.readingSessionsOrganized));
        setSocialPosts(String(r.socialPostsCount));
        setCommunityEvents(String(r.communityEvents));
        setOnlineReach(String(r.onlineReach));
        setHighlights(r.highlights || "");
      })
      .catch(() => {
        showToast({ type: "error", message: "Failed to load report" });
      })
      .finally(() => setLoading(false));
  }, [period.year, period.month]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await submitMonthlyReport({
        year: period.year,
        month: period.month,
        storiesRead: parseInt(storiesRead, 10) || 0,
        storiesWritten: parseInt(storiesWritten, 10) || 0,
        newReferrals: parseInt(newReferrals, 10) || 0,
        eventsHosted: parseInt(eventsHosted, 10) || 0,
        studentsReached: parseInt(studentsReached, 10) || 0,
        readingSessionsOrganized: parseInt(readingSessions, 10) || 0,
        socialPostsCount: parseInt(socialPosts, 10) || 0,
        communityEvents: parseInt(communityEvents, 10) || 0,
        onlineReach: parseInt(onlineReach, 10) || 0,
        highlights: highlights.trim() || undefined,
      });
      setReport(result.report);
      showToast({ type: "success", message: "Report submitted!" });
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Submission failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-colour" />
      </div>
    );
  }

  const status = report?.status || "inactive";
  const isInactive = status === "inactive";
  const isSubmitted = status === "submitted" || status === "processing";
  const isCompleted = status === "completed";

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto pb-24">
      <AmbassadorHeader
        title="Monthly Report"
        backHref="/ambassador/dashboard"
      />

      <div className="px-4 py-6 space-y-6">
        <div className="text-center">
          <p className={`${Magnetik_SemiBold.className} text-primary-colour`}>
            {period.label}
          </p>
          <p className="text-sm text-grey-2 mt-1 capitalize">
            Status: {status}
          </p>
        </div>

        {isInactive && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
            <Clock className="w-5 h-5 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-800">
              Reports for {period.label} open after the month ends. Check back
              soon!
            </p>
          </div>
        )}

        {isSubmitted && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <FileText className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800">
              Your report is{" "}
              {status === "processing" ? "being processed" : "submitted"}.
              We&apos;ll notify you when it&apos;s complete.
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-800">
              Report processed! Your scores have been updated.
            </p>
          </div>
        )}

        {!isInactive && (
          <div className="space-y-4">
            <p className={`${Magnetik_Medium.className} text-primary-colour`}>
              Activity metrics
            </p>
            <Input
              label="Stories read"
              type="number"
              value={storiesRead}
              onValueChange={setStoriesRead}
              isDisabled={isSubmitted || isCompleted}
            />
            <Input
              label="Stories written"
              type="number"
              value={storiesWritten}
              onValueChange={setStoriesWritten}
              isDisabled={isSubmitted || isCompleted}
            />
            <Input
              label="New referrals"
              type="number"
              value={newReferrals}
              onValueChange={setNewReferrals}
              isDisabled={isSubmitted || isCompleted}
            />

            {ambassadorType === "campus" ? (
              <>
                <Input
                  label="Events hosted"
                  type="number"
                  value={eventsHosted}
                  onValueChange={setEventsHosted}
                  isDisabled={isSubmitted || isCompleted}
                />
                <Input
                  label="Students reached"
                  type="number"
                  value={studentsReached}
                  onValueChange={setStudentsReached}
                  isDisabled={isSubmitted || isCompleted}
                />
                <Input
                  label="Reading sessions organized"
                  type="number"
                  value={readingSessions}
                  onValueChange={setReadingSessions}
                  isDisabled={isSubmitted || isCompleted}
                />
              </>
            ) : (
              <>
                <Input
                  label="Social posts"
                  type="number"
                  value={socialPosts}
                  onValueChange={setSocialPosts}
                  isDisabled={isSubmitted || isCompleted}
                />
                <Input
                  label="Community events"
                  type="number"
                  value={communityEvents}
                  onValueChange={setCommunityEvents}
                  isDisabled={isSubmitted || isCompleted}
                />
                <Input
                  label="Online reach"
                  type="number"
                  value={onlineReach}
                  onValueChange={setOnlineReach}
                  isDisabled={isSubmitted || isCompleted}
                />
              </>
            )}

            <Textarea
              label="Highlights (optional)"
              minRows={3}
              value={highlights}
              onValueChange={setHighlights}
              isDisabled={isSubmitted || isCompleted}
            />

            {!isSubmitted && !isCompleted && (
              <Button
                className="w-full bg-primary-colour text-white"
                onPress={handleSubmit}
                isDisabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Submit Report"
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
