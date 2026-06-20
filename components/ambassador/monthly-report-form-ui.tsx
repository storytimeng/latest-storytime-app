"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib";
import {
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import {
  FieldError,
  FormTextArea,
  HelperText,
  RequiredLabel,
} from "@/components/ambassador/application-form-ui";

export function FormNumberStepper({
  id,
  value,
  onChange,
  min = 0,
  max = 9999,
  disabled = false,
  invalid = false,
  errorMessage,
}: {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  invalid?: boolean;
  errorMessage?: string;
}) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div>
      <div
        className={cn(
          "flex items-center rounded-2xl border bg-white overflow-hidden",
          invalid ? "border-red" : "border-grey-4",
          disabled && "opacity-60",
        )}
      >
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || value <= min}
          className="w-12 h-12 flex items-center justify-center text-primary-colour disabled:opacity-40"
          aria-label="Decrease value"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10);
            if (Number.isNaN(parsed)) {
              onChange(min);
              return;
            }
            onChange(Math.min(max, Math.max(min, parsed)));
          }}
          className={cn(
            "flex-1 h-12 text-center text-sm text-primary-colour outline-none border-x border-grey-4",
            Magnetik_Medium.className,
          )}
        />
        <button
          type="button"
          onClick={increment}
          disabled={disabled || value >= max}
          className="w-12 h-12 flex items-center justify-center text-primary-colour disabled:opacity-40"
          aria-label="Increase value"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <FieldError id={id ? `${id}-error` : undefined} message={errorMessage} />
    </div>
  );
}

export function CharacterCounter({
  current,
  minimum,
}: {
  current: number;
  minimum: number;
}) {
  const met = current >= minimum;
  return (
    <p
      className={cn(
        Magnetik_Regular.className,
        "text-xs text-right mt-1",
        met ? "text-[#34A853]" : "text-grey-3",
      )}
    >
      {current}/{minimum} characters minimum
    </p>
  );
}

export function MonthlyReportIntroCard() {
  return (
    <div className="rounded-2xl bg-white border border-grey-5 shadow-sm p-5 text-center space-y-2">
      <span className="text-4xl leading-none" aria-hidden>
        📝
      </span>
      <h2
        className={cn(
          Magnetik_SemiBold.className,
          "text-base text-primary-colour",
        )}
      >
        Share Your Impact
      </h2>
      <p className={cn(Magnetik_Regular.className, "text-sm text-grey-2")}>
        Help us understand your contributions this month. This takes about 3
        minutes.
      </p>
    </div>
  );
}

export function MonthlyReportFieldGroup({
  label,
  required = false,
  helper,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {required ? (
        <RequiredLabel>{label}</RequiredLabel>
      ) : (
        <p
          className={cn(
            Magnetik_Medium.className,
            "text-sm text-primary-colour",
          )}
        >
          {label}
        </p>
      )}
      {children}
      {helper && <HelperText>{helper}</HelperText>}
    </div>
  );
}

export { FormTextArea };
