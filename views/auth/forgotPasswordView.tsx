"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/reusables/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import LoadingOverlay from "@/components/reusables/customUI/loadingOverlay";

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordView() {
  const router = useRouter();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.push("/auth/email-sent");
    } catch (error) {
      console.error("Password reset error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/auth/login");
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
          <Button variant="small" type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Email"}
          </Button>
        </div>
      </form>

      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isLoading} message="Sending reset email..." />
    </div>
  );
}
