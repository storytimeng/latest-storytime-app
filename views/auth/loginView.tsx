"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField, PasswordField } from "@/components/reusables/form";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { showToast } from "@/lib/showNotification";
import LoadingOverlay from "@/components/reusables/customUI/loadingOverlay";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Create zod schema for login validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export default function LoginView() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const handleInputChange = (
    field: keyof LoginFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<LoginFormData> = {};
        error.issues.forEach((err) => {
          const fieldName = String(err.path[0]);
          if (fieldName === "email") {
            newErrors.email = err.message;
          } else if (fieldName === "password") {
            newErrors.password = err.message;
          }
        });
        setErrors(newErrors);

        // Show toast notification
        showToast({
          type: "error",
          message: "Please fix the errors below",
          duration: 3000,
        });

        // Auto scroll to first error
        setTimeout(() => {
          const firstErrorElement = document.querySelector(
            '[data-error="true"]'
          ) as HTMLElement;
          if (firstErrorElement) {
            firstErrorElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to onboarding or dashboard
      router.push("/app");
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ email: "Invalid email or password" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center text-primary-colour body-text-big-bold-auto mb-[4.125rem]">
        Login to continue to Storytime
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Address or Pen Name */}
        <div data-error={!!errors.email}>
          <FormField
            label="Email Address or Pen Name"
            type="email"
            id="email"
            size="lg"
            value={formData.email || ""}
            onValueChange={(value: string) => handleInputChange("email", value)}
            errorMessage={errors.email || ""}
            isInvalid={!!errors.email}
            placeholder="Email address or Pen Name"
            isRequired={true}
          />
        </div>

        {/* Password */}
        <div data-error={!!errors.password}>
          <PasswordField
            PasswordText="Password"
            placeholderText="Password"
            passwordError={errors.password || ""}
            value={formData.password}
            handlePasswordChange={(value: string) =>
              handleInputChange("password", value)
            }
            showForgotPassword={false}
            isRequired={true}
          />
        </div>

        {/* Remember Me and Forgot Password */}
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={(e) =>
                handleInputChange("rememberMe", e.target.checked)
              }
              className="w-4 h-4 text-primary-colour checked:bg-primary-colour bg-universal-white border-light-grey-2 rounded focus:ring-primary-colour focus:ring-2"
            />
            <label
              htmlFor="rememberMe"
              className="body-text-small-regular text-grey-2"
            >
              Keep me logged in
            </label>
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-sm hover:text-grey-1 body-text-small-medium-auto  transition-transform-colors text-primary-colour hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </form>

      {/* Divider */}
      <div className="flex items-center my-5">
        <div className="flex-1 border-t border-light-grey-1"></div>
        <div className="px-4 body-text-small-regular text-[#708090] body-text-small-auto-regular">
          or
        </div>
        <div className="flex-1 border-t border-light-grey-1"></div>
      </div>

      {/* Social Login */}
      <div className="space-y-3">
        <Button
          variant="google"
          startContent={<div className="w-5 h-5 bg-grey-1 rounded"></div>}
        >
          Continue with Google
        </Button>
      </div>
      <Button
        variant="large"
        onPress={() => {
          const isValid = validateForm();
          if (isValid) {
            handleSubmit();
          }
        }}
        type="button"
        disabled={isLoading}
      >
        {isLoading ? "Signing In..." : "Continue"}
      </Button>

      {/* Signup Link */}
      <div className="text-center mt-4">
        <p className="body-text-small-medium-auto ">
          Have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-primary-colour  hover:underline font-medium body-text-small-regular-auto"
          >
            Sign Up
          </Link>
        </p>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isLoading} message="Logging you in..." />
    </div>
  );
}
