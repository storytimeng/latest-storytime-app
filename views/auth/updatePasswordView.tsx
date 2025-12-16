"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordField } from "@/components/reusables/form";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { showToast } from "@/lib/showNotification";
import { useResetPassword } from "@/src/hooks/useAuth";
import { useAuthStore } from "@/src/stores/useAuthStore";
import PasswordTipsModal from "@/components/reusables/customUI/passwordTipsModal";
import { useLoadingStore } from "@/src/stores/useLoadingStore";
import { Check, X } from "lucide-react";
import Link from "next/link";

interface UpdatePasswordFormData {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
  rememberMe: boolean;
}

interface PasswordRequirement {
  id: string;
  text: string;
  isValid: boolean;
}

// Zod schema for update password validation
const updatePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    rememberMe: z.boolean().optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function UpdatePasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show: showLoading, hide: hideLoading } = useLoadingStore();
  const isFromSettings = searchParams?.get("from") === "settings";

  const [formData, setFormData] = useState<UpdatePasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof UpdatePasswordFormData, string>>
  >({});
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<
    PasswordRequirement[]
  >([
    { id: "uppercase", text: "At least one uppercase letter", isValid: false },
    { id: "lowercase", text: "At least one lowercase letter", isValid: false },
    { id: "length", text: "At least 8 characters", isValid: false },
    { id: "number", text: "At least one number", isValid: false },
    { id: "symbol", text: "At least one symbol", isValid: false },
  ]);

  const validatePasswordRequirements = (password: string) => {
    const requirements = [
      {
        id: "uppercase",
        text: "At least one uppercase letter",
        isValid: /[A-Z]/.test(password),
      },
      {
        id: "lowercase",
        text: "At least one lowercase letter",
        isValid: /[a-z]/.test(password),
      },
      {
        id: "length",
        text: "At least 8 characters",
        isValid: password.length >= 8,
      },
      {
        id: "number",
        text: "At least one number",
        isValid: /\d/.test(password),
      },
      {
        id: "symbol",
        text: "At least one symbol",
        isValid: /[^A-Za-z0-9]/.test(password),
      },
    ];
    setPasswordRequirements(requirements);
  };

  const handleInputChange = (
    field: keyof UpdatePasswordFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Handle password validation
    if (field === "newPassword" && typeof value === "string") {
      validatePasswordRequirements(value);
      if (value.length > 0) {
        setShowPasswordRequirements(true);
      } else {
        setShowPasswordRequirements(false);
      }
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      updatePasswordSchema.parse(formData);
      
      // Additional validation for current password when from settings
      if (isFromSettings && !formData.currentPassword) {
        setErrors({ currentPassword: "Current password is required" });
        showToast({
          type: "error",
          message: "Please enter your current password",
          duration: 3000,
        });
        return false;
      }
      
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof UpdatePasswordFormData, string>> =
          {};
        error.issues.forEach((err) => {
          const fieldName = String(err.path[0]) as keyof UpdatePasswordFormData;
          if (fieldName) {
            newErrors[fieldName] = err.message;
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

  const { trigger: resetTrigger } = useResetPassword();

  const handleSubmit = async () => {
    const isValid = validateForm();
    if (!isValid) return;

    showLoading("Updating your password...");

    try {
      if (isFromSettings) {
        // TODO: When backend adds change password endpoint, use it here
        // For now, show message that user needs to use forgot password flow
        showToast({
          type: "info",
          message: "Please use the Forgot Password link to reset your password",
          duration: 4000,
        });
        hideLoading();
        return;
      }

      // Forgot password flow with OTP
      const { resetEmail: email = "", resetOtp: otp = "" } =
        useAuthStore.getState();

      await resetTrigger({ email, otp, newPassword: formData.newPassword });

      showToast({
        type: "success",
        message: "Password updated",
        duration: 2000,
      });
      router.push("/auth/password-updated");
    } catch (err: any) {
      console.error("Update password error:", err);
      showToast({
        type: "error",
        message: err?.message || "Password reset failed",
        duration: 3000,
      });
      setErrors({ newPassword: "Password update failed" });
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center text-primary-colour body-text-big-bold-auto mb-[4.125rem]">
        {isFromSettings ? "Change your password" : "Update your password"}
      </div>

      {/* Form */}
      <form className="space-y-6">
        {/* Current Password - Only show when from settings */}
        {isFromSettings && (
          <div data-error={!!errors.currentPassword}>
            <PasswordField
              PasswordText="Current Password"
              placeholderText="Current Password"
              passwordError={errors.currentPassword || ""}
              value={formData.currentPassword || ""}
              handlePasswordChange={(value: string) =>
                handleInputChange("currentPassword", value)
              }
              showForgotPassword={false}
              isRequired={true}
            />
          </div>
        )}

        {/* New Password */}
        <div data-error={!!errors.newPassword}>
          <PasswordField
            PasswordText="New Password"
            placeholderText="New Password"
            passwordError={errors.newPassword || ""}
            value={formData.newPassword}
            handlePasswordChange={(value: string) =>
              handleInputChange("newPassword", value)
            }
            showForgotPassword={false}
            isRequired={true}
          />
        </div>

        {/* Confirm Password */}
        <div data-error={!!errors.confirmPassword}>
          <PasswordField
            PasswordText="Confirm Password"
            placeholderText="Confirm Password"
            passwordError={errors.confirmPassword || ""}
            value={formData.confirmPassword}
            handlePasswordChange={(value: string) =>
              handleInputChange("confirmPassword", value)
            }
            showForgotPassword={false}
            isRequired={true}
          />
          {showPasswordRequirements && (
            <div className="mt-3 space-y-2">
              {passwordRequirements.map((req) => (
                <div key={req.id} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      req.isValid ? "bg-primary-colour" : "border border-grey-1"
                    }`}
                  >
                    {req.isValid ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <X className="w-3 h-3 text-grey-1" />
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      req.isValid ? "text-primary-colour" : "text-grey-1"
                    }`}
                  >
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2.5">
          <button
            type="button"
            onClick={() => setShowTipsModal(true)}
            className="text-sm text-grey-2 hover:text-primary-colour body-text-small-regular-auto"
          >
            Tips for creating a stronger password
          </button>
          
          {isFromSettings && (
            <Link
              href="/auth/forgot-password"
              className="text-sm hover:text-grey-1 body-text-small-medium-auto transition-transform-colors text-primary-colour hover:underline"
            >
              Forgot Password?
            </Link>
          )}
        </div>
        
        <div className="pt-36">
          <Button
            variant="large"
            onPress={() => {
              const isValid = validateForm();
              if (isValid) {
                handleSubmit();
              }
            }}
            type="button"
          >
            Update Password
          </Button>
        </div>
      </form>

      {/* Password Tips Modal */}
      <PasswordTipsModal
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
      />
    </div>
  );
}
