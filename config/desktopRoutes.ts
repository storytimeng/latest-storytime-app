export const DESKTOP_BASE = "/app";

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
} as const;
