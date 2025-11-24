"use client";
import { Input, InputProps } from "@heroui/input";
import React, { ReactElement } from "react";
import { User, AlertCircle } from "lucide-react";
import { cn } from "@/lib";

interface FormFieldProps {
  label?: string;
  type: string;
  id: string;
  variant?: "flat" | "bordered" | "faded" | "underlined";
  isInvalid?: boolean;
  errorMessage?: string;
  size?: "sm" | "md" | "lg";
  startContent?: string | ReactElement;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  isRequired?: boolean;
  minLen?: number;
  maxLen?: number;
  value?: string | number;
  disabled?: boolean;
  color?: "danger" | "success" | "default";
  className?: string;
  classNames?: InputProps["classNames"] | undefined;
}

const FormField: React.FC<FormFieldProps> = (props) => {
  const {
    label,
    type,
    id,
    isInvalid,
    errorMessage,
    placeholder,
    startContent,
    onValueChange,
    isRequired,
    minLen,
    maxLen,
    value,
    disabled,
    color = "default",
    size,
    variant,
    className,
    classNames,
  } = props;

  // Auto-detect icon based on field type and id
  const getStartContent = () => {
    if (startContent) return startContent;

    if (
      type === "email" ||
      id === "email" ||
      placeholder?.toLowerCase().includes("email")
    ) {
      return <User className="w-5 h-5 text-grey-1" />;
    }

    return null;
  };

  // Create error message with icon
  const getErrorMessage = () => {
    if (!errorMessage) return "";

    return (
      <div
        className="flex items-center gap-1 mt-1"
        id={`${id}-error`}
        role="alert"
        aria-live="polite"
      >
        <AlertCircle
          className="flex-shrink-0 w-4 h-4 text-red"
          aria-hidden="true"
        />
        <span className="text-xs text-red">{errorMessage}</span>
      </div>
    );
  };

  return (
    <div className="w-full">
      <Input
        label={label}
        labelPlacement={"outside"}
        type={type}
        id={id}
        variant={variant || "bordered"}
        className={cn("w-full", className)}
        classNames={{
          label: cn(
            "mb-2 text-sm body-text-small-medium-auto text-grey-2",
            classNames?.label
          ),
          input: cn("text-grey-2 placeholder:text-grey-1", classNames?.input),
          inputWrapper: [
            isInvalid
              ? "border-red hover:border-red data-[hover=true]:border-red group-data-[focus=true]:border-red"
              : "border-light-grey-2 hover:border-primary-colour data-[hover=true]:border-primary-colour group-data-[focus=true]:border-primary-colour",
            "!cursor-text",
            "rounded-lg",
            ,
            classNames?.inputWrapper,
          ],
          errorMessage: cn("hidden", classNames?.errorMessage), // We'll handle error display ourselves
        }}
        color={isInvalid ? "danger" : color}
        isInvalid={isInvalid}
        aria-label={label || placeholder}
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        aria-invalid={isInvalid}
        size={size || "lg"}
        radius="md"
        isRequired={isRequired}
        placeholder={placeholder}
        startContent={getStartContent()}
        onValueChange={onValueChange}
        minLength={minLen}
        maxLength={maxLen}
        disabled={disabled}
        value={value ? String(value) : undefined}
      />
      {/* Custom error message with icon */}
      {isInvalid && errorMessage && getErrorMessage()}
    </div>
  );
};

export default FormField;
