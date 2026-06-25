import { DESKTOP_ROUTES } from "@/config/desktopRoutes";

export type StoryShell = "mobile" | "desktop";

export type StoryRouteHelpers = {
  home: string;
  library: string;
  write: string;
  myStories: string;
  newStory: string;
  premium: string;
  story: (id: string) => string;
  readStory: (
    id: string,
    options?: { chapterId?: string; episodeId?: string },
  ) => string;
  editStory: (id: string) => string;
  storyResume: (id: string, progress?: number) => string;
  myStoriesDrafts: string;
};

const MOBILE_ROUTES: StoryRouteHelpers = {
  home: "/home",
  library: "/library",
  write: "/pen",
  myStories: "/my-stories",
  newStory: "/new-story",
  premium: "/premium",
  story: (id) => `/story/${id}`,
  readStory: (id, options) => {
    const base = `/story/${id}/read`;
    if (options?.chapterId) {
      return `${base}?chapterId=${options.chapterId}`;
    }
    if (options?.episodeId) {
      return `${base}?episodeId=${options.episodeId}`;
    }
    return base;
  },
  editStory: (id) => `/edit-story/${id}`,
  storyResume: (id, progress) => {
    if (progress && progress > 0 && progress < 100) {
      return `/story/${id}/read`;
    }
    return `/story/${id}`;
  },
  myStoriesDrafts: "/my-stories?tab=drafts",
};

const DESKTOP_STORY_ROUTES: StoryRouteHelpers = {
  home: DESKTOP_ROUTES.home,
  library: DESKTOP_ROUTES.library,
  write: DESKTOP_ROUTES.write,
  myStories: DESKTOP_ROUTES.myStories,
  newStory: DESKTOP_ROUTES.newStory,
  premium: DESKTOP_ROUTES.premium,
  story: (id) => DESKTOP_ROUTES.story(id),
  readStory: (id, options) => {
    const base = DESKTOP_ROUTES.readStory(id);
    if (options?.chapterId) {
      return `${base}?chapterId=${options.chapterId}`;
    }
    if (options?.episodeId) {
      return `${base}?episodeId=${options.episodeId}`;
    }
    return base;
  },
  editStory: (id) => DESKTOP_ROUTES.editStory(id),
  storyResume: (id, progress) => {
    if (progress && progress > 0 && progress < 100) {
      return DESKTOP_ROUTES.readStory(id);
    }
    return DESKTOP_ROUTES.story(id);
  },
  myStoriesDrafts: `${DESKTOP_ROUTES.myStories}?tab=drafts`,
};

export function getStoryRoutes(
  shell: StoryShell = "mobile",
): StoryRouteHelpers {
  return shell === "desktop" ? DESKTOP_STORY_ROUTES : MOBILE_ROUTES;
}
