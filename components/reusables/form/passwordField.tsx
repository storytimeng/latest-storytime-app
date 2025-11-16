"use client";
import React, { useState } from "react";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { Input } from "@heroui/react";
import Link from "next/link";

interface PasswordInputProps {
  PasswordText: string;
  placeholderText: string;
  passwordError: string | null;
  handlePasswordChange: (value: string) => void;
  showForgotPassword?: boolean;
  forgotPasswordLink?: string;
  value?: string;
  isRequired?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "flat" | "bordered" | "faded" | "underlined";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
}

const PasswordField: React.FC<PasswordInputProps> = ({
  passwordError,
  handlePasswordChange,
  PasswordText,
  placeholderText,
  showForgotPassword = false,
  forgotPasswordLink,
  value = "",
  isRequired = false,
  size = "lg",
  variant = "bordered",
  color = "default",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Create error message with icon
  const getErrorMessage = () => {
    if (!passwordError) return "";

    return (
      <div className="flex items-center gap-1 mt-1">
        <AlertCircle className="w-4 h-4 text-red flex-shrink-0" />
        <span className="text-red text-xs">{passwordError}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <div className="w-full">
        <Input
          label={PasswordText}
          labelPlacement={"outside"}
          placeholder={placeholderText}
          variant={variant}
          size={size}
          color={passwordError ? "danger" : color}
          value={value}
          isRequired={isRequired}
          isInvalid={!!passwordError}
          onValueChange={handlePasswordChange}
          type={isVisible ? "text" : "password"}
          classNames={{
            label: "mb-2 text-sm body-text-small-medium-auto text-grey-2",
            input: "text-grey-2 placeholder:text-grey-1",
            inputWrapper: [
              passwordError
                ? "border-red hover:border-red data-[hover=true]:border-red group-data-[focus=true]:border-red"
                : "border-light-grey-2 hover:border-primary-colour data-[hover=true]:border-primary-colour group-data-[focus=true]:border-primary-colour",
              "!cursor-text",
              "rounded-lg",
            ],
            errorMessage: "hidden", // We'll handle error display ourselves
          }}
          startContent={<Lock className="text-grey-1 w-5 h-5" />}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide password" : "Show password"}
            >
              {isVisible ? (
                <EyeOff className="text-2xl text-grey-1 pointer-events-none scale-y-[-1]" />
              ) : (
                <Eye className="text-2xl text-grey-1 pointer-events-none " />
              )}
            </button>
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        />
        {/* Custom error message with icon */}
        {passwordError && getErrorMessage()}
      </div>

      {/* Forgot password link - positioned below the input */}
      {showForgotPassword && (
        <div className="flex justify-end">
          <Link
            href={forgotPasswordLink || "/auth/forgot-password"}
            className="text-sm text-grey-1 hover:text-primary-colour underline"
          >
            Forgot password?
          </Link>
        </div>
      )}
    </div>
  );
};

export default PasswordField;
