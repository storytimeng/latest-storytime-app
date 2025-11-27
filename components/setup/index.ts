// Barrel export for all setup components
export { default as SetupProgress } from "./SetupProgress";

// Step components
export { default as PenNameStep } from "./steps/PenNameStep";
export { default as ProfilePictureStep } from "./steps/ProfilePictureStep";
export { default as GenresStep } from "./steps/GenresStep";
export { default as ReadTimeStep } from "./steps/ReadTimeStep";
export { default as WriteTimeStep } from "./steps/WriteTimeStep";
export { default as PreviewStep } from "./steps/PreviewStep";
export { default as CompletionStep } from "./steps/CompletionStep";

// Shared components
export { default as TimePicker } from "./shared/TimePicker";
export { default as DaySelector } from "./shared/DaySelector";
export { default as ImagePickerModal } from "./shared/ImagePickerModal";
export { default as ImagePreviewModal } from "./shared/ImagePreviewModal";
export { default as StepContainer } from "./shared/StepContainer";

// Types
export * from "./types";
