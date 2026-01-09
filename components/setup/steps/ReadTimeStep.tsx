import { Magnetik_Regular } from "@/lib/font";
import StepContainer from "../shared/StepContainer";
import { TimePicker } from "@/components/reusables/customUI/TimePicker";
import type { StepComponentProps, TimeValue } from "../types";

interface ReadTimeStepProps extends StepComponentProps {
  readTime: TimeValue;
  onReadTimeChange: (time: TimeValue) => void;
}

export default function ReadTimeStep({
  readTime,
  onReadTimeChange,
  onNext,
  canContinue,
  isTransitioning,
}: ReadTimeStepProps) {
  return (
    <StepContainer
      title="Select best time to read 👋"
      subtitle="Kindly select the best time to read. We will always send you a reminder."
      onNext={onNext}
      canContinue={canContinue}
      isTransitioning={isTransitioning}
    >
      <div className="flex items-center justify-center py-6">
        <TimePicker value={readTime} onChange={onReadTimeChange} />
      </div>
      <p className={`text-grey-2 body-text-small-regular-auto mt-6 text-center ${Magnetik_Regular.className}`}>
        Note: You will always get a reminder
      </p>
    </StepContainer>
  );
}
