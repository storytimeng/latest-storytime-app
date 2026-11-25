"use client";

import { useState, useEffect } from "react";
import { Link } from "@/components/AppLink";
import { useRouter } from "next/navigation";
import { FormField, PasswordField } from "@/components/reusables/form";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { showToast } from "@/lib/showNotification";
import { useLogin } from "@/src/hooks/useAuth";
import { useLoadingStore } from "@/src/stores/useLoadingStore";
import {
  getRememberMePreference,
  setRememberMePreference,
  setAuthToken,
} from "@/src/stores/useAuthStore";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/+$/, "");

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Create zod schema for login validation
const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

interface LoginViewProps {
  onSuccess?: () => void;
  onSwitchView?: (view: string) => void;
}

export default function LoginView({ onSuccess, onSwitchView }: LoginViewProps) {
  const router = useRouter();
  const { show: showLoading, hide: hideLoading } = useLoadingStore();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [twoFactorEmail, setTwoFactorEmail] = useState<string | null>(null);
  const [twoFactorOtp, setTwoFactorOtp] = useState("");

  useEffect(() => {
    router.prefetch("/home");
    setFormData((prev) => ({
      ...prev,
      rememberMe: getRememberMePreference(),
    }));
  }, [router]);

  const handleInputChange = (
    field: keyof LoginFormData,
    value: string | boolean,
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
            '[data-error="true"]',
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

  const completeLoginSession = async () => {
    try {
      const { usersControllerGetProfile } = await import(
        "@/src/client/sdk.gen"
      );
      const { useUserStore } = await import("@/src/stores/useUserStore");
      const profileResponse = await usersControllerGetProfile();
      if (profileResponse.data) {
        const payload = profileResponse.data as any;
        const user = payload?.user ?? payload?.data?.user;
        if (user) {
          useUserStore.getState().setUser(user);
        }
      }
    } catch (profileError) {
      console.error("Failed to fetch profile:", profileError);
    }

    showToast({ type: "success", message: "Signed in", duration: 1500 });
    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/home");
    }
  };

  const handleVerifyTwoFactor = async () => {
    if (!twoFactorEmail || !twoFactorOtp.trim()) {
      showToast({ type: "error", message: "Enter the 6-digit code sent to your email" });
      return;
    }

    showLoading("Verifying code...", {
      cancellable: true,
      onCancel: () => hideLoading(),
    });
    try {
      const res = await fetch(`${API_BASE}/auth/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: twoFactorEmail,
          otp: twoFactorOtp.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "Invalid verification code");
      }
      const payload = json?.data ?? json;
      if (payload?.accessToken) {
        setRememberMePreference(Boolean(formData.rememberMe));
        setAuthToken(payload.accessToken, payload.refreshToken);
      }
      await completeLoginSession();
    } catch (err: any) {
      showToast({
        type: "error",
        message: err?.message || "Verification failed",
        duration: 3000,
      });
    } finally {
      hideLoading();
    }
  };

  const handleSubmit = async () => {
    const isValid = validateForm();
    if (!isValid) return;

    showLoading("Logging you in...", {
      cancellable: true,
      onCancel: () => hideLoading(),
    });
    try {
      const data: any = await loginTrigger({
        emailOrPenName: formData.email,
        password: formData.password,
        remember: formData.rememberMe,
      });

      const payload = data?.data ?? data;
      if (payload?.requiresTwoFactor && payload?.email) {
        setTwoFactorEmail(payload.email);
        showToast({
          type: "info",
          message: "Enter the 6-digit verification code sent to your email",
          duration: 4000,
        });
        return;
      }

      await completeLoginSession();
    } catch (err: any) {
      hideLoading();

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

  if (twoFactorEmail) {
    return (
      <div className="space-y-6 mx-auto w-full max-w-md">
        <div className="body-text-big-bold-auto text-primary-colour text-center">
          Two-Factor Verification
        </div>
        <p className="text-grey-2 text-sm text-center">
          Enter the 6-digit code sent to <span className="font-medium text-primary-colour">{twoFactorEmail}</span>
        </p>
        <FormField
          label="Verification Code"
          type="text"
          id="twoFactorOtp"
          name="twoFactorOtp"
          size="lg"
          value={twoFactorOtp}
          onValueChange={(value: string) => setTwoFactorOtp(value)}
          placeholder="123456"
          isRequired={true}
        />
        <Button variant="large" onPress={handleVerifyTwoFactor} type="button">
          Verify & Continue
        </Button>
        <button
          type="button"
          onClick={() => {
            setTwoFactorEmail(null);
            setTwoFactorOtp("");
          }}
          className="w-full text-primary-colour text-sm text-center hover:underline"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-[4.125rem] body-text-big-bold-auto text-primary-colour text-center">
        Login to continue to Storytime
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Address or Pen Name */}
        <div data-error={!!errors.email}>
          <FormField
            label="Email Address or Pen Name"
            type="text"
            id="email"
            name="email"
            autoComplete="username"
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
            name="password"
            autoComplete="current-password"
            handlePasswordChange={(value: string) =>
              handleInputChange("password", value)
            }
            showForgotPassword={false}
            isRequired={true}
          />
        </div>

        {/* Remember Me and Forgot Password */}
        <div className="flex justify-between items-center mt-2.5">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={(e) =>
                handleInputChange("rememberMe", e.target.checked)
              }
              className="bg-universal-white checked:bg-primary-colour border-light-grey-2 rounded focus:ring-2 focus:ring-primary-colour w-4 h-4 text-primary-colour"
            />
            <label
              htmlFor="rememberMe"
              className="body-text-small-regular text-grey-2"
            >
              Keep me logged in
            </label>
          </div>
          {onSwitchView ? (
            <button
              type="button"
              onClick={() => onSwitchView("forgot-password")}
              className="body-text-small-medium-auto text-primary-colour hover:text-grey-1 text-sm hover:underline transition-transform-colors"
            >
              Forgot password?
            </button>
          ) : (
            <Link
              href="/auth/forgot-password"
              className="body-text-small-medium-auto text-primary-colour hover:text-grey-1 text-sm hover:underline transition-transform-colors"
            >
              Forgot password?
            </Link>
          )}
        </div>
      </form>

      <div className="invisible flex items-center my-5">
        <div className="flex-1 border-accent-color border-t"></div>
        <div className="px-4 body-text-small-auto-regular body-text-small-regular text-[#708090]">
          or
        </div>
        <div className="flex-1 border-accent-color border-t"></div>
      </div>

      <div className="space-y-3">
        <Button
          variant="google"
          startContent={<div className="bg-grey-1 rounded w-5 h-5"></div>}
          className="invisible"
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
        <p className="body-text-small-medium-auto">
          Have an account?{" "}
          {onSwitchView ? (
            <button
              onClick={() => onSwitchView("signup")}
              className="font-medium body-text-small-regular-auto text-primary-colour hover:underline"
            >
              Sign Up
            </button>
          ) : (
            <Link
              href="/auth/signup"
              className="font-medium body-text-small-regular-auto text-primary-colour hover:underline"
            >
              Sign Up
            </Link>
          )}
        </p>
      </div>

      {/* Terms and Privacy Footer */}
      <div className="flex justify-center items-center gap-4 mt-8 text-[10px] text-primary-colour/40">
        <Link
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary-colour hover:underline underline-offset-2 transition-colors"
        >
          Terms of Service
        </Link>
        <div className="bg-primary-colour/20 rounded-full w-1 h-1" />
        <Link
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary-colour hover:underline underline-offset-2 transition-colors"
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
