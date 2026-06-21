"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { DESKTOP_ROUTES } from "@/config/desktopRoutes";
import { genreToSlug } from "@/lib/genreSlug";
import { useGenres } from "@/src/hooks/useGenres";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";
import { OfflineIndicator } from "@/components/OfflineIndicator";

export function DesktopAllGenresView() {
  const isOnline = useOnlineStatus();
  const { genres, isLoading } = useGenres();

  if (!isOnline) {
    return (
      <div className="mx-auto max-w-3xl">
        <OfflineIndicator />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section>
        <h2
          className={cn(
            "text-2xl text-[#361B17] md:text-3xl",
            Magnetik_Bold.className,
          )}
        >
          All genres
        </h2>
        <p
          className={cn(
            "mt-1 text-sm text-[#361B17]/60",
            Magnetik_Regular.className,
          )}
        >
          Browse stories by genre
        </p>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-4 md:p-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] animate-pulse rounded-xl bg-black/[0.06]"
              />
            ))}
          </div>
        ) : genres && genres.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {genres.map((genre: string) => (
              <Link
                key={genre}
                href={DESKTOP_ROUTES.category(genreToSlug(genre))}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-shade-3 to-primary-shade-6 transition-all group-hover:from-primary-shade-4 group-hover:to-primary-shade-7" />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <span
                    className={cn(
                      "text-center text-base text-white md:text-lg",
                      Magnetik_Medium.className,
                    )}
                  >
                    {genre}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className={cn("text-[#361B17]", Magnetik_Medium.className)}>
              No genres available
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
