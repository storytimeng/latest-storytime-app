import { Magnetik_Medium, Magnetik_Regular, Magnetik_SemiBold } from "@/lib/font";
import StepContainer from "../shared/StepContainer";
import type { StepComponentProps, TimeValue } from "../types";

interface PreviewStepProps extends StepComponentProps {
  penName: string;
  imagePreview: string | null;
  selectedGenres: string[];
  readTime: TimeValue;
  writeTime: TimeValue;
  writeDaily: boolean;
  writeDays: string[];
  onImagePickerToggle: (show: boolean) => void;
  isSubmitting: boolean;
}

function formatTime(t: TimeValue): string {
  const mm = t.minute.toString().padStart(2, "0");
  return `${t.hour}:${mm} ${t.period}`;
}

export default function PreviewStep({
  penName,
  imagePreview,
  selectedGenres,
  readTime,
  writeTime,
  writeDaily,
  writeDays,
  onImagePickerToggle,
  isSubmitting,
  onNext,
  canContinue,
  isTransitioning,
}: PreviewStepProps) {
  return (
    <StepContainer
      title="Preview"
      subtitle="You can always edit this in your profile"
      onNext={onNext}
      canContinue={canContinue}
      isTransitioning={isTransitioning}
      nextButtonText={isSubmitting ? "Submitting..." : "Submit"}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-accent-shade-1">
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-colour">
              👤
            </div>
          )}
        </div>
        <button
          type="button"
          className={`text-primary-colour text-[12px] hover:text-primary-shade-6 transition-colors duration-200 ${Magnetik_Medium.className}`}
          onClick={() => onImagePickerToggle(true)}
        >
          Tap to change
        </button>
        <div className="w-full space-y-3">
          <div>
            <label
              className={`body-text-small-regular-auto text-primary-colour ${Magnetik_SemiBold.className}`}
            >
              Pen Name
            </label>
            <div
              className={`border border-light-grey-2 rounded-lg px-4 py-3 body-text-small-regular-auto ${Magnetik_Regular.className}`}
            >
              {penName || "—"}
            </div>
          </div>
          <div>
            <label
              className={`body-text-small-regular-auto text-primary-colour ${Magnetik_SemiBold.className}`}
            >
              Genre
            </label>
            <div className="grid grid-cols-3 gap-3 mt-1">
              {selectedGenres.map((g) => (
                <div
                  key={g}
                  className={`relative whitespace-nowrap flex-shrink-0 px-2 py-1 rounded-lg min-w-[70px] text-center transition-all duration-200 ease-in-out shadow-lg text-xs ${Magnetik_Regular.className}`}
                  style={{
                    backgroundImage: `repeating-linear-gradient(-45deg, #f89a28, #f89a28 18px, #ec8e1c 18px, #ec8e1c 36px)`,
                    color: "white",
                    border: "2px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 8px 20px -8px rgba(0,0,0,0.2)",
                    fontWeight: 300,
                  }}
                >
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-white"
                    style={{ border: "2px solid #f28a20" }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="#f28a20"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="relative z-10">{g}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label
                className={`body-text-small-regular-auto text-primary-colour ${Magnetik_SemiBold.className}`}
              >
                Time to read
              </label>
              <div
                className={`border border-light-grey-2 rounded-lg px-4 py-3 body-text-small-regular-auto ${Magnetik_Regular.className}`}
              >
                {formatTime(readTime)}
              </div>
            </div>
            <div>
              <label
                className={`body-text-small-regular-auto text-primary-colour ${Magnetik_SemiBold.className}`}
              >
                Time to write
              </label>
              <div
                className={`border border-light-grey-2 rounded-lg px-4 py-3 body-text-small-regular-auto ${Magnetik_Regular.className}`}
              >
                {formatTime(writeTime)}{" "}
                {writeDaily
                  ? "— Daily"
                  : writeDays.length
                  ? `— ${writeDays.join(", ")}`
                  : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StepContainer>
  );
}
