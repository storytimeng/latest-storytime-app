"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/reusables/customUI";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useGenres } from "@/src/hooks/useGenres";
import { rewriteForCapacitor } from "@/lib/linkRewrite";
const AllGenres = () => {
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const { genres, isLoading } = useGenres();

  // Normalize genres - API may return strings or objects with a name field
  const genreList: string[] = React.useMemo(() => {
    if (!genres || !Array.isArray(genres)) return [];
    return genres
      .map((g: any) => (typeof g === "string" ? g : g?.name))
      .filter(Boolean)
      .sort((a: string, b: string) => a.localeCompare(b));
  }, [genres]);

  if (!isOnline) {
    return (
      <div className="bg-accent-shade-1 min-h-screen px-4 pt-4">
        <PageHeader title="Genre Pick" backLink="/home" />
        <div className="mt-10">
          <OfflineIndicator />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-accent-shade-1 min-h-screen px-4 md:px-6 lg:px-8 pt-4 pb-20 md:pb-6">
      <PageHeader title="Genre Pick" backLink="/home" />

      {isLoading ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-10">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-accent-colour animate-pulse"
            />
          ))}
        </div>
      ) : genreList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-primary-shade-4 text-sm">
            No genres available yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-8 mt-10">
          {genreList.map((genre) => (
            <Button
              key={genre}
              onClick={() =>
                router.push(
                  rewriteForCapacitor(
                    `/all-genres/${encodeURIComponent(genre.toLowerCase())}`,
                  ),
                )
              }
              className="relative py-[14px] text-white leading-none h-fit font-medium rounded-lg border-none shadow-sm"
              style={{
                backgroundImage: `repeating-linear-gradient(-45deg, #f89a28, #f89a28 18px, #ec8e1c 18px, #ec8e1c 36px)`,
                minHeight: "20px",
              }}
            >
              <span className="relative z-10 text-sm leading-none h-fit">
                {genre}
              </span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllGenres;
