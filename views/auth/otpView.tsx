"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface OtpViewProps {
  email?: string;
  type?: "signup" | "reset-password" | "phone-verification";
}

export default function OtpView({
  email = "user@example.com",
  type = "signup",
}: OtpViewProps) {
  const router = useRouter();
  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resendTimer]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digits

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    if (error) setError("");

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otpValues.join("");
    if (otpCode.length !== 4) {
      setError("Please enter all 4 digits");
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate based on type
      switch (type) {
        case "reset-password":
          router.push("/auth/update-password");
          break;
        case "phone-verification":
          router.push("/auth/setup");
          break;
        default:
          router.push("/auth/setup");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Invalid verification code. Please try again.");
    }
  };

  const handleResendCode = async () => {
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResendTimer(30);
    } catch (error) {
      console.error("Resend error:", error);
      setError("Failed to resend code. Please try again.");
    }
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split("@");
    if (!username || !domain) return email;

    const maskedUsername =
      username.length > 2
        ? username.slice(0, 2) + "*".repeat(username.length - 2)
        : username;

    return `${maskedUsername}@${domain}`;
  };

  return (
    <div className="flex flex-col h-full px-6">
      <div className="flex-1 flex flex-col items-center ">
        {/* Title */}
        <h1 className="body-text-big-bold-auto">
          Verify your email to continue
        </h1>

        {/* Subtitle / description */}
        <p className="text-center text-sm text-grey-2 max-w-md mb-6">
          Enter the code sent to your email
        </p>

        {/* OTP Boxes */}
        <form onSubmit={handleVerify} className="w-full max-w-sm">
          <div className="flex justify-center gap-4 mb-6">
            {otpValues.map((value, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 sm:w-16 sm:h-16 text-center text-xl font-semibold rounded-lg border-2 border-grey-4 bg-white shadow-sm focus:border-primary-colour focus:outline-none focus:ring-2 focus:ring-primary-colour/20"
                aria-label={`Verification code digit ${index + 1} of 4`}
                aria-describedby={error ? "otp-error" : undefined}
                autoComplete="one-time-code"
                required
              />
            ))}
          </div>

          {/* Masked email text */}
          <div className="text-center mb-6">
            <p className="text-sm text-grey-2">
              We just sent an email to the address:
            </p>
            <p className="text-sm font-medium text-grey-1 mt-2">
              {maskEmail(email)}
            </p>
          </div>

          {/* Primary full-width buttons */}
          <div className="space-y-3 mt-24">
            <Button variant="large" onClick={handleVerify}>
              Verify Code
            </Button>
            <Button
              variant="bordered"
              onClick={() => router.push("/auth/login")}
            >
              Go to email inbox
            </Button>
          </div>

          {/* Send again / resend link */}
          <div className="text-center">
            <p className="text-sm text-grey-2">
              Didn&apos;t get email?{" "}
              <Button
                variant="ghost"
                onClick={handleResendCode}
                disabled={resendTimer > 0}
              >
                Send again
              </Button>
            </p>
            {resendTimer > 0 && (
              <p className="text-xs text-grey-3 mt-2">
                Resend available in {resendTimer}s
              </p>
            )}
          </div>

          {/* Error message below */}
          {error && (
            <div className="text-center mt-4" role="alert" aria-live="polite">
              <p className="text-sm text-red-500" id="otp-error">
                {error}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
