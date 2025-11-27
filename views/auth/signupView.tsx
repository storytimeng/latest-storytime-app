"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField, PasswordField } from "@/components/reusables/form";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { showToast } from "@/lib/showNotification";
import { useRegister } from "@/src/hooks/useAuth";
import { Check, X } from "lucide-react";
import LoadingOverlay from "@/components/reusables/customUI/loadingOverlay";
import { Select, SelectItem } from "@heroui/select";

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  password: string;
  agreeToTerms: boolean;
}

interface PasswordRequirement {
  id: string;
  text: string;
  isValid: boolean;
}

// Zod schema for signup validation
const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  birthYear: z.string().min(1, "Birth year is required"),
  birthMonth: z.string().min(1, "Birth month is required"),
  birthDay: z.string().min(1, "Birth day is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

export default function SignupView() {
  const router = useRouter();
  // firstErrorRef removed (not used)
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    password: "",
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupFormData, string>>
  >({});
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

  // Generate years (18 years ago to 100 years ago)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 83 }, (_, i) => currentYear - 18 - i);

  // Generate months
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Generate days
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

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
    field: keyof SignupFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Special handling for password field
    if (field === "password" && typeof value === "string") {
      validatePasswordRequirements(value);
      if (value) {
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
      signupSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof SignupFormData, string>> = {};
        error.issues.forEach((err) => {
          const fieldName = String(err.path[0]) as keyof SignupFormData;
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

  const { trigger: registerTrigger } = useRegister();

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const body = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        dateOfBirth: `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`,
        password: formData.password,
        agreement: formData.agreeToTerms,
      };

      await registerTrigger(body);

      showToast({
        type: "success",
        message: "Account created — check your email",
        duration: 3000,
      });
      router.push(
        `/auth/otp?email=${encodeURIComponent(formData.email)}&type=signup`
      );
    } catch (err: any) {
      console.error("Signup error:", err);
      showToast({
        type: "error",
        message: err?.message || "Signup failed",
        duration: 3000,
      });
      setErrors({ email: "Email already exists or signup failed" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-10 text-center text-primary-colour body-text-big-bold-auto">
        Sign up to continue to Storytime
      </div>

      {/* Form */}
      <form className="space-y-4">
        {/* First Name and Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div data-error={!!errors.firstName}>
            <FormField
              label="First Name"
              type="text"
              id="firstName"
              size="lg"
              value={formData.firstName}
              onValueChange={(value: string) =>
                handleInputChange("firstName", value)
              }
              errorMessage={errors.firstName || ""}
              isInvalid={!!errors.firstName}
              placeholder="First name"
              isRequired={true}
            />
          </div>
          <div data-error={!!errors.lastName}>
            <FormField
              label="Last Name"
              type="text"
              id="lastName"
              size="lg"
              value={formData.lastName}
              onValueChange={(value: string) =>
                handleInputChange("lastName", value)
              }
              errorMessage={errors.lastName || ""}
              isInvalid={!!errors.lastName}
              placeholder="Last name"
              isRequired={true}
            />
          </div>
        </div>

        {/* Email Address */}
        <div data-error={!!errors.email} className="pt-2">
          <FormField
            label="Email Address"
            type="email"
            id="email"
            size="lg"
            value={formData.email}
            onValueChange={(value: string) => handleInputChange("email", value)}
            errorMessage={errors.email || ""}
            isInvalid={!!errors.email}
            placeholder="Email address"
            isRequired={true}
          />
        </div>

        {/* Password */}
        <div data-error={!!errors.password} className="pb-2">
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

          {/* Password Requirements */}
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

        {/* Date of Birth */}
        <div className="space-y-2">
          <label className="block mb-2 text-sm body-text-small-medium-auto text-primary-colour">
            Date of Birth <span className="text-red">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Day */}
            <div data-error={!!errors.birthDay}>
              <Select
                placeholder="Day"
                selectedKeys={formData.birthDay ? [formData.birthDay] : []}
                onSelectionChange={(keys: unknown) => {
                  const selectedKey = Array.from(
                    keys as Set<string>
                  )[0] as string;
                  handleInputChange("birthDay", selectedKey || "");
                }}
                isInvalid={!!errors.birthDay}
                errorMessage={errors.birthDay}
                size="lg"
              >
                {days.map((day) => (
                  <SelectItem key={day.toString().padStart(2, "0")}>
                    {day.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Month */}
            <div data-error={!!errors.birthMonth}>
              <Select
                placeholder="Month"
                selectedKeys={formData.birthMonth ? [formData.birthMonth] : []}
                onSelectionChange={(keys: unknown) => {
                  const selectedKey = Array.from(
                    keys as Set<string>
                  )[0] as string;
                  handleInputChange("birthMonth", selectedKey || "");
                }}
                isInvalid={!!errors.birthMonth}
                errorMessage={errors.birthMonth}
                size="lg"
              >
                {months.map((month) => (
                  <SelectItem key={month.value}>{month.label}</SelectItem>
                ))}
              </Select>
            </div>

            {/* Year */}
            <div data-error={!!errors.birthYear}>
              <Select
                placeholder="Year"
                selectedKeys={formData.birthYear ? [formData.birthYear] : []}
                onSelectionChange={(keys: unknown) => {
                  const selectedKey = Array.from(
                    keys as Set<string>
                  )[0] as string;
                  handleInputChange("birthYear", selectedKey || "");
                }}
                isInvalid={!!errors.birthYear}
                errorMessage={errors.birthYear}
                size="lg"
              >
                {years.map((y) => (
                  <SelectItem key={y.toString()}>{y.toString()}</SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Terms Agreement */}
        <div
          className="flex items-start pt-2 space-x-3"
          data-error={!!errors.agreeToTerms}
        >
          <input
            type="checkbox"
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={(e) =>
              handleInputChange("agreeToTerms", e.target.checked)
            }
            className="w-4 h-4 mt-1 rounded text-primary-colour border-light-grey-2 focus:ring-primary-colour focus:ring-2"
          />
          <label
            htmlFor="agreeToTerms"
            className="body-text-small-regular text-grey-2"
          >
            Yes, I understand and agree to the Storytime, including the{" "}
            <Link
              href="/terms"
              className="font-bold text-primary-colour hover:underline"
            >
              User Agreement
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-bold text-primary-colour hover:underline"
            >
              Privacy Policy
            </Link>
          </label>
          {errors.agreeToTerms && (
            <div className="flex items-center gap-1 mt-1">
              <X className="flex-shrink-0 w-4 h-4 text-red" />
              <span className="text-xs text-red">{errors.agreeToTerms}</span>
            </div>
          )}
        </div>

        {/* Create Account Button */}
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
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-6">
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
          startContent={<div className="w-5 h-5 rounded bg-grey-1"></div>}
        >
          Continue with Google
        </Button>
      </div>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="body-text-small-regular text-grey-2">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary-colour hover:underline"
          >
            Login
          </Link>
        </p>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={isLoading}
        message="Creating your account..."
      />
    </div>
  );
}
