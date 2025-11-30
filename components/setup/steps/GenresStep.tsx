"use client";

import GenreButton from "@/components/reusables/customUI/GenreButton";
import StepContainer from "../shared/StepContainer";
import { ALL_GENRES } from "@/config/setup";
import type { StepComponentProps } from "../types";
import { useGenres } from "@/src/hooks/useGenres";

interface GenresStepProps extends StepComponentProps {
  selectedGenres: string[];
  onToggleGenre: (genre: string) => void;
}

export default function GenresStep({
  selectedGenres,
  onToggleGenre,
  onNext,
  canContinue,
  isTransitioning,
}: GenresStepProps) {
  const { genres, isLoading, error } = useGenres();
  
  // Use API genres if available, otherwise fallback to hardcoded list
  const availableGenres = genres || ALL_GENRES;

  return (
    <StepContainer
      title="Select Favourite Genre 👋"
      subtitle="Choose the genres you love to read. This will help us recommend the best stories for you."
      onNext={onNext}
      canContinue={canContinue}
      isTransitioning={isTransitioning}
    >
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-light-grey-2 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {availableGenres.map((genre: string) => (
            <GenreButton
              key={genre}
              genre={genre}
              isSelected={selectedGenres.includes(genre)}
              onClick={() => onToggleGenre(genre)}
            />
          ))}
        </div>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-500">
          Failed to load genres. Using default list.
        </p>
      )}
    </StepContainer>
  );
}
