/**
 * Centralised cache keys for the cross-page data layer.
 *
 * Both the global `AppDataPreloader` (which fires the heavy data
 * hooks in the background from the root layout) and the consumer
 * views (library / pen / profile / etc.) read from these same keys
 * via `useDataStateCache` and the SWR `fallbackData` option.
 *
 * Centralising them here makes it impossible for the preloader and
 * the view to disagree on the key — a divergence that previously
 * caused the preloader to warm one key and the view to read another,
 * silently regressing the "instant render" path back to a spinner.
 */
export const APP_CACHE_KEYS = {
  // Home feed sections (already used by the home view).
  homeExclusive: "home:exclusive:page1",
  homeRecent: "home:recent:page1",
  homeTrending: "home:trending:page1",
  homePopular: "home:popular:page1",
  homeGenres: "home:genres",

  // User's own library / pen (used by /library, /pen, profile modals).
  myLibrary: "pen:my-stories:page1",
  readingHistory: "library:reading-history:page1",

  // Profile page data.
  userProfile: "profile:user",
  userStats: "profile:user-stats",
  userAchievements: "profile:user-achievements",

  // Ambassador / referral surface (used by profile + /ambassador).
  ambassadorOverview: "ambassador:overview",
} as const;

export type AppCacheKey = (typeof APP_CACHE_KEYS)[keyof typeof APP_CACHE_KEYS];
