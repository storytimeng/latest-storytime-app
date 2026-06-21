/**
 * Desktop dashboard route map (/app/*).
 *
 * Phase 0 reference — mobile routes stay unchanged; desktop builds here
 * segment by segment. Status drives Phase 1+ rollout tracking.
 */

export const DESKTOP_BASE = "/app";

export const STORYTIME_SHELL_HEADER = "x-storytime-shell";

export type StorytimeShell = "desktop" | "mobile";

export type DesktopRouteStatus = "live" | "planned" | "shared";

export type DesktopRouteEntry = {
  mobile: string;
  desktop: string;
  label: string;
  status: DesktopRouteStatus;
  /** Shared hooks / data layer to reuse when building the desktop page */
  sharedHooks?: string[];
  notes?: string;
};

/** Primary sidebar navigation (Phase 1+) */
export const DESKTOP_NAV_ITEMS = [
  {
    label: "Home",
    href: `${DESKTOP_BASE}/home`,
    icon: "home" as const,
  },
  {
    label: "Library",
    href: `${DESKTOP_BASE}/library`,
    icon: "library" as const,
  },
  {
    label: "Write",
    href: `${DESKTOP_BASE}/write`,
    icon: "write" as const,
  },
  {
    label: "Notifications",
    href: `${DESKTOP_BASE}/notifications`,
    icon: "notifications" as const,
  },
] as const;

export const DESKTOP_SECONDARY_NAV = [
  {
    label: "Profile",
    href: `${DESKTOP_BASE}/profile`,
    icon: "profile" as const,
  },
  {
    label: "Settings",
    href: `${DESKTOP_BASE}/settings`,
    icon: "settings" as const,
  },
  {
    label: "Premium",
    href: `${DESKTOP_BASE}/premium`,
    icon: "premium" as const,
  },
  {
    label: "Ambassador",
    href: `${DESKTOP_BASE}/ambassador`,
    icon: "ambassador" as const,
  },
] as const;

export const DESKTOP_ROUTES = {
  home: `${DESKTOP_BASE}/home`,
  library: `${DESKTOP_BASE}/library`,
  write: `${DESKTOP_BASE}/write`,
  notifications: `${DESKTOP_BASE}/notifications`,
  profile: `${DESKTOP_BASE}/profile`,
  settings: `${DESKTOP_BASE}/settings`,
  search: `${DESKTOP_BASE}/search`,
  newStory: `${DESKTOP_BASE}/stories/new`,
  myStories: `${DESKTOP_BASE}/my-stories`,
  premium: `${DESKTOP_BASE}/premium`,
  allGenres: `${DESKTOP_BASE}/genres`,
  category: (slug: string) => `${DESKTOP_BASE}/genres/${slug}`,
  story: (id: string) => `${DESKTOP_BASE}/stories/${id}`,
  readStory: (id: string) => `${DESKTOP_BASE}/stories/${id}/read`,
  editStory: (id: string) => `${DESKTOP_BASE}/stories/${id}/edit`,
  ambassador: `${DESKTOP_BASE}/ambassador`,
  ambassadorApply: `${DESKTOP_BASE}/ambassador/apply`,
  ambassadorDashboard: `${DESKTOP_BASE}/ambassador/dashboard`,
  ambassadorLeaderboard: `${DESKTOP_BASE}/ambassador/leaderboard`,
  ambassadorReport: `${DESKTOP_BASE}/ambassador/report`,
  ambassadorShare: `${DESKTOP_BASE}/ambassador/share`,
  ambassadorBreakdown: `${DESKTOP_BASE}/ambassador/breakdown`,
  ambassadorStatus: `${DESKTOP_BASE}/ambassador/status`,
  ambassadorDeclined: `${DESKTOP_BASE}/ambassador/declined`,
  ambassadorWelcome: `${DESKTOP_BASE}/ambassador/welcome`,
} as const;

/**
 * Full mobile → desktop route map for Phase 0 planning.
 * `shared` = keep mobile URL (auth, payments, onboarding).
 */
export const DESKTOP_ROUTE_MAP: DesktopRouteEntry[] = [
  // —— Core tabs (Phase 2) ——
  {
    mobile: "/home",
    desktop: DESKTOP_ROUTES.home,
    label: "Home",
    status: "live",
    sharedHooks: ["useHomeFeed", "useGenres", "useStoryCategories"],
    notes: "Desktop home with genre filters + responsive story grids (Phase 2)",
  },
  {
    mobile: "/library",
    desktop: DESKTOP_ROUTES.library,
    label: "Library",
    status: "live",
    sharedHooks: [
      "useLibraryContent",
      "useReadingHistory",
      "useOfflineStories",
    ],
    notes: "Desktop library with sidebar filters + grid (Phase 2)",
  },
  {
    mobile: "/pen",
    desktop: DESKTOP_ROUTES.write,
    label: "Write (Pen)",
    status: "live",
    sharedHooks: ["useStoryViewLogic", "useStoryFormState"],
    notes: "Write hub links to new story + my stories on desktop",
  },
  {
    mobile: "/notification",
    desktop: DESKTOP_ROUTES.notifications,
    label: "Notifications",
    status: "live",
    sharedHooks: ["useNotifications"],
    notes: "Desktop notification list + detail modal (Phase 2)",
  },
  // —— Discovery (Phase 4) ——
  {
    mobile: "/search",
    desktop: DESKTOP_ROUTES.search,
    label: "Search",
    status: "live",
    sharedHooks: ["useStories", "useSearchStories", "useGenres"],
    notes: "Split layout: filters sidebar + scrollable results (Phase 2)",
  },
  {
    mobile: "/all-genres",
    desktop: DESKTOP_ROUTES.allGenres,
    label: "All genres",
    status: "live",
    sharedHooks: ["useGenres"],
    notes: "Responsive genre grid (Phase 4)",
  },
  {
    mobile: "/category/[slug]",
    desktop: `${DESKTOP_BASE}/genres/[slug]`,
    label: "Category",
    status: "live",
    sharedHooks: [
      "useStories",
      "useRecentlyAddedStories",
      "useTrendingStories",
      "usePopularStories",
      "useOnlyOnStorytimeStories",
    ],
    notes: "Genre + curated lists with sidebar nav (Phase 4)",
  },
  // —— Stories (Phase 3) ——
  {
    mobile: "/story/[id]",
    desktop: `${DESKTOP_BASE}/stories/[id]`,
    label: "Story detail",
    status: "live",
    sharedHooks: ["useStoryDetail"],
  },
  {
    mobile: "/story/[id]/read",
    desktop: `${DESKTOP_BASE}/stories/[id]/read`,
    label: "Read story",
    status: "live",
    sharedHooks: ["useStoryContent", "usePremiumFeatures", "useTTS"],
    notes: "Chapter panel + reading column layout",
  },
  {
    mobile: "/new-story",
    desktop: DESKTOP_ROUTES.newStory,
    label: "New story",
    status: "live",
    sharedHooks: ["useStoryViewLogic"],
  },
  {
    mobile: "/edit-story/[id]",
    desktop: `${DESKTOP_BASE}/stories/[id]/edit`,
    label: "Edit story",
    status: "live",
    sharedHooks: ["useStoryViewLogic", "useFetchStory"],
  },
  {
    mobile: "/my-stories",
    desktop: DESKTOP_ROUTES.myStories,
    label: "My stories",
    status: "live",
  },
  // —— Account (Phase 5) ——
  {
    mobile: "/profile",
    desktop: DESKTOP_ROUTES.profile,
    label: "Profile",
    status: "live",
    sharedHooks: ["useUserProfile", "useUserAchievements"],
    notes: "Profile card, genres, account links, centered modals (Phase 5)",
  },
  {
    mobile: "/settings",
    desktop: DESKTOP_ROUTES.settings,
    label: "Settings",
    status: "live",
    sharedHooks: ["usePremiumFeatures"],
    notes: "Sidebar nav + inline settings panels (Phase 5)",
  },
  {
    mobile: "/premium",
    desktop: DESKTOP_ROUTES.premium,
    label: "Premium",
    status: "live",
    sharedHooks: [
      "usePremiumFeatures",
      "useSubscriptionPlans",
      "useSubscriptionCheckout",
    ],
    notes: "Two-column marketing + checkout layout (Phase 5)",
  },
  // —— Ambassador (Phase 6) ——
  {
    mobile: "/ambassador",
    desktop: DESKTOP_ROUTES.ambassador,
    label: "Ambassador hub",
    status: "live",
    sharedHooks: ["useAmbassadorOverview", "useRequireAmbassador"],
    notes: "Program intro + shell-aware routing via AmbassadorRoutesProvider",
  },
  {
    mobile: "/ambassador/apply",
    desktop: DESKTOP_ROUTES.ambassadorApply,
    label: "Ambassador apply",
    status: "live",
  },
  {
    mobile: "/ambassador/dashboard",
    desktop: DESKTOP_ROUTES.ambassadorDashboard,
    label: "Ambassador dashboard",
    status: "live",
  },
  {
    mobile: "/ambassador/leaderboard",
    desktop: DESKTOP_ROUTES.ambassadorLeaderboard,
    label: "Ambassador leaderboard",
    status: "live",
  },
  {
    mobile: "/ambassador/report",
    desktop: DESKTOP_ROUTES.ambassadorReport,
    label: "Ambassador monthly report",
    status: "live",
  },
  {
    mobile: "/ambassador/share",
    desktop: DESKTOP_ROUTES.ambassadorShare,
    label: "Ambassador share link",
    status: "live",
  },
  {
    mobile: "/ambassador/breakdown",
    desktop: DESKTOP_ROUTES.ambassadorBreakdown,
    label: "Ambassador score breakdown",
    status: "live",
  },
  {
    mobile: "/ambassador/status",
    desktop: DESKTOP_ROUTES.ambassadorStatus,
    label: "Ambassador application status",
    status: "live",
  },
  {
    mobile: "/ambassador/declined",
    desktop: DESKTOP_ROUTES.ambassadorDeclined,
    label: "Ambassador declined",
    status: "live",
  },
  {
    mobile: "/ambassador/welcome",
    desktop: DESKTOP_ROUTES.ambassadorWelcome,
    label: "Ambassador welcome",
    status: "live",
  },
  // —— Shared (mobile URL only for now) ——
  {
    mobile: "/auth/login",
    desktop: "/auth/login",
    label: "Login",
    status: "shared",
    notes:
      "Auth flows stay on mobile routes; redirect to /app/home after login (later)",
  },
  {
    mobile: "/auth/signup",
    desktop: "/auth/signup",
    label: "Signup",
    status: "shared",
  },
  {
    mobile: "/auth/setup",
    desktop: "/auth/setup",
    label: "Profile setup",
    status: "shared",
  },
  {
    mobile: "/premium/callback",
    desktop: "/premium/callback",
    label: "Payment callback",
    status: "shared",
  },
];

export function isDesktopAppPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === DESKTOP_BASE || pathname.startsWith(`${DESKTOP_BASE}/`);
}

export function storytimeShellFromPathname(pathname: string): StorytimeShell {
  return isDesktopAppPath(pathname) ? "desktop" : "mobile";
}

export function mobilePathToDesktop(mobilePath: string): string | undefined {
  const normalized = mobilePath.split("?")[0];

  for (const entry of DESKTOP_ROUTE_MAP) {
    if (entry.status === "shared") continue;

    const mobilePattern = entry.mobile
      .replace(/\[id\]/g, "[^/]+")
      .replace(/\[slug\]/g, "[^/]+");
    const regex = new RegExp(`^${mobilePattern}$`);
    if (regex.test(normalized)) {
      return entry.mobile.includes("[id]")
        ? normalized.replace(
            new RegExp(
              `^${entry.mobile.replace("[id]", "([^/]+)").replace("[slug]", "([^/]+)")}$`,
            ),
            entry.desktop.replace("[id]", "$1").replace("[slug]", "$1"),
          )
        : entry.desktop;
    }

    if (entry.mobile === normalized) {
      return entry.desktop;
    }
  }

  return undefined;
}
