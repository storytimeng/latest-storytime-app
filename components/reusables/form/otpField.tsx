"use client";
import React, { ChangeEvent, ReactElement } from "react";
import { cn, Magnetik_Medium } from "@/lib";
import { InputOtp } from "@heroui/react";

interface OtpFieldProps {
  label: string;
  id: string;
  variants?: "flat" | "bordered" | "underlined" | "faded";
  isInvalid?: boolean;
  errorMessage?: string;
  size: string;
  startcnt?: string | ReactElement;
  placeholder: string;
  reqValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  minLen?: number;
  maxLen?: number;
  value?: string;
  disabled?: boolean;
  length?: number;
}

const OtpField: React.FC<OtpFieldProps> = ({
  label,
  id,
  isInvalid,
  errorMessage,
  placeholder,
  length,
  onChange,
  variants,
  reqValue,
  required,
  minLen,
  maxLen,
  value,
  disabled,
}) => {
  return (
    <div className="flex flex-col justify-center items-center w-full space-y-1.5">
      <label
        className={cn(
          "mb-2 text-sm text-black text-center",
          Magnetik_Medium.className
        )}
      >
        {label} <sup className="text-danger">{reqValue}</sup>
      </label>
      <InputOtp
        id={id}
        variant={variants || "bordered"}
        aria-label={label}
        size="lg"
        radius="md"
        length={length || 4}
        required={required}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange?.(e.target.value)
        }
        minLength={minLen}
        maxLength={maxLen}
        disabled={disabled}
        value={value}
        isInvalid={isInvalid}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // Prevent the default Enter key behavior
          }
        }}
      />
      {isInvalid && (
        <div className="text-red-500 text-xs text-center">{errorMessage}</div>
      )}
    </div>
  );
};

export default OtpField;
