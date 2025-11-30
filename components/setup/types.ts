export type Period = "AM" | "PM";

export interface TimeValue {
  hour: number; // 1-12
  minute: number; // 0-59
  period: Period;
}

export type AnimationDirection = "forward" | "backward";

export type PenNameStatus = "idle" | "checking" | "taken" | "available";

export type DayPreset = "Mon to Fri" | "Custom";

export interface SetupFormData {
  penName: string;
  penStatus: PenNameStatus;
  imagePreview: string | null;
  selectedGenres: string[];
  readTime: TimeValue;
  writeTime: TimeValue;
  writeDaily: boolean;
  writeDays: string[];
  dayPreset: DayPreset;
}

export interface StepComponentProps {
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  canContinue: boolean;
  isTransitioning: boolean;
}

export interface TimePickerProps {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
}

export interface DaySelectorProps {
  writeDaily: boolean;
  writeDays: string[];
  dayPreset: DayPreset;
  onDailyChange: (daily: boolean) => void;
  onDaysChange: (days: string[]) => void;
  onPresetChange: (preset: DayPreset) => void;
}
