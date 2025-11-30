"use client";

import { PageHeader } from "@/components/reusables";
import { useGenres } from "@/src/hooks/useGenres";
import Link from "next/link";

const GenresView = () => {
  const { genres, isLoading } = useGenres();

  return (
    <div className="min-h-screen px-4 pt-4 pb-20 bg-accent-shade-1">
      <PageHeader title="All Genres" showBackButton />

      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-accent-colour animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {genres?.map((genre: string) => (
              <Link
                key={genre}
                href={`/category/${genre.toLowerCase().replace(/\s+/g, "-")}`}
                className="relative h-32 rounded-lg overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-shade-3 to-primary-shade-6 group-hover:from-primary-shade-4 group-hover:to-primary-shade-7 transition-all" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold text-center px-4">
                    {genre}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && (!genres || genres.length === 0) && (
          <div className="text-center py-12">
            <p className="text-grey-2">No genres available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenresView;
