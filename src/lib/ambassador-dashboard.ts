import type { AmbassadorType, MonthlyReport } from "@/src/lib/ambassadors";

export interface MonthlyGoal {
  id: string;
  label: string;
  completed: boolean;
}

export function getDaysRemainingInMonth(date = new Date()): number {
  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();
  return lastDay - date.getDate();
}

export function getCurrentMonthLabel(date = new Date()): string {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export function getAmbassadorLevelLabel(type: AmbassadorType): string {
  return type === "campus"
    ? "Level 1 - Campus Ambassador"
    : "Level 2 - Community Champion";
}

export function buildMonthlyGoals(
  report: MonthlyReport | null,
  type: AmbassadorType,
): MonthlyGoal[] {
  const reportSubmitted =
    report != null &&
    ["submitted", "processing", "completed"].includes(report.status);
  const referralsDone = (report?.newReferrals ?? 0) >= 3;
  const eventsDone = (report?.eventsHosted ?? 0) >= 1;
  const eventLabel =
    type === "campus" ? "Host 1 Campus event" : "Host 1 Community event";

  return [
    {
      id: "report",
      label: "Submit monthly report",
      completed: reportSubmitted,
    },
    {
      id: "referrals",
      label: "Refer 3 new users",
      completed: referralsDone,
    },
    { id: "events", label: eventLabel, completed: eventsDone },
  ];
}

export function getMonthlyProgressPercent(goals: MonthlyGoal[]): number {
  if (goals.length === 0) return 0;
  const completed = goals.filter((goal) => goal.completed).length;
  return Math.round((completed / goals.length) * 100);
}

export function isSixMonthMilestone(acceptedAt: string): boolean {
  const eligible = new Date(acceptedAt);
  eligible.setMonth(eligible.getMonth() + 6);
  return Date.now() >= eligible.getTime();
}

export function getSixMonthCertificateDate(acceptedAt: string): string {
  const date = new Date(acceptedAt);
  date.setMonth(date.getMonth() + 6);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTrendDelta(value: number): {
  text: string;
  positive: boolean;
} {
  if (value > 0) {
    return { text: `↑ +${value} this month`, positive: true };
  }
  if (value === 0) {
    return { text: "No change this month", positive: true };
  }
  return { text: `↓ ${value} this month`, positive: false };
}

export function formatMonthlyAddition(
  count: number,
  zeroLabel = "No new this month",
): {
  text: string;
  positive: boolean;
} {
  if (count > 0) {
    return { text: `↑ +${count} this month`, positive: true };
  }
  return { text: zeroLabel, positive: true };
}
