import GenreButton from "@/components/reusables/customUI/GenreButton";
import StepContainer from "../shared/StepContainer";
import { ALL_GENRES } from "@/config/setup";
import type { StepComponentProps } from "../types";

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
  return (
    <StepContainer
      title="Select Favourite Genre 👋"
      subtitle="Choose the genres you love to read. This will help us recommend the best stories for you."
      onNext={onNext}
      canContinue={canContinue}
      isTransitioning={isTransitioning}
    >
      <div className="grid grid-cols-3 gap-3">
        {ALL_GENRES.map((genre) => (
          <GenreButton
            key={genre}
            genre={genre}
            isSelected={selectedGenres.includes(genre)}
            onClick={() => onToggleGenre(genre)}
          />
        ))}
      </div>
    </StepContainer>
  );
}
