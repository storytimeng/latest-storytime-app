import { Magnetik_Regular } from "@/lib/font";
import StepContainer from "../shared/StepContainer";
import TimePicker from "../shared/TimePicker";
import DaySelector from "../shared/DaySelector";
import type { StepComponentProps, TimeValue, DayPreset } from "../types";

interface WriteTimeStepProps extends StepComponentProps {
  writeTime: TimeValue;
  writeDaily: boolean;
  writeDays: string[];
  dayPreset: DayPreset;
  onWriteTimeChange: (time: TimeValue) => void;
  onDailyChange: (daily: boolean) => void;
  onDaysChange: (days: string[]) => void;
  onPresetChange: (preset: DayPreset) => void;
}

export default function WriteTimeStep({
  writeTime,
  writeDaily,
  writeDays,
  dayPreset,
  onWriteTimeChange,
  onDailyChange,
  onDaysChange,
  onPresetChange,
  onNext,
  onSkip,
  canContinue,
  isTransitioning,
}: WriteTimeStepProps) {
  return (
    <StepContainer
      title="Select best time to write 👋"
      subtitle="Kindly select the best time to write. We will always send you a reminder."
      onNext={onNext}
      onSkip={onSkip}
      canContinue={canContinue}
      isTransitioning={isTransitioning}
      showSkip
    >
      <div className="flex items-center justify-center py-4">
        <TimePicker value={writeTime} onChange={onWriteTimeChange} />
      </div>

      <DaySelector
        writeDaily={writeDaily}
        writeDays={writeDays}
        dayPreset={dayPreset}
        onDailyChange={onDailyChange}
        onDaysChange={onDaysChange}
        onPresetChange={onPresetChange}
      />

      <p className={`text-grey-2 body-text-small-regular-auto mt-6 ${Magnetik_Regular.className}`}>
        Note: You will always get a reminder
      </p>
    </StepContainer>
  );
}
