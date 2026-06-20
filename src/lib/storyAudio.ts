import { getAuthToken } from "@/src/stores/useAuthStore";
import { ensureValidToken, refreshTokens } from "@/src/lib/tokenManager";

export type StoryAudioStatus = "pending" | "ready" | "failed" | "unavailable";

export interface StoryAudioSegment {
  order: number;
  url: string;
  durationSeconds: number;
}

export interface StoryAudioManifest {
  status: StoryAudioStatus;
  voice: string;
  segments: StoryAudioSegment[];
  totalDurationSeconds: number;
  message?: string;
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_PROXY === "true"
    ? "/api/proxy"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
}

function unwrapData<T>(payload: unknown): T {
  if (!payload || typeof payload !== "object") {
    return payload as T;
  }

  const record = payload as Record<string, unknown>;
  if ("data" in record && record.data && typeof record.data === "object") {
    const nested = record.data as Record<string, unknown>;
    if ("data" in nested) {
      return nested.data as T;
    }
    return nested as T;
  }

  return record as T;
}

async function resolveAuthToken(forceRefresh = false): Promise<string | null> {
  if (forceRefresh) {
    const refreshed = await refreshTokens();
    return refreshed?.token ?? null;
  }

  return ensureValidToken();
}

async function authorizedFetch(
  path: string,
  init: RequestInit = {},
  options?: { retryOnUnauthorized?: boolean },
): Promise<Response> {
  const token = await resolveAuthToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${getBaseUrl().replace(/\/$/, "")}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (
    response.status === 401 &&
    options?.retryOnUnauthorized !== false
  ) {
    const refreshedToken = await resolveAuthToken(true);
    if (refreshedToken) {
      headers.set("Authorization", `Bearer ${refreshedToken}`);
      return fetch(`${getBaseUrl().replace(/\/$/, "")}${path}`, {
        ...init,
        headers,
        cache: "no-store",
      });
    }
  }

  return response;
}

export async function fetchStoryAudio(options: {
  storyId: string;
  chapterId?: string | null;
  episodeId?: string | null;
  voice?: string;
}): Promise<StoryAudioManifest> {
  const params = new URLSearchParams();
  if (options.chapterId) params.set("chapterId", options.chapterId);
  if (options.episodeId) params.set("episodeId", options.episodeId);
  if (options.voice) params.set("voice", options.voice);

  const query = params.toString();
  const path = `/stories/${encodeURIComponent(options.storyId)}/audio${
    query ? `?${query}` : ""
  }`;

  const response = await authorizedFetch(path);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `Failed to load narration audio (${response.status})`,
    );
  }

  return unwrapData<StoryAudioManifest>(await response.json());
}

export async function recordStoryAudioListen(options: {
  storyId: string;
  chapterId?: string | null;
  episodeId?: string | null;
  voice?: string;
  durationSeconds: number;
  completed: boolean;
}): Promise<void> {
  const token = await resolveAuthToken();
  if (!token) return;

  const body: Record<string, unknown> = {
    durationSeconds: options.durationSeconds,
    completed: options.completed,
  };
  if (options.chapterId) body.chapterId = options.chapterId;
  if (options.episodeId) body.episodeId = options.episodeId;
  if (options.voice) body.voice = options.voice;

  try {
    await authorizedFetch(
      `/stories/${encodeURIComponent(options.storyId)}/audio/listens`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
  } catch {
    // Analytics should never block playback
  }
}
