"use client";

import { useEffect } from "react";
import { useGenres } from "@/src/hooks/useGenres";

/**
 * Preloads genres data on app mount
 * This component doesn't render anything, it just triggers the genres fetch
 */
export function GenresPreloader() {
  const { genres, isLoading } = useGenres();

  useEffect(() => {
    if (genres && !isLoading) {
      console.log("Genres preloaded:", genres.length, "genres");
    }
  }, [genres, isLoading]);

  return null;
}
