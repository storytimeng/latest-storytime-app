import { DESKTOP_ROUTES } from "@/config/desktopRoutes";
import {
  AMBASSADOR_WELCOME_SEEN_KEY,
  hasSeenAmbassadorWelcome,
} from "@/src/lib/ambassadors";

export type AmbassadorShell = "mobile" | "desktop";

export type AmbassadorRouteHelpers = {
  hub: string;
  apply: string;
  dashboard: string;
  leaderboard: string;
  report: string;
  share: string;
  breakdown: string;
  status: string;
  declined: string;
  welcome: string;
  profile: string;
  entryPath: string;
};

const MOBILE_AMBASSADOR_ROUTES: Omit<AmbassadorRouteHelpers, "entryPath"> = {
  hub: "/ambassador",
  apply: "/ambassador/apply",
  dashboard: "/ambassador/dashboard",
  leaderboard: "/ambassador/leaderboard",
  report: "/ambassador/report",
  share: "/ambassador/share",
  breakdown: "/ambassador/breakdown",
  status: "/ambassador/status",
  declined: "/ambassador/declined",
  welcome: "/ambassador/welcome",
  profile: "/profile",
};

function desktopEntryPath(): string {
  return hasSeenAmbassadorWelcome()
    ? DESKTOP_ROUTES.ambassadorDashboard
    : `${DESKTOP_ROUTES.ambassador}/welcome`;
}

const DESKTOP_AMBASSADOR_ROUTES: Omit<AmbassadorRouteHelpers, "entryPath"> = {
  hub: DESKTOP_ROUTES.ambassador,
  apply: DESKTOP_ROUTES.ambassadorApply,
  dashboard: DESKTOP_ROUTES.ambassadorDashboard,
  leaderboard: DESKTOP_ROUTES.ambassadorLeaderboard,
  report: DESKTOP_ROUTES.ambassadorReport,
  share: DESKTOP_ROUTES.ambassadorShare,
  breakdown: DESKTOP_ROUTES.ambassadorBreakdown,
  status: DESKTOP_ROUTES.ambassadorStatus,
  declined: DESKTOP_ROUTES.ambassadorDeclined,
  welcome: DESKTOP_ROUTES.ambassadorWelcome,
  profile: DESKTOP_ROUTES.profile,
};

export function getAmbassadorRoutes(
  shell: AmbassadorShell = "mobile",
): AmbassadorRouteHelpers {
  if (shell === "desktop") {
    return {
      ...DESKTOP_AMBASSADOR_ROUTES,
      entryPath: desktopEntryPath(),
    };
  }
  return {
    ...MOBILE_AMBASSADOR_ROUTES,
    entryPath: hasSeenAmbassadorWelcome()
      ? MOBILE_AMBASSADOR_ROUTES.dashboard
      : MOBILE_AMBASSADOR_ROUTES.welcome,
  };
}

export { AMBASSADOR_WELCOME_SEEN_KEY };
