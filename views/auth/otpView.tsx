"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useVerifyEmail, useResendOtp } from "@/src/hooks/useAuth";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { showToast } from "@/lib/showNotification";
import { FormField } from "@/components/reusables/form";
import OtpField from "@/components/reusables/form/otpField";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil } from "lucide-react";

interface OtpViewProps {
  email?: string;
  type?: "signup" | "reset-password" | "phone-verification";
}

function OtpContent({
  email: defaultEmail = "",
  type: defaultType = "signup",
}: OtpViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const emailParam = searchParams.get("email");
  const typeParam = searchParams.get("type") as OtpViewProps["type"];

  const [emailInput, setEmailInput] = useState("");

  // Use URL param if available, otherwise fallback to input or default prop
  const effectiveEmail = emailParam || emailInput || defaultEmail;
  const effectiveType = typeParam || defaultType;

  const { trigger: verifyTrigger, isMutating: isVerifying } = useVerifyEmail();
  const { trigger: resendTrigger, isMutating: isResending } = useResendOtp();

  // State for OTP value (single string now, handled by OtpField)
  const [otpValue, setOtpValue] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(120);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleOtpChange = (value: string) => {
    setOtpValue(value);
    if (error) setError("");
  };

  const handleConfirmEmail = () => {
    if (!emailInput) return;

    // Update URL with email param to switch to display mode
    const params = new URLSearchParams(searchParams.toString());
    params.set("email", emailInput);
    if (!params.has("type")) {
      params.set("type", effectiveType || "signup");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleEditEmail = () => {
    // Remove email param to switch to input mode
    const params = new URLSearchParams(searchParams.toString());
    params.delete("email");
    // Pre-fill input with current email so user doesn't have to re-type everything
    if (emailParam) setEmailInput(emailParam);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleVerify = async () => {
    if (!effectiveEmail) {
      setError("Please enter your email address");
      return;
    }

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      if (effectiveType === "reset-password") {
        // For password-reset flow, store the email+otp transiently and navigate
        // Note: Actual reset happens in update-password view which requires new password
        useAuthStore.getState().setReset(effectiveEmail, otpValue);
        router.push("/auth/update-password");
        return;
      }

      try {
        await verifyTrigger({ email: effectiveEmail, otp: otpValue });
        showToast({
          type: "success",
          message: "Email verified",
          duration: 1500,
        });
        switch (effectiveType) {
          case "phone-verification":
            router.push("/auth/setup");
            break;
          default:
            router.push("/auth/setup");
        }
      } catch (err: any) {
        setError("Invalid verification code. Please try again.");
        showToast({
          type: "error",
          message: err?.message || "Invalid verification code",
          duration: 3000,
        });
        return;
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Invalid verification code. Please try again.");
    }
  };

  const handleResendCode = async () => {
    if (!effectiveEmail) {
      setError("Please enter your email address to resend code");
      return;
    }

    setError("");

    try {
      await resendTrigger({ email: effectiveEmail });
      setResendTimer(120);
      showToast({
        type: "success",
        message: "Verification code sent",
        duration: 2000,
      });
    } catch (err) {
      console.error("Resend error:", err);
      setError("Failed to resend code. Please try again.");
    }
  };

  type MailProviderResponse = {
    providerName?: string;
    loginUrl?: string;
  };

  const localMailMap: Record<string, string> = {
    "gmail.com": "https://mail.google.com",
    "googlemail.com": "https://mail.google.com",
    "outlook.com": "https://outlook.live.com",
    "hotmail.com": "https://outlook.live.com",
    "live.com": "https://outlook.live.com",
    "msn.com": "https://outlook.live.com",
    "yahoo.com": "https://mail.yahoo.com",
    "ymail.com": "https://mail.yahoo.com",
    "proton.me": "https://mail.proton.me",
    "protonmail.com": "https://mail.proton.me",
    "icloud.com": "https://www.icloud.com/mail",
    "me.com": "https://www.icloud.com/mail",
  };

  /**
   * Opens the correct mail URL for the given email.
   * Tries API detection, then local map, then mailto fallback.
   */
  async function handleOpenMailApp(effectiveEmail?: string) {
    const defaultMailto = "mailto:";

    if (!effectiveEmail) {
      window.open(defaultMailto, "_blank");
      return;
    }

    // Ensure it's a string
    const domain =
      (effectiveEmail || "").toString().split("@")[1]?.toLowerCase() ?? "";

    try {
      const apiRes = await fetch(
        `https://api.emailproviderlookup.com/v1/lookup?email=${effectiveEmail}`
      ).then((res) => res.json() as Promise<MailProviderResponse>);

      if (apiRes?.loginUrl) {
        window.open(apiRes.loginUrl, "_blank");
        return;
      }
    } catch (error) {
      console.warn("API lookup failed, falling back to local map", error);
    }

    if (localMailMap[domain]) {
      window.open(localMailMap[domain], "_blank");
      return;
    }

    window.open(`${defaultMailto}${effectiveEmail}`, "_blank");
  }

  const maskEmail = (email: string) => {
    if (!email) return "";
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
      <div className="flex flex-col items-center flex-1 ">
        {/* Title */}
        <h1 className="body-text-big-bold-auto">
          Verify your email to continue
        </h1>

        {/* Subtitle / description */}
        <p className="max-w-md mb-6 text-sm text-center text-grey-2">
          Enter the code sent to your email
        </p>

        {/* OTP Boxes */}
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <OtpField
              label=""
              id="otp-input"
              value={otpValue}
              onChange={handleOtpChange}
              length={6}
              size="lg"
              placeholder=""
              isInvalid={!!error}
              errorMessage=""
            />
          </div>

          {/* Email Display or Input */}
          <div className="mb-6 text-center min-h-[80px]">
            <AnimatePresence mode="wait">
              {emailParam ? (
                <motion.div
                  key="display"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <p className="text-sm text-grey-2">
                    We just sent an email to the address:
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-sm font-medium text-grey-1">
                      {maskEmail(effectiveEmail)}
                    </p>
                    <button
                      onClick={handleEditEmail}
                      className="p-1 transition-colors rounded-full hover:bg-grey-1/10 text-grey-2 hover:text-primary-colour"
                      aria-label="Edit email"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full pt-3"
                >
                  <FormField
                    label="Email Address"
                    type="email"
                    id="email-otp"
                    size="lg"
                    value={emailInput}
                    onValueChange={setEmailInput}
                    placeholder="Enter your email"
                    isRequired={true}
                    endContent={
                      emailInput && (
                        <Button
                          size="sm"
                          onPress={handleConfirmEmail}
                          className="px-3 text-xs font-medium h-7"
                        >
                          Confirm
                        </Button>
                      )
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Primary full-width buttons & Resend Link - Conditionally Rendered */}
          <AnimatePresence>
            {emailParam && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full overflow-hidden"
              >
                <div className="mt-6 space-y-3">
                  <Button
                    variant="large"
                    onClick={handleVerify}
                    disabled={isVerifying}
                  >
                    {isVerifying ? "Verifying..." : "Verify Code"}
                  </Button>
                  <Button
                    variant="skip"
                    onPress={async () =>
                      await handleOpenMailApp(effectiveEmail)
                    }
                  >
                    Go to email inbox
                  </Button>
                </div>

                {/* Send again / resend link */}
                <div className="mt-4 mb-4 text-center">
                  <p className="text-sm text-grey-2">
                    Didn&apos;t get email?{" "}
                    <Button
                      variant="ghost"
                      onClick={handleResendCode}
                      disabled={resendTimer > 0 || isResending}
                    >
                      {isResending ? "Sending..." : "Send again"}
                    </Button>
                  </p>
                  {resendTimer > 0 && (
                    <p className="mt-2 text-xs text-grey-3">
                      Resend available in {resendTimer}s
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message below */}
          {error && (
            <div className="mt-4 text-center" role="alert" aria-live="polite">
              <p className="text-sm text-red-500" id="otp-error">
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col h-full px-6">
      <div className="flex flex-col items-center flex-1 ">
        {/* Title Skeleton */}
        <div className="w-64 h-8 mb-2 bg-gray-200 rounded animate-pulse"></div>

        {/* Subtitle Skeleton */}
        <div className="w-48 h-4 mb-6 bg-gray-200 rounded animate-pulse"></div>

        {/* OTP Boxes Skeleton */}
        <div className="w-full max-w-sm">
          <div className="flex justify-center gap-2 mb-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-10 h-10 bg-gray-200 rounded-lg sm:w-12 sm:h-12 animate-pulse"
              ></div>
            ))}
          </div>

          {/* Email Input Skeleton */}
          <div className="w-full pt-3">
            <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OtpView(props: OtpViewProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <OtpContent {...props} />
    </Suspense>
  );
}
