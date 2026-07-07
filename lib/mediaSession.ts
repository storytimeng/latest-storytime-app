/**
 * Platform-aware Media Session wrapper.
 *
 * Browsers expose navigator.mediaSession natively. Android WebView inside
 * Capacitor does not — @capgo/capacitor-media-session bridges to a native
 * foreground service so lock-screen / notification controls work.
 */

import { IS_ANDROID } from "@/lib/platform";

export type MediaSessionPlaybackState = "none" | "paused" | "playing";

export type MediaSessionAction =
  | "play"
  | "pause"
  | "seekbackward"
  | "seekforward"
  | "previoustrack"
  | "nexttrack"
  | "seekto"
  | "stop";

export interface MediaSessionPosition {
  duration: number;
  playbackRate?: number;
  position: number;
}

type ActionHandler = (details: {
  action: MediaSessionAction;
  seekTime?: number | null;
}) => void;

function resolveArtworkUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  if (typeof window !== "undefined") {
    return new URL(url, window.location.origin).href;
  }
  return url;
}

function buildArtwork(artworkUrl?: string) {
  const src = resolveArtworkUrl(artworkUrl);
  if (!src) return undefined;
  return [
    { src, sizes: "96x96", type: "image/jpeg" },
    { src, sizes: "192x192", type: "image/jpeg" },
    { src, sizes: "512x512", type: "image/jpeg" },
  ];
}

async function getNativeMediaSession() {
  const { MediaSession } = await import("@capgo/capacitor-media-session");
  return MediaSession;
}

export async function setMediaSessionMetadata({
  storyTitle,
  partTitle,
  authorName,
  artworkUrl,
}: {
  storyTitle?: string;
  partTitle?: string;
  authorName?: string;
  artworkUrl?: string;
}) {
  const artwork = buildArtwork(artworkUrl);
  const title = partTitle || storyTitle || "Storytime";
  const artist = authorName || "Storytime";
  const album = storyTitle || "";

  if (IS_ANDROID) {
    const MediaSession = await getNativeMediaSession();
    await MediaSession.setMetadata({ title, artist, album, artwork });
    return;
  }

  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
    return;
  }

  navigator.mediaSession.metadata = new MediaMetadata({
    title,
    artist,
    album,
    artwork: artwork ?? [],
  });
}

export async function setMediaSessionPlaybackState(
  state: MediaSessionPlaybackState,
) {
  if (IS_ANDROID) {
    const MediaSession = await getNativeMediaSession();
    await MediaSession.setPlaybackState({ playbackState: state });
    return;
  }

  if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
    navigator.mediaSession.playbackState = state;
  }
}

export async function setMediaSessionPosition(
  position: MediaSessionPosition | null,
) {
  if (IS_ANDROID) {
    const MediaSession = await getNativeMediaSession();
    if (!position) {
      await MediaSession.setPositionState({});
      return;
    }
    await MediaSession.setPositionState({
      duration: position.duration,
      playbackRate: position.playbackRate ?? 1,
      position: position.position,
    });
    return;
  }

  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
    return;
  }

  try {
    if (!position) {
      navigator.mediaSession.setPositionState();
      return;
    }
    navigator.mediaSession.setPositionState({
      duration: position.duration,
      playbackRate: position.playbackRate ?? 1,
      position: position.position,
    });
  } catch {
    // Some browsers throw if called before metadata/duration is valid.
  }
}

export async function setMediaSessionActionHandler(
  action: MediaSessionAction,
  handler: ActionHandler | null,
) {
  if (IS_ANDROID) {
    const MediaSession = await getNativeMediaSession();
    await MediaSession.setActionHandler(
      { action },
      handler
        ? (details) => {
            handler({
              action: details.action,
              seekTime: details.seekTime,
            });
          }
        : null,
    );
    return;
  }

  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
    return;
  }

  navigator.mediaSession.setActionHandler(
    action,
    handler
      ? (details) => {
          handler({
            action,
            seekTime: details.seekTime ?? null,
          });
        }
      : null,
  );
}

export async function clearMediaSessionActionHandlers() {
  const actions: MediaSessionAction[] = [
    "play",
    "pause",
    "stop",
    "seekto",
    "previoustrack",
    "nexttrack",
  ];
  await Promise.all(
    actions.map((action) => setMediaSessionActionHandler(action, null)),
  );
}
