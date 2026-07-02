import { DESKTOP_ROUTES } from "@/config/desktopRoutes";
import { IS_ANDROID } from "@/lib/platform";
import { rewriteForCapacitor } from "@/lib/linkRewrite";

function maybeRewriteHref(href: string) {
  return IS_ANDROID ? rewriteForCapacitor(href) : href;
}

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
  story: (id) => maybeRewriteHref(`/story/${id}`),
  readStory: (id, options) => {
    const base = `/story/${id}/read`;
    let url = base;
    if (options?.chapterId) {
      url = `${base}?chapterId=${options.chapterId}`;
    } else if (options?.episodeId) {
      url = `${base}?episodeId=${options.episodeId}`;
    }
    return maybeRewriteHref(url);
  },
  editStory: (id) => maybeRewriteHref(`/edit-story/${id}`),
  storyResume: (id, progress) => {
    const url =
      progress && progress > 0 && progress < 100
        ? `/story/${id}/read`
        : `/story/${id}`;
    return maybeRewriteHref(url);
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
  story: (id) => maybeRewriteHref(DESKTOP_ROUTES.story(id)),
  readStory: (id, options) => {
    const base = DESKTOP_ROUTES.readStory(id);
    let url = base;
    if (options?.chapterId) {
      url = `${base}?chapterId=${options.chapterId}`;
    } else if (options?.episodeId) {
      url = `${base}?episodeId=${options.episodeId}`;
    }
    return maybeRewriteHref(url);
  },
  editStory: (id) => maybeRewriteHref(DESKTOP_ROUTES.editStory(id)),
  storyResume: (id, progress) => {
    const url =
      progress && progress > 0 && progress < 100
        ? DESKTOP_ROUTES.readStory(id)
        : DESKTOP_ROUTES.story(id);
    return maybeRewriteHref(url);
  },
  myStoriesDrafts: `${DESKTOP_ROUTES.myStories}?tab=drafts`,
};

export function getStoryRoutes(
  shell: StoryShell = "mobile",
): StoryRouteHelpers {
  return shell === "desktop" ? DESKTOP_STORY_ROUTES : MOBILE_ROUTES;
}
