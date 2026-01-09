"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/reusables/form";
import { Button } from "@/components/ui/button";
import { useForgotPassword } from "@/src/hooks/useAuth";
import { showToast } from "@/lib/showNotification";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useLoadingStore } from "@/src/stores/useLoadingStore";

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordViewProps {
  onSuccess?: (email: string) => void;
  onBack?: () => void;
}

export default function ForgotPasswordView({
  onSuccess,
  onBack,
}: ForgotPasswordViewProps) {
  const router = useRouter();
  const { show: showLoading, hide: hideLoading } = useLoadingStore();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    router.prefetch("/auth/login");
    router.prefetch("/auth/otp");
  }, [router]);

  const { trigger: forgotTrigger, isMutating: isSubmitting } =
    useForgotPassword();

  const handleInputChange = (
    field: keyof ForgotPasswordFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    showLoading("Sending reset email...");
    setError("");

    try {
      await forgotTrigger({ email: formData.email });
      showToast({
        type: "success",
        message: "Reset email sent",
        duration: 2000,
      });
      if (onSuccess) {
        onSuccess(formData.email);
      } else {
        router.push(`/auth/otp?email=${encodeURIComponent(formData.email)}&type=reset-password`);
      }
    } catch (err: any) {
      console.error("Password reset error:", err);
      showToast({
        type: "error",
        message: err?.message || "Something went wrong",
        duration: 3000,
      });
      setError("Something went wrong. Please try again.");
    } finally {
      hideLoading();
    }
  };

  const handleBackToLogin = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={handleBackToLogin}>
          <ArrowLeft className="w-6 h-6 text-grey-1" />
        </button>
      </div>

      <div
        className="text-primary-colour flex flex-col justify-center items-center mb-10"
        style={{ marginTop: "94px" }}
      >
        <Image
          src="/images/password.png"
          alt="Forgot Password"
          width={150}
          height={150}
        />
        <div className="flex flex-col mt-8 gap-3 text-center justify-center items-center">
          <div className="text-primary-color body-text-big-medium-auto">
            Update Password
          </div>
          <div className="body-text-12-regular-auto">
            Enter your email address and select Send Email
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <div
          className="pt-[41px]" //data-error={!!errors.email}
        >
          <FormField
            label="Email Address"
            type="email"
            id="email"
            size="lg"
            value={formData.email || ""}
            onValueChange={(value: string) => handleInputChange("email", value)}
            // errorMessage={errors.email || ""}
            //isInvalid={!!errors.email}
            placeholder="Email address"
            isRequired={true}
          />
        </div>

        <div className="flex flex-row space-x-4 mt-auto mb-6">
          <Button type="button" variant="bordered" onPress={handleBackToLogin}>
            Cancel
          </Button>
          <Button variant="small" type="submit">
            Send Email
          </Button>
        </div>
      </form>
    </div>
  );
}
