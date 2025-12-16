"use client";

import React, { useState, useEffect } from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { Button } from "@heroui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useUpdateProfile } from "@/src/hooks/useUpdateProfile";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { useGenres } from "@/src/hooks/useGenres";
import { GENRES } from "@/types/story";
import { cn } from "@/lib/utils";
import GenreButton from "../GenreButton";

export const EditGenresModal = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserProfile();
  const { updateProfile, isUpdating } = useUpdateProfile();
  const { genres: apiGenres, isLoading: isLoadingGenres } = useGenres();

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setSelectedGenres(user.favoriteGenres || user.genres || []);
    }
  }, [user]);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre);
      } else {
        if (prev.length >= 5) return prev; // Limit to 5
        return [...prev, genre];
      }
    });
  };

  const handleSave = async () => {
    const success = await updateProfile({
      genres: selectedGenres,
    });

    if (success) {
      handleClose();
    }
  };

  const displayGenres = apiGenres && apiGenres.length > 0 ? apiGenres : GENRES;

  return (
    <>
      <ModalHeader className="flex flex-col gap-1 pb-4">
        <h2 className={`text-xl text-center ${Magnetik_Bold.className}`}>
          Edit Genres
        </h2>
      </ModalHeader>
      <ModalBody className="pb-6 overflow-y-auto">
        <div className="space-y-6 pb-10">
          <div>
            <p className={`text-center text-grey-3 mb-4 ${Magnetik_Regular.className}`}>
              Select up to 5 genres that you enjoy reading.
            </p>
            {isLoadingGenres ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-colour"></div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {displayGenres.map((genre: string) => {
                  const isSelected = selectedGenres.includes(genre);
                  
                  if (isSelected) {
                    return (
                      <GenreButton
                        key={genre}
                        genre={genre}
                        isSelected={true}
                        onClick={() => toggleGenre(genre)}
                      />
                    );
                  }

                  return (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={cn(
                        "px-4 py-2 rounded-lg min-w-[96px] text-center text-sm transition-all",
                        Magnetik_Medium.className,
                        "bg-grey-5 text-primary-colour hover:bg-grey-4 border border-transparent"
                      )}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="bordered"
              className="flex-1 border-2 border-primary-colour h-14"
              onClick={handleClose}
            >
              <span className={Magnetik_Medium.className}>Cancel</span>
            </Button>
            <Button
              className="flex-1 bg-primary-colour text-white h-14"
              onClick={handleSave}
              isLoading={isUpdating}
            >
              <span className={Magnetik_Medium.className}>Save</span>
            </Button>
          </div>
        </div>
      </ModalBody>
    </>
  );
};
