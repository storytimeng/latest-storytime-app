import { Button } from "@/components/ui/button";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";
import type { StepComponentProps } from "../types";

interface StepContainerProps extends StepComponentProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showSkip?: boolean;
  showBack?: boolean;
  nextButtonText?: string;
}

export default function StepContainer({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  onSkip,
  canContinue,
  isTransitioning,
  showSkip = false,
  showBack = false,
  nextButtonText = "Next",
}: StepContainerProps) {
  return (
    <div className="px-4 pt-6">
      <h2 className={`text-xl text-primary-colour mb-1 ${Magnetik_Bold.className}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-grey-3 body-text-small-medium-auto mb-6 ${Magnetik_Regular.className}`}>
          {subtitle}
        </p>
      )}
      
      {children}

      <div className="mt-8 space-y-2">
        <Button
          className={`w-full py-4 rounded-lg transition-all duration-200 ${
            canContinue && !isTransitioning
              ? "bg-primary-colour hover:bg-primary-shade-6 text-universal-white shadow-md hover:shadow-lg"
              : "bg-light-grey-2 text-grey-1 cursor-not-allowed"
          }`}
          disabled={!canContinue || isTransitioning}
          onClick={onNext}
        >
          {nextButtonText}
        </Button>

        {showSkip && onSkip && (
          <button
            className={`w-full text-grey-2 mt-2 body-text-small-medium-auto hover:text-primary-colour transition-colors duration-200 ${Magnetik_Regular.className}`}
            onClick={onSkip}
          >
            Skip
          </button>
        )}

        {showBack && onBack && (
          <button
            className={`w-full text-grey-2 mt-2 body-text-small-medium-auto hover:text-primary-colour transition-colors duration-200 ${Magnetik_Regular.className}`}
            onClick={onBack}
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
