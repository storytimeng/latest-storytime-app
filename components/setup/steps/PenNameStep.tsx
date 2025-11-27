import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import StepContainer from "../shared/StepContainer";
import type { StepComponentProps } from "../types";

interface PenNameStepProps extends StepComponentProps {
  penName: string;
  penStatus: "idle" | "checking" | "taken" | "available";
  onPenNameChange: (value: string) => void;
  onCheckPenName: () => void;
}

export default function PenNameStep({
  penName,
  penStatus,
  onPenNameChange,
  onCheckPenName,
  onNext,
  canContinue,
  isTransitioning,
}: PenNameStepProps) {
  return (
    <StepContainer
      title="Enter a Pen Name 👋"
      subtitle="A unique Pen Name to make you stand out."
      onNext={onNext}
      canContinue={canContinue}
      isTransitioning={isTransitioning}
      nextButtonText={penStatus === "checking" ? "Checking..." : "Next"}
    >
      <div className="space-y-2">
        <label
          className={`text-primary-colour body-text-small-medium-auto mb-1 ${Magnetik_Medium.className}`}
        >
          Pen Name
        </label>
        <input
          type="text"
          className={`w-full rounded-lg border px-4 py-3 outline-none body-text-small-regular-auto bg-transparent transition-all duration-200 focus:ring-2 focus:ring-primary-colour/20 ${Magnetik_Regular.className} ${
            penStatus === "taken"
              ? "border-danger text-danger focus:border-danger"
              : penStatus === "available"
              ? "border-success text-grey-1 focus:border-success"
              : "border-light-grey-2 text-primary-colour focus:border-primary-colour"
          }`}
          placeholder="Enter Pen Name"
          value={penName}
          onChange={(e) => onPenNameChange(e.target.value)}
          onBlur={onCheckPenName}
          autoComplete="off"
          spellCheck="false"
        />
        {penStatus === "checking" && (
          <p className={`text-grey-2 body-text-small-regular-auto ${Magnetik_Regular.className}`}>
            🔍 Checking availability...
          </p>
        )}
        {penStatus === "taken" && (
          <p className={`text-danger body-text-small-regular-auto ${Magnetik_Regular.className}`}>
            ❌ Pen Name is taken. Please try another.
          </p>
        )}
        {penStatus === "available" && (
          <p className={`text-success body-text-small-regular-auto ${Magnetik_Regular.className}`}>
            ✅ Pen Name is available. Nice!
          </p>
        )}
        {penStatus === "idle" && penName.trim().length >= 3 && (
          <p className={`text-grey-2 body-text-small-regular-auto ${Magnetik_Regular.className}`}>
            💡 Click Next to check availability and continue
          </p>
        )}
        <p className={`text-grey-2 body-text-small-regular-auto ${Magnetik_Regular.className}`}>
          You can use emojis and special characters.
        </p>
      </div>
    </StepContainer>
  );
}
