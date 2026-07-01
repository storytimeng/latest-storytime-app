"use client";

/**
 * EditStoryView (universal)
 *
 * Reads the story id from `useParams` first (legacy `/edit-story/[id]`
 * route) and falls back to `useSearchParams().get("id")` for the static
 * `/edit-story?id=...` page used by the Capacitor build.
 *
 * This means the same component works whether the app is reached via
 * - `/edit-story/abc123` (Next.js dynamic route, web)
 * - `/edit-story?id=abc123` (static, Capacitor / Serwist cache)
 */

import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import StoryView from "@/components/reusables/storyView";

const EditStoryView = () => {
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();

  const storyId =
    (params?.id as string | undefined) || searchParams?.get("id") || "";

  return <StoryView mode="edit" storyId={storyId} />;
};

export default EditStoryView;
