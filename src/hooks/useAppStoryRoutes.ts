"use client";

import { useMemo } from "react";
import { getStoryRoutes } from "@/lib/storyRoutes";
import { useStorytimeShell } from "./useStorytimeShell";

export function useAppStoryRoutes() {
  const shell = useStorytimeShell();
  return useMemo(() => getStoryRoutes(shell), [shell]);
}
