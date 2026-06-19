"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import { verifySubscription } from "@/src/lib/subscriptions";
import { usePremiumFeatures } from "@/src/hooks/usePremiumFeatures";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";
import {
  hasAuthSession,
  hydrateAuthFromCookies,
  prepareAuthSession,
} from "@/src/lib/authSession";

const PENDING_PAYMENT_REFERENCE_KEY = "pendingPaymentReference";

export default function PremiumCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference =
    searchParams.get("reference") ||
    searchParams.get("trxref") ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem(PENDING_PAYMENT_REFERENCE_KEY)
      : null);
  const openAuthModal = useAuthModalStore((state) => state.openModal);
  const token = useAuthStore((state) => state.token);
  const { refreshPremiumStatus } = usePremiumFeatures();

  const [sessionReady, setSessionReady] = useState(false);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Restoring your session...");

  const verifyInFlightRef = useRef(false);
  const verifiedRef = useRef(false);
  const awaitingLoginRef = useRef(false);

  useEffect(() => {
    if (reference && typeof window !== "undefined") {
      sessionStorage.setItem(PENDING_PAYMENT_REFERENCE_KEY, reference);
    }
  }, [reference]);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      hydrateAuthFromCookies();
      await prepareAuthSession();
      if (!cancelled) setSessionReady(true);
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const runVerification = useCallback(async () => {
    if (verifiedRef.current || verifyInFlightRef.current) return;

    if (!reference) {
      setStatus("error");
      setMessage("Missing payment reference.");
      return;
    }

    if (!hasAuthSession()) {
      awaitingLoginRef.current = true;
      setStatus("error");
      setMessage(
        "We could not restore your session automatically. Sign in to confirm your payment.",
      );
      return;
    }

    verifyInFlightRef.current = true;
    setStatus("loading");
    setMessage("Verifying your payment...");

    try {
      const result = await verifySubscription(reference);

      if (result.isPremium || result.status === "success") {
        verifiedRef.current = true;
        awaitingLoginRef.current = false;
        sessionStorage.removeItem(PENDING_PAYMENT_REFERENCE_KEY);
        refreshPremiumStatus();
        setStatus("success");
        setMessage(
          "Payment successful. Premium is now active on your account.",
        );
        return;
      }

      setStatus("error");
      setMessage("Payment verification did not complete successfully.");
    } catch (error: unknown) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not verify your payment.",
      );
    } finally {
      verifyInFlightRef.current = false;
    }
  }, [reference, refreshPremiumStatus]);

  useEffect(() => {
    if (!sessionReady || verifiedRef.current) return;
    void runVerification();
  }, [sessionReady, runVerification]);

  useEffect(() => {
    if (!sessionReady || !awaitingLoginRef.current || verifiedRef.current) {
      return;
    }
    if (!token) return;

    awaitingLoginRef.current = false;
    void runVerification();
  }, [sessionReady, token, runVerification]);

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto px-4 py-16">
      <div className="flex flex-col items-center text-center space-y-6">
        {status === "loading" && (
          <Loader2 className="w-12 h-12 animate-spin text-complimentary-colour" />
        )}
        {status === "success" && (
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        )}
        {status === "error" && <XCircle className="w-12 h-12 text-red-600" />}

        <h1
          className={`text-xl text-primary-colour ${Magnetik_SemiBold.className}`}
        >
          {status === "loading" && "Confirming payment"}
          {status === "success" && "Welcome to Premium"}
          {status === "error" && "Payment issue"}
        </h1>

        <p className={`text-primary-shade-4 ${Magnetik_Regular.className}`}>
          {message}
        </p>

        {reference && status !== "success" && (
          <p
            className={`text-xs text-primary-shade-4 ${Magnetik_Regular.className}`}
          >
            Reference: {reference}
          </p>
        )}

        <div className="flex flex-col w-full gap-3 pt-4">
          {status === "success" && (
            <Button
              className={`w-full bg-primary-shade-6 text-universal-white ${Magnetik_Medium.className}`}
              onPress={() => router.push("/home")}
            >
              Start reading
            </Button>
          )}

          {status === "error" && (
            <>
              <Button
                className={`w-full bg-primary-shade-6 text-universal-white ${Magnetik_Medium.className}`}
                onPress={() => void runVerification()}
              >
                Retry verification
              </Button>
              {!hasAuthSession() && (
                <Button
                  variant="bordered"
                  className="w-full"
                  onPress={() => openAuthModal("login")}
                >
                  Sign in to confirm payment
                </Button>
              )}
              <Button
                variant="bordered"
                className="w-full"
                onPress={() => router.push("/home")}
              >
                Back to home
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
