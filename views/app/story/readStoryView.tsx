"use client";

import React, {
  useState,
  Suspense,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

import { useSearchParams, useRouter } from "next/navigation";

import { Skeleton } from "@heroui/skeleton";

import {
  useStory,
  useStoryLikes,
  useStoryComments,
  useChapterComments,
  useEpisodeComments,
  useReadingProgress,
  useChapterProgress,
  useEpisodeProgress,
  useMarkStoryAsRead,
} from "@/src/hooks/useStoryDetail";

import { rewriteForCapacitor } from "@/lib/linkRewrite";

import {
  useOfflineStories,
  useOnlineStatus,
} from "@/src/hooks/useOfflineStories";

import { useUserStore } from "@/src/stores/useUserStore";

import { useAuthStore } from "@/src/stores/useAuthStore";

import { useAuthModalStore } from "@/src/stores/useAuthModalStore";

import { useTTSStore } from "@/src/stores/useTTSStore";

import { TTSProvider } from "@/components/providers/TTSProvider";

import { stopBrowserTTS } from "@/src/lib/tts/stopBrowserTTS";

import PageHeader from "@/components/reusables/customUI/pageHeader";

// Component imports

// OfflineBanner is rendered globally by <OfflineManager /> in the root layout;

// importing it here would double-stack it on this page.

import { StoryHeader } from "./components/StoryHeader";

import { ChapterSelector } from "./components/ChapterSelector";

import { StoryContent } from "./components/StoryContent";

import { InteractionSection } from "./components/InteractionSection";

import { NavigationBar } from "./components/NavigationBar";

import { StoryAudioBar } from "./components/StoryAudioBar";

import { StoryPartFooter } from "./components/StoryPartFooter";

import { CommentsSection } from "./components/CommentsSection";

import { StoryOfflineEmptyState } from "./components/StoryOfflineEmptyState";

import type { StoryReadingMode } from "./components/StoryHeader";

// Custom hooks

import { useScrollVisibility } from "./hooks/useScrollVisibility";

import { useOfflineContent } from "./hooks/useOfflineContent";

import { useStoryContent } from "./hooks/useStoryContent";

import { useStoryAudio } from "@/src/hooks/useStoryAudio";

import { useStoryAudioVoices } from "@/src/hooks/useStoryAudioVoices";

import { usePremiumFeatures } from "@/src/hooks/usePremiumFeatures";

import { usePremiumUpsell } from "@/src/hooks/usePremiumUpsell";

import { PremiumUpsellModal } from "@/components/reusables/PremiumUpsellModal";

import { PremiumLockedReadView } from "./components/PremiumLockedReadView";

import { canReadExclusiveStory } from "@/src/lib/premiumUpsell";

import { useLocalReadingProgress } from "@/src/hooks/useLocalReadingProgress";

import { useAbortableRequest } from "@/hooks/useAbortableRequest";

interface ReadStoryViewProps {
  storyId: string;
}

export const ReadStoryView = ({ storyId }: ReadStoryViewProps) => {
  const router = useRouter();

  const searchParams = useSearchParams();

  const initialChapterId = searchParams.get("chapterId");

  const initialEpisodeId = searchParams.get("episodeId");

  const initialContentId = initialChapterId || initialEpisodeId;

  // Auth check

  const { openModal: openAuthModal } = useAuthModalStore();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Prefetch parent story route

    router.prefetch(rewriteForCapacitor(`/story/${storyId}`));

    // Check both store and cookies to avoid false negatives during hydration

    const hasToken =
      isAuthenticated() ||
      (typeof window !== "undefined" && document.cookie.includes("authToken="));

    // Offline reading must work even when the session cookie has expired —

    // the story is already cached locally. We only redirect to login when

    // the user is online (or offline with no local copy of the story).

    const isOfflineNow = typeof navigator !== "undefined" && !navigator.onLine;

    if (!hasToken && !isOfflineNow) {
      openAuthModal("login");

      router.push(rewriteForCapacitor(`/story/${storyId}`));
    }
  }, [isAuthenticated, openAuthModal, router, storyId]);

  // Get current user

  const { user } = useUserStore();

  const { isPremium, checkFeature } = usePremiumFeatures();

  const { requireFeature, upsellReason, closeUpsell, isUpsellOpen } =
    usePremiumUpsell();

  // Check online/offline status

  const isOnline = useOnlineStatus();

  const { syncChapterIfNeeded, syncEpisodeIfNeeded } = useOfflineStories();

  const {
    hasOfflineRecord,

    offlineStory,

    offlineContent,

    isContentAvailableOffline,

    isLoaded: offlineCheckDone,

    updateLastRead,
  } = useOfflineContent(storyId);

  // Data hooks - only fetch when online. If the user has this story saved

  // offline, we still try the network for fresh metadata; useStoryContent

  // prefers the offline copy when the network response is empty or fails.

  const { story, isLoading: isStoryLoading } = useStory(
    isOnline ? storyId : undefined,
  );

  const { likeCount, isLiked, toggleLike } = useStoryLikes(
    isOnline ? storyId : undefined,

    isAuthenticated(),
  );

  // Mark as read after delay

  const { markAsRead } = useMarkStoryAsRead();

  const hasMarkedAsReadRef = useRef(false);

  useEffect(() => {
    if (!isOnline || !storyId || hasMarkedAsReadRef.current) return;

    const timer = setTimeout(() => {
      markAsRead(storyId);

      hasMarkedAsReadRef.current = true;
    }, 5000); // 5 seconds delay

    return () => clearTimeout(timer);
  }, [isOnline, storyId, markAsRead]);

  // Reading progress tracking
  //
  // The previous implementation fired a server PUT every 10 seconds
  // for the duration of the read session. On a slow connection
  // each PUT took 200-600ms, and the `await mutate()` after every
  // PUT triggered a fresh GET, so the user was effectively paying
  // for one POST + one GET every 10s — wasteful both for the user
  // (data plan) and the backend (request budget).
  //
  // The new flow is:
  //   1. Compute progress every 5s, locally only.
  //   2. Accumulate reading time + last percentage in the
  //      `useLocalReadingProgress` hook (in-memory + sessionStorage
  //      backstop).
  //   3. Flush to the server on a long interval (default 10 min)
  //      AND on unmount.
  //   4. Abort the in-flight PUT on unmount so we don't ship
  //      stale data after the user has left.

  const contentContainerRef = useRef<HTMLDivElement>(null);

  const storyContentRef = useRef<HTMLDivElement>(null); // Ref for the actual story text container

  const commentsSectionRef = useRef<HTMLDivElement>(null);

  const hasRestoredScrollRef = useRef<boolean>(false);

  // The in-flight server PUT goes through this. AbortController
  // is mounted on unmount so a slow PUT doesn't outlive the page.
  const { run: runAbortable } = useAbortableRequest();

  // `progressCacheKey` and `localProgress` are declared further
  // down, right after `hasChapters` / `hasEpisodes` /
  // `selectedChapterId` come into scope — they depend on all
  // three and can't be hoisted here.

  // Get progress hooks

  const { progress: storyProgress, updateProgress: updateStoryProgress } =
    useReadingProgress(isOnline ? storyId : undefined, isAuthenticated());

  // Story metadata lists episodes/chapters by id + number only; content is fetched per part.

  const rawStoryEpisodes = (story as any)?.episodes || [];

  const rawStoryChapters = (story as any)?.chapters || [];

  const storyEpisodes = Array.isArray(rawStoryEpisodes)
    ? rawStoryEpisodes.filter((ep: { id?: string }) => ep?.id)
    : [];

  const storyChapters = Array.isArray(rawStoryChapters)
    ? rawStoryChapters.filter((ch: { id?: string }) => ch?.id)
    : [];

  // Match preview page: episodes take priority over chapters

  const hasEpisodes = storyEpisodes.length > 0;

  const hasChapters =
    !hasEpisodes &&
    (story as any)?.chapter === true &&
    storyChapters.length > 0;

  const effectiveEpisodes = hasEpisodes ? storyEpisodes : [];

  const effectiveChapters = hasChapters ? storyChapters : [];

  const structure = hasChapters
    ? "chapters"
    : hasEpisodes
      ? "episodes"
      : "single";

  // Use counts from story data if available, otherwise use hook counts

  const displayLikeCount = (story as any)?.likeCount ?? likeCount ?? 0;

  // UI State

  const [showDropdown, setShowDropdown] = useState(false);

  const [readingMode, setReadingMode] = useState<StoryReadingMode>("read");

  const selectedNarrationVoiceId = useTTSStore(
    (state) => state.selectedNarrationVoiceId,
  );

  const setSelectedNarrationVoiceId = useTTSStore(
    (state) => state.setSelectedNarrationVoiceId,
  );

  // Custom hooks for derived state

  const isNavVisible = useScrollVisibility();

  const {
    selectedChapterId,

    isUsingOfflineData,

    currentContent,

    currentTitle,

    currentComments,

    hasNavigation,

    navigationList,

    currentIndex,

    activeStory,

    handleChapterChange,

    isLoading: isContentLoading,

    isPartLoading,

    nextPart,

    prevPart,

    partLabel,
  } = useStoryContent({
    story,

    chapters: effectiveChapters,

    episodes: effectiveEpisodes,

    structure,

    offlineStory,

    offlineContent,

    isOnline,

    isContentAvailableOffline,

    syncChapterIfNeeded,

    syncEpisodeIfNeeded,

    initialContentId: initialContentId || undefined,
  });

  // Stable cache key for the per-chapter local accumulator.
  // Declared here (not earlier) because it depends on
  // `hasChapters` / `hasEpisodes` (computed just above) and
  // `selectedChapterId` (returned by `useStoryContent`).
  // Hoisting it before the variables exist would be a TDZ
  // violation.
  const progressCacheKey = useMemo(() => {
    const part = hasChapters ? "ch" : hasEpisodes ? "ep" : "story";
    return `progress:${storyId}:${part}:${selectedChapterId ?? "single"}`;
  }, [storyId, selectedChapterId, hasChapters, hasEpisodes]);

  // Local-only progress tracker. Persists reading time + last
  // percentage to the state cache so a tab close + reopen within
  // the same session doesn't lose the count.
  const localProgress = useLocalReadingProgress({
    key: progressCacheKey,
  });

  // When the user goes offline while reading, record the lastRead timestamp

  // so the "Continue reading" surface can pick up where they left off.

  // Moved below useStoryContent() since isUsingOfflineData is now derived

  // there (per-chapter, reactive to selectedChapterId changes) rather than

  // computed statically from the URL's initial chapterId/episodeId.

  useEffect(() => {
    if (!isOnline && isUsingOfflineData) {
      updateLastRead();
    }
  }, [isOnline, isUsingOfflineData, updateLastRead]);

  const { defaultVoice } = useStoryAudioVoices(isOnline && !isUsingOfflineData);

  const narrationVoice = selectedNarrationVoiceId ?? defaultVoice;

  useEffect(() => {
    if (!selectedNarrationVoiceId && defaultVoice) {
      setSelectedNarrationVoiceId(defaultVoice);
    }
  }, [defaultVoice, selectedNarrationVoiceId, setSelectedNarrationVoiceId]);

  const updateContentUrl = useCallback(
    (contentId: string) => {
      const params = new URLSearchParams(searchParams.toString());

      params.delete("chapterId");

      params.delete("episodeId");

      if (structure === "chapters") {
        params.set("chapterId", contentId);
      } else if (structure === "episodes") {
        params.set("episodeId", contentId);
      }

      router.replace(`?${params.toString()}`, { scroll: false });
    },

    [router, searchParams, structure],
  );

  const handleChapterChangeWithUrl = useCallback(
    (contentId: string) => {
      handleChapterChange(contentId);

      updateContentUrl(contentId);
    },

    [handleChapterChange, updateContentUrl],
  );

  const handlePreviousWithUrl = useCallback(() => {
    const idx = navigationList.findIndex(
      (item: { id: string }) => item.id === selectedChapterId,
    );

    if (idx > 0) {
      const prevId = navigationList[idx - 1].id;

      handleChapterChange(prevId);

      updateContentUrl(prevId);
    }
  }, [
    navigationList,

    selectedChapterId,

    handleChapterChange,

    updateContentUrl,
  ]);

  const handleNextWithUrl = useCallback(() => {
    const idx = navigationList.findIndex(
      (item: { id: string }) => item.id === selectedChapterId,
    );

    if (idx >= 0 && idx < navigationList.length - 1) {
      const nextId = navigationList[idx + 1].id;

      handleChapterChange(nextId);

      updateContentUrl(nextId);
    }
  }, [
    navigationList,

    selectedChapterId,

    handleChapterChange,

    updateContentUrl,
  ]);

  // Get chapter/episode progress hooks based on content type - only call the one we need.

  // MOVED UP: these need to land before useStoryAudio so currentProgress is in scope

  // when useStoryAudio({ initialProgressPercent: ... }) evaluates its argument.

  const { progress: chapterProgress, updateProgress: updateChapterProgress } =
    useChapterProgress(
      hasChapters && isOnline ? storyId : undefined,

      hasChapters && selectedChapterId ? selectedChapterId : undefined,

      isAuthenticated(),
    );

  const { progress: episodeProgress, updateProgress: updateEpisodeProgress } =
    useEpisodeProgress(
      !hasChapters && hasEpisodes && isOnline ? storyId : undefined,

      !hasChapters && hasEpisodes && selectedChapterId
        ? selectedChapterId
        : undefined,

      isAuthenticated(),
    );

  // Current progress data

  const currentProgress = hasChapters
    ? chapterProgress
    : hasEpisodes
      ? episodeProgress
      : null;

  const audioChapterId =
    hasChapters && selectedChapterId ? selectedChapterId : null;

  const audioEpisodeId =
    !hasChapters && hasEpisodes && selectedChapterId ? selectedChapterId : null;

  const storyAudio = useStoryAudio({
    storyId,

    chapterId: audioChapterId,

    episodeId: audioEpisodeId,

    voice: narrationVoice,

    enabled:
      readingMode === "listen" &&
      isOnline &&
      !isUsingOfflineData &&
      checkFeature("audioNarration"),

    storyTitle: activeStory?.title,

    partTitle: currentTitle,

    authorName: activeStory?.anonymous
      ? "Anonymous"
      : activeStory?.author?.penName || "Anonymous",

    artworkUrl:
      (activeStory as any)?.imageUrl || (activeStory as any)?.coverImage,

    // Uses the plain nav handlers directly (no storyAudio.stop() call) —

    // useStoryAudio already stops/reloads playback internally whenever

    // chapterId/episodeId changes, so this avoids a circular dependency

    // on storyAudio itself while still keeping lock-screen prev/next in

    // sync with the same URL-updating navigation the in-app UI uses.

    onPreviousTrack: hasNavigation ? handlePreviousWithUrl : undefined,

    onNextTrack: hasNavigation ? handleNextWithUrl : undefined,

    // Resume narration from the saved reading percentage for whichever

    // chapter/episode is currently selected. useChapterProgress/

    // useEpisodeProgress are already keyed on selectedChapterId, so this

    // updates automatically as the user navigates chapters.

    initialProgressPercent: (currentProgress as any)?.percentageRead ?? 0,
  });

  const handleReadingModeChange = useCallback(
    (mode: StoryReadingMode) => {
      if (mode === "listen") {
        if (!requireFeature("audioNarration")) {
          return;
        }

        stopBrowserTTS();
      } else {
        storyAudio.stop();
      }

      setReadingMode(mode);
    },

    [requireFeature, storyAudio.stop],
  );

  const handleAudioPreviousChapter = useCallback(() => {
    storyAudio.stop();

    handlePreviousWithUrl();
  }, [handlePreviousWithUrl, storyAudio.stop]);

  const handleAudioNextChapter = useCallback(() => {
    storyAudio.stop();

    handleNextWithUrl();
  }, [handleNextWithUrl, storyAudio.stop]);

  // Memoize word count to avoid recalculating on every render/interval

  const totalWords = React.useMemo(() => {
    if (!currentContent) return 0;

    return currentContent.trim().split(/\s+/).length;
  }, [currentContent]);

  // Get comment creation function based on content type

  const {
    comments: storyComments,

    createComment: createStoryComment,

    updateComment: updateStoryComment,

    deleteComment: deleteStoryComment,
  } = useStoryComments(structure === "single" ? storyId : undefined);

  const {
    createComment: createChapterComment,

    updateComment: updateChapterComment,

    deleteComment: deleteChapterComment,
  } = useChapterComments(
    structure === "chapters" && selectedChapterId
      ? selectedChapterId
      : undefined,
  );

  const {
    createComment: createEpisodeComment,

    updateComment: updateEpisodeComment,

    deleteComment: deleteEpisodeComment,
  } = useEpisodeComments(
    structure === "episodes" && selectedChapterId
      ? selectedChapterId
      : undefined,
  );

  // Use comments from current content

  const comments =
    structure === "single" ? storyComments : currentComments || [];

  const displayCommentCount = comments.length;

  const handleCreateComment = async (text: string, parentId?: string) => {
    if (structure === "chapters") {
      return await createChapterComment(text, parentId);
    } else if (structure === "episodes") {
      return await createEpisodeComment(text, parentId);
    } else {
      return await createStoryComment(text, parentId);
    }
  };

  const handleUpdateComment = async (id: string, text: string) => {
    if (structure === "chapters") {
      await updateChapterComment(id, text);
    } else if (structure === "episodes") {
      await updateEpisodeComment(id, text);
    } else {
      await updateStoryComment(id, text);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (structure === "chapters") {
      await deleteChapterComment(id);
    } else if (structure === "episodes") {
      await deleteEpisodeComment(id);
    } else {
      await deleteStoryComment(id);
    }
  };

  // Calculate reading progress based on scroll position. Pure
  // measurement — no side effects, no server I/O. The local
  // accumulator is updated separately via `localProgress.tick()`
  // and `localProgress.updateLocal()`.

  const calculateProgress = useCallback(() => {
    if (!isOnline) return null;

    // Tick the local accumulator. This both:
    //   1. Returns the seconds elapsed since the last tick
    //      (0 when the page is hidden — we never count time the
    //      user wasn't actually reading).
    //   2. Adds the elapsed time to the running readingTimeSeconds
    //      total inside the hook.
    const elapsed = localProgress.tick();
    const local = localProgress.getLocal();

    const readingTimeSeconds =
      local.readingTimeSeconds + Math.round(elapsed);

    // If we can't measure content, return the time-only snapshot.

    if (!storyContentRef.current) {
      return {
        percentageRead: 0,

        wordsRead: 0,

        totalWords,

        readingTimeSeconds,
      };
    }

    const clientHeight = window.innerHeight;

    const contentRect = storyContentRef.current.getBoundingClientRect();

    const contentTop = contentRect.top;

    const contentHeight = contentRect.height;

    const contentBottom = contentRect.bottom;

    const visibleContentHeight = clientHeight - contentTop;

    let percentageRead = 0;

    if (contentHeight <= 0) {
      percentageRead = 100;
    } else {
      percentageRead = (visibleContentHeight / contentHeight) * 100;
    }

    percentageRead = Math.min(100, Math.max(0, percentageRead));

    if (contentBottom <= clientHeight) {
      percentageRead = 100;
    }

    const wordsRead = Math.floor((percentageRead / 100) * totalWords);

    return {
      percentageRead: Math.round(percentageRead),

      wordsRead,

      totalWords,

      readingTimeSeconds,
    };
  }, [totalWords, isOnline, localProgress]);

  // Flush the current local snapshot to the server. The request is
  // routed through `runAbortable` so a slow PUT is cancelled the
  // moment the user leaves the page (or the page is re-mounted on
  // a different chapter) — instead of resolving into a dead
  // component and overwriting the next chapter's snapshot.

  const flushProgressToServer = useCallback(async () => {
    if (!isOnline || !user) return;

    const localState = localProgress.getLocal();

    // We pull the latest percentage/words straight from the
    // locally tracked state so a navigation right before the
    // flush doesn't end up sending the *previous* chapter's
    // scroll position.
    const payload = {
      percentageRead: localState.percentageRead,
      wordsRead: localState.wordsRead,
      totalWords: localState.totalWords,
      readingTimeSeconds: localState.readingTimeSeconds,
    };

    await runAbortable(async ({ signal }) => {
      try {
        if (hasChapters && selectedChapterId) {
          await updateChapterProgress(payload, { signal });
        } else if (hasEpisodes && selectedChapterId) {
          await updateEpisodeProgress(payload, { signal });
        } else {
          await updateStoryProgress(payload, { signal });
        }
      } catch (error) {
        // Aborted requests are no-ops; the unmount path will
        // try again next time.
        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          (error as { name?: string }).name === "AbortError"
        ) {
          return;
        }
        console.error("Failed to update reading progress:", error);
      }
    });
  }, [
    isOnline,
    user,
    localProgress,
    hasChapters,
    hasEpisodes,
    selectedChapterId,
    updateChapterProgress,
    updateEpisodeProgress,
    updateStoryProgress,
    runAbortable,
  ]);

  // The locally-tracked progress is updated on every "tick".
  // We keep this cheap (no server I/O) and run on a short
  // interval so the audio bar's progress indicator stays fresh.

  const recordLocalProgress = useCallback(() => {
    if (!isOnline) return;
    const measured = calculateProgress();
    if (!measured) return;
    localProgress.updateLocal(measured);
  }, [isOnline, calculateProgress, localProgress]);

  // Initialize the local accumulator from the server's last-known
  // reading time once, and keep that value stable for the session.
  const isTimeInitializedRef = useRef(false);

  useEffect(() => {
    if (!currentProgress || isTimeInitializedRef.current) return;

    const existingReadingTime =
      (currentProgress as any)?.readingTimeSeconds || 0;

    const latest = localProgress.getLocal();
    localProgress.updateLocal({
      ...latest,
      readingTimeSeconds: existingReadingTime,
    });

    isTimeInitializedRef.current = true;
  }, [currentProgress, localProgress]);

  // Restore scroll position from progress

  useEffect(() => {
    if (
      !currentProgress ||
      hasRestoredScrollRef.current ||
      isContentLoading ||
      !contentContainerRef.current
    ) {
      return;
    }

    const percentageRead = (currentProgress as any)?.percentageRead || 0;

    if (percentageRead > 0 && percentageRead < 95) {
      // Wait for content to render

      setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight;

        const clientHeight = document.documentElement.clientHeight;

        const targetScroll =
          ((scrollHeight - clientHeight) * percentageRead) / 100;

        window.scrollTo({
          top: targetScroll,

          behavior: "smooth",
        });

        hasRestoredScrollRef.current = true;
      }, 500);
    }
  }, [currentProgress, isContentLoading]);

  // Local-only progress tick loop. We do this on a short interval
  // (5s) to keep the locally tracked percentage/words fresh for
  // the audio bar's progress indicator, but we do NOT talk to the
  // server here — that happens on the 10-minute flush below and
  // once on unmount. The previous implementation did both in
  // one loop every 10s, which doubled the server's request
  // budget for no user-visible benefit.

  useEffect(() => {
    if (!isOnline || !user) return;

    const localInterval = setInterval(() => {
      recordLocalProgress();
    }, 5000);

    return () => {
      clearInterval(localInterval);
    };
  }, [isOnline, user, recordLocalProgress]);

  // Server-flush loop. Runs every 10 minutes (configurable via
  // `localProgress.flushIntervalMs`) and once on unmount. The
  // request is routed through `runAbortable`, so a slow PUT is
  // cancelled the moment the user leaves the page — no
  // ghost requests land in the backend's logs after the page
  // has gone away.

  useEffect(() => {
    if (!isOnline || !user) return;

    const flushEvery = Math.max(
      60_000,
      localProgress.flushIntervalMs ?? 10 * 60 * 1000,
    );

    const serverInterval = setInterval(() => {
      flushProgressToServer();
    }, flushEvery);

    return () => {
      clearInterval(serverInterval);
      // Final flush on unmount. We don't await — the
      // `runAbortable` cleanup on unmount will cancel the
      // request anyway, but firing the flush is what records
      // the user's last-known reading time on the server.
      flushProgressToServer();
    };
  }, [isOnline, user, flushProgressToServer, localProgress]);

  // Reset when chapter/episode changes

  useEffect(() => {
    hasRestoredScrollRef.current = false;
  }, [selectedChapterId]);

  // Loading state — keep the skeleton up until BOTH the network fetch
  // and the offline (IndexedDB) check have settled. Without the second
  // clause, an offline user would see a single render of the
  // "story not found" panel before the offline record arrives, which
  // was a real flicker on cold start with no network.
  if (
    (isStoryLoading && !isUsingOfflineData) ||
    (!offlineCheckDone && !story)
  ) {
    return (
      <div className="min-h-screen p-4 space-y-4 bg-accent-shade-1">
        <PageHeader backLink={`/story?id=${storyId}`} showBackButton />

        <Skeleton className="w-full h-12 rounded-lg" />

        <Skeleton className="w-full rounded-lg h-96" />
      </div>
    );
  }

  // Story not found — use the same shared empty state that the details
  // view uses, with copy tailored to which branch we hit. The previous
  // implementation printed a bare "Story not found" / "Story not
  // available offline" line which gave the user no next step and didn't
  // tell them they could re-download the story from the details page.
  if (!activeStory) {
    const title = hasOfflineRecord
      ? "This part isn't downloaded for offline reading."
      : isOnline
        ? "Story not found"
        : "Couldn't reach the server, and this story isn't downloaded yet.";

    return (
      <StoryOfflineEmptyState
        backLink={`/story?id=${storyId}`}
        title={title}
        hint={
          hasOfflineRecord
            ? "Open the story and download this chapter from the chapters list to read it offline."
            : "Download stories for offline reading so they're always available."
        }
      />
    );
  }

  const storyAuthorId =
    (activeStory as { authorId?: string }).authorId || activeStory.author?.id;

  const isStoryAuthor = Boolean(
    user?.id === storyAuthorId || user?.authorId === storyAuthorId,
  );

  const isExclusiveLocked =
    !isUsingOfflineData &&
    !isStoryAuthor &&
    !canReadExclusiveStory(
      {
        onlyOnStorytime: (activeStory as { onlyOnStorytime?: boolean })
          .onlyOnStorytime,

        requiresPremium: (activeStory as { requiresPremium?: boolean })
          .requiresPremium,

        authorId: storyAuthorId,
      },

      { isPremium, userId: user?.id },
    );

  if (isExclusiveLocked) {
    return (
      <>
        <PremiumLockedReadView
          storyId={storyId}
          storyTitle={activeStory.title}
        />

        <PremiumUpsellModal
          isOpen={isUpsellOpen}
          onClose={closeUpsell}
          reason={upsellReason}
        />
      </>
    );
  }

  const canUseAudio = checkFeature("audioNarration");

  return (
    <TTSProvider>
      <div
        ref={contentContainerRef}
        className="min-h-screen bg-accent-shade-1 relative max-w-[28rem] md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto"
      >
        {/* Story Header */}

        <StoryHeader
          storyId={storyId}
          currentTitle={currentTitle}
          storyTitle={activeStory.title}
          isVisible={isNavVisible}
          showDropdown={showDropdown}
          onToggleDropdown={() => setShowDropdown(!showDropdown)}
          isOffline={isUsingOfflineData}
          readingMode={readingMode}
          onReadingModeChange={
            isOnline && !isUsingOfflineData
              ? handleReadingModeChange
              : undefined
          }
          listenLocked={!canUseAudio}
          onListenLocked={() => requireFeature("audioNarration")}
        />

        {/* Chapter Selector */}

        {hasNavigation && navigationList && (
          <ChapterSelector
            navigationList={navigationList}
            selectedChapterId={selectedChapterId}
            onChapterChange={handleChapterChangeWithUrl}
            isVisible={isNavVisible}
            partLabel={structure === "episodes" ? "Episode" : "Chapter"}
          />
        )}

        {/* Story Content */}

        {isContentLoading && !currentContent ? (
          <div className="px-4 py-8">
            <Skeleton className="w-full rounded-lg h-96" />
          </div>
        ) : isPartLoading && !currentContent ? (
          <div className="px-4 py-8 space-y-4">
            <div className="w-full h-1 overflow-hidden rounded-full bg-light-grey-2">
              <div className="w-1/3 h-full rounded-full animate-pulse bg-complimentary-colour" />
            </div>

            <Skeleton className="w-full h-64 rounded-lg" />
          </div>
        ) : (
          currentContent && (
            <React.Fragment>
              {isPartLoading ? (
                <div className="sticky z-30 px-4 top-28">
                  <div className="w-full h-1 overflow-hidden rounded-full bg-light-grey-2">
                    <div className="w-1/3 h-full rounded-full animate-pulse bg-complimentary-colour" />
                  </div>
                </div>
              ) : null}

              <div ref={storyContentRef}>
                <StoryContent
                  content={currentContent}
                  authorName={
                    activeStory.anonymous
                      ? "Anonymous"
                      : activeStory.author?.penName || "Anonymous"
                  }
                  authorAvatar={activeStory.author?.avatar}
                  hasNavigation={hasNavigation}
                  description={activeStory.description}
                  listenMode={readingMode === "listen"}
                />
              </div>

              {hasNavigation ? (
                <StoryPartFooter
                  partLabel={partLabel}
                  currentIndex={currentIndex}
                  total={navigationList.length}
                  nextPart={nextPart}
                  prevPart={prevPart}
                  onNext={nextPart ? handleNextWithUrl : undefined}
                  onPrevious={prevPart ? handlePreviousWithUrl : undefined}
                  isLoading={isPartLoading}
                />
              ) : null}

              {/* Interaction Section (only when online) */}

              {isOnline && (
                <div className="px-4 pb-6 md:px-12 lg:px-24 xl:px-32">
                  <InteractionSection
                    likeCount={displayLikeCount}
                    commentCount={displayCommentCount}
                    isLiked={isLiked || false}
                    showComments={true}
                    onToggleLike={toggleLike}
                    onToggleComments={() => {}}
                  />

                  {/* Comments Section */}

                  <div ref={commentsSectionRef} className="pb-24">
                    <Suspense
                      fallback={
                        <div className="py-4">
                          <Skeleton className="w-full h-20 rounded-lg" />
                        </div>
                      }
                    >
                      <CommentsSection
                        comments={comments || []}
                        onSubmitComment={handleCreateComment}
                        onUpdateComment={handleUpdateComment}
                        onDeleteComment={handleDeleteComment}
                        isThreaded={true}
                        currentUser={
                          user
                            ? {
                                id: user.id,

                                penName:
                                  user.penName || user.firstName || "Anonymous",

                                avatar:
                                  user.avatar || user.profilePicture || "",
                              }
                            : undefined
                        }
                      />
                    </Suspense>
                  </div>
                </div>
              )}

              {/* Audio player - human narration */}

              {readingMode === "listen" && (
                <StoryAudioBar
                  isVisible={isNavVisible}
                  isLoading={storyAudio.isLoading}
                  error={storyAudio.error}
                  onPlay={storyAudio.play}
                  onPause={storyAudio.pause}
                  onResume={storyAudio.resume}
                  onStop={storyAudio.stop}
                  onSeek={storyAudio.seek}
                  currentIndex={currentIndex}
                  totalChapters={navigationList?.length ?? 0}
                  onPreviousChapter={
                    hasNavigation ? handleAudioPreviousChapter : undefined
                  }
                  onNextChapter={
                    hasNavigation ? handleAudioNextChapter : undefined
                  }
                />
              )}

              {/* Browser TTS navigation - read mode with multi-part stories */}

              {readingMode === "read" && hasNavigation && navigationList && (
                <NavigationBar
                  currentIndex={currentIndex}
                  total={navigationList.length}
                  onPrevious={handlePreviousWithUrl}
                  onNext={handleNextWithUrl}
                  isVisible={isNavVisible}
                  navigationList={navigationList}
                  selectedChapterId={selectedChapterId}
                  partLabel={structure === "episodes" ? "Episode" : "Chapter"}
                  onTtsLocked={() => requireFeature("audioNarration")}
                />
              )}
            </React.Fragment>
          )
        )}
      </div>

      <PremiumUpsellModal
        isOpen={isUpsellOpen}
        onClose={closeUpsell}
        reason={upsellReason}
      />
    </TTSProvider>
  );
};
