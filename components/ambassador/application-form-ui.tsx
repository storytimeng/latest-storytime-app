"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib";
import {
  Magnetik_Bold,
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";

export function ApplicationProgressBar({
  step,
  total = 4,
}: {
  step: number;
  total?: number;
}) {
  return (
    <div className="flex gap-2 px-4 pt-2">
      {Array.from({ length: total }).map((_, index) => {
        const segment = index + 1;
        const isActive = segment <= step;
        return (
          <div
            key={segment}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              isActive ? "bg-complimentary-colour" : "bg-accent-shade-3",
            )}
          />
        );
      })}
    </div>
  );
}

export function ApplicationStepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-1">
      <h1
        className={cn(
          Magnetik_Bold.className,
          "text-xl text-primary-colour leading-tight",
        )}
      >
        {title}
      </h1>
      <p
        className={cn(
          Magnetik_Regular.className,
          "text-sm text-grey-2 leading-relaxed",
        )}
      >
        {subtitle}
      </p>
    </div>
  );
}

export function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className={cn(Magnetik_Medium.className, "text-sm text-primary-colour")}>
      {children}
      <span className="text-complimentary-colour ml-0.5">*</span>
    </p>
  );
}

export function HelperText({ children }: { children: React.ReactNode }) {
  return (
    <p className={cn(Magnetik_Regular.className, "text-xs text-grey-3")}>
      {children}
    </p>
  );
}

export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={cn(
        Magnetik_Regular.className,
        "flex items-start gap-1.5 text-xs text-red mt-1",
      )}
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden />
      <span>{message}</span>
    </p>
  );
}

export function FormErrorBanner({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-2xl border border-red/30 bg-red/5 px-4 py-3"
    >
      <p
        className={cn(
          Magnetik_Medium.className,
          "flex items-start gap-2 text-sm text-red",
        )}
      >
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
        <span>{message}</span>
      </p>
    </div>
  );
}

interface OptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  type?: "checkbox" | "radio";
  disabled?: boolean;
  invalid?: boolean;
}

export function OptionCard({
  label,
  description,
  selected,
  onClick,
  type = "checkbox",
  disabled = false,
  invalid = false,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full text-left rounded-2xl border p-4 transition-colors",
        disabled && "opacity-60 cursor-not-allowed",
        invalid && !selected && "border-red",
        selected
          ? "border-complimentary-colour bg-accent-shade-2"
          : "border-grey-4 bg-white",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0",
            selected
              ? "border-complimentary-colour bg-complimentary-colour"
              : "border-grey-3 bg-white",
          )}
          aria-hidden
        >
          {selected && (
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              Magnetik_SemiBold.className,
              "text-sm text-primary-colour",
            )}
          >
            {label}
          </p>
          {description && (
            <p
              className={cn(
                Magnetik_Regular.className,
                "text-xs text-grey-2 mt-1 leading-relaxed",
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      <span className="sr-only">
        {type === "radio" ? "Radio option" : "Checkbox option"}
      </span>
    </button>
  );
}

export function YesNoCards({
  value,
  onChange,
  disabled = false,
  invalid = false,
}: {
  value: "yes" | "no" | null;
  onChange: (value: "yes" | "no") => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  return (
    <div className="space-y-3">
      <OptionCard
        label="Yes"
        selected={value === "yes"}
        onClick={() => onChange("yes")}
        type="radio"
        disabled={disabled}
        invalid={invalid}
      />
      <OptionCard
        label="No"
        selected={value === "no"}
        onClick={() => onChange("no")}
        type="radio"
        disabled={disabled}
        invalid={invalid}
      />
    </div>
  );
}

export function FormTextInput({
  value,
  onChange,
  placeholder,
  focused,
  onFocus,
  onBlur,
  id,
  disabled = false,
  invalid = false,
  errorMessage,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  errorMessage?: string;
}) {
  return (
    <div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        className={cn(
          "w-full rounded-2xl border px-4 py-3 text-sm text-primary-colour bg-white outline-none transition-colors",
          Magnetik_Regular.className,
          disabled && "opacity-60 cursor-not-allowed",
          invalid
            ? "border-red"
            : focused || value
              ? "border-complimentary-colour"
              : "border-grey-4",
        )}
      />
      <FieldError id={id ? `${id}-error` : undefined} message={errorMessage} />
    </div>
  );
}

export function FormTextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  focused,
  onFocus,
  onBlur,
  id,
  disabled = false,
  invalid = false,
  errorMessage,
  maxLength,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  errorMessage?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        className={cn(
          "w-full rounded-2xl border px-4 py-3 text-sm text-primary-colour bg-white outline-none resize-none transition-colors",
          Magnetik_Regular.className,
          disabled && "opacity-60 cursor-not-allowed",
          invalid
            ? "border-red"
            : focused || value
              ? "border-complimentary-colour"
              : "border-grey-4",
        )}
      />
      <FieldError id={id ? `${id}-error` : undefined} message={errorMessage} />
    </div>
  );
}

export function PrimaryFormButton({
  children,
  onClick,
  disabled,
  loading,
  loadingLabel = "Submitting...",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      className={cn(
        "w-full h-12 rounded-full bg-primary-colour text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2",
        Magnetik_SemiBold.className,
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
      {loading ? loadingLabel : children}
    </button>
  );
}
