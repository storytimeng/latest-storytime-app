"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField, PasswordField } from "@/components/reusables/form";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { showToast } from "@/lib/showNotification";
import { useLogin } from "@/src/hooks/useAuth";
import { useLoadingStore } from "@/src/stores/useLoadingStore";

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
  const { show: showLoading, hide: hideLoading } = useLoadingStore();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
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

  const {
    trigger: loginTrigger,
    isMutating: isLoggingIn,
    error: loginError,
  } = useLogin();

  const handleSubmit = async () => {
    const isValid = validateForm();
    if (!isValid) return;

    showLoading("Logging you in...");
    try {
      const data = await loginTrigger({
        emailOrPenName: formData.email,
        password: formData.password,
        remember: formData.rememberMe,
      });

      // Fetch and store user profile
      try {
        const { usersControllerGetProfile } = await import("@/src/client/sdk.gen");
        const { useUserStore } = await import("@/src/stores/useUserStore");
        console.log("Fetching user profile...");
        const profileResponse = await usersControllerGetProfile();
        console.log("Profile response:", profileResponse);
        
        if (profileResponse.data) {
          console.log("Setting user profile in store:", profileResponse.data);
          useUserStore.getState().setUser(profileResponse.data as any);
        } else {
          console.warn("Profile response has no data");
        }
      } catch (profileError) {
        console.error("Failed to fetch profile:", profileError);
        // Continue to home even if profile fetch fails, 
        // the useUserProfile hook will try again later
      }

      showToast({ type: "success", message: "Signed in", duration: 1500 });
      router.push("/home");
    } catch (err: any) {
      console.error("Login error:", err);
      setErrors({ email: "Invalid email or password" });
      showToast({
        type: "error",
        message: err?.message || "Login failed",
        duration: 3000,
      });
    } finally {
      hideLoading();
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
              className="w-4 h-4 rounded text-primary-colour checked:bg-primary-colour bg-universal-white border-light-grey-2 focus:ring-primary-colour focus:ring-2"
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
            className="text-sm hover:text-grey-1 body-text-small-medium-auto transition-transform-colors text-primary-colour hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </form>

      {/* Divider */}
      <div className="flex items-center my-5">
        <div className="flex-1 border-t border-accent-color"></div>
        <div className="px-4 body-text-small-regular text-[#708090] body-text-small-auto-regular">
          or
        </div>
        <div className="flex-1 border-t border-accent-color"></div>
      </div>

      {/* Social Login */}
      <div className="space-y-3">
        <Button
          variant="google"
          startContent={<div className="w-5 h-5 rounded bg-grey-1"></div>}
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
      >
        Continue
      </Button>

      {/* Signup Link */}
      <div className="mt-4 text-center">
        <p className="body-text-small-medium-auto ">
          Have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-primary-colour hover:underline body-text-small-regular-auto"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
