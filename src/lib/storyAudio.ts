import { getAuthToken } from "@/src/stores/useAuthStore";

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

  const token = getAuthToken();
  const response = await fetch(`${getBaseUrl().replace(/\/$/, "")}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `Failed to load narration audio (${response.status})`,
    );
  }

  return unwrapData<StoryAudioManifest>(await response.json());
}
