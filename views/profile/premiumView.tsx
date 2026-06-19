"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { ArrowLeft, Volume2, Download, Bookmark, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import {
  Magnetik_Bold,
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import {
  fetchDefaultCurrency,
  fetchSubscriptionPlans,
  initializeSubscription,
  SupportedCurrency,
  SubscriptionPlan,
} from "@/src/lib/subscriptions";
import {
  detectUserCountryCode,
  getDefaultCurrencyForUser,
} from "@/src/lib/currency";
import { usePremiumFeatures } from "@/src/hooks/usePremiumFeatures";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";

const features = [
  {
    icon: <Volume2 className="w-6 h-6 text-complimentary-colour" />,
    title: "Read with audio",
    description: "Enjoy stories with audio.",
  },
  {
    icon: <Download className="w-6 h-6 text-complimentary-colour" />,
    title: "Download Stories",
    description: "Download stories and read later.",
  },
  {
    icon: <Bookmark className="w-6 h-6 text-complimentary-colour" />,
    title: "Read offline",
    description: "Read stories offline on Storytime.",
  },
];

function formatPlanDuration(name: string, durationDays: number): string {
  if (durationDays >= 365) return "One (1)\nYear";
  if (durationDays >= 180) return "Six (6)\nMonths";
  if (durationDays >= 30) return "One (1)\nMonth";
  return name.replace(" ", "\n");
}

function formatExpiryDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const PremiumView = () => {
  const { isAuthenticated } = useAuthStore();
  const openAuthModal = useAuthModalStore((state) => state.openModal);
  const {
    isPremium,
    isLoading: premiumLoading,
    premiumExpiresAt,
  } = usePremiumFeatures();

  const [selectedPlan, setSelectedPlan] = useState("6months");
  const [currency, setCurrency] = useState<SupportedCurrency | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const resolveCurrency = async () => {
      const country = detectUserCountryCode();
      try {
        const result = await fetchDefaultCurrency(country);
        if (!cancelled) setCurrency(result.currency);
      } catch {
        if (!cancelled) setCurrency(getDefaultCurrencyForUser());
      }
    };

    void resolveCurrency();
    return () => {
      cancelled = true;
    };
  }, []);

  const { data: plansData, isLoading: plansLoading } = useSWR(
    currency && !isPremium ? ["subscription-plans", currency] : null,
    () => fetchSubscriptionPlans(currency!),
    { revalidateOnFocus: false },
  );

  const plans: SubscriptionPlan[] = plansData?.plans ?? [];

  useEffect(() => {
    if (plans.length === 0) return;
    const hasSelection = plans.some((plan) => plan.code === selectedPlan);
    if (hasSelection) return;
    const defaultPlan = plans.find((plan) => plan.isPopular) ?? plans[0];
    setSelectedPlan(defaultPlan.code);
  }, [plans, selectedPlan]);

  const selectedPlanData = useMemo(
    () => plans.find((plan) => plan.code === selectedPlan),
    [plans, selectedPlan],
  );

  const showCheckout = !isPremium && !premiumLoading;
  const plansReady = Boolean(currency) && !plansLoading && plans.length > 0;

  const handleCheckout = async () => {
    setCheckoutError(null);

    if (!isAuthenticated()) {
      openAuthModal("login");
      return;
    }

    if (!selectedPlanData || !currency) {
      setCheckoutError("Please select a plan.");
      return;
    }

    setIsCheckingOut(true);
    try {
      const result = await initializeSubscription(
        selectedPlanData.code,
        currency,
      );
      window.location.href = result.authorizationUrl;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to start checkout";
      setCheckoutError(message);
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto">
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/home">
            <ArrowLeft className="w-6 h-6 text-primary-colour" />
          </Link>
        </div>
      </div>

      <div className="px-4 pb-24 space-y-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative w-24 h-24">
            <Image
              src="/images/logo.png"
              alt="Storytime Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1
            className={`text-xl text-primary-colour ${Magnetik_SemiBold.className}`}
          >
            Storytime Premium
          </h1>

          {premiumLoading && isAuthenticated() && (
            <Loader2 className="w-5 h-5 animate-spin text-complimentary-colour" />
          )}

          {isPremium && !premiumLoading && (
            <p
              className={`text-sm text-complimentary-colour leading-relaxed max-w-[16rem] ${Magnetik_Medium.className}`}
            >
              Your Premium membership is active
              {premiumExpiresAt
                ? ` until ${formatExpiryDate(premiumExpiresAt)}`
                : ""}
              .
            </p>
          )}
        </div>

        <div className="space-y-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg bg-complimentary-colour/10">
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3
                  className={`text-md text-primary-colour mb-1 ${Magnetik_SemiBold.className}`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`text-primary-shade-4 text-sm ${Magnetik_Regular.className}`}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {showCheckout && (
          <div className="space-y-4">
            {!plansReady ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary-colour" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.code)}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                      selectedPlan === plan.code
                        ? "border-complimentary-colour bg-complimentary-colour text-universal-white"
                        : plan.isPopular
                          ? "border-complimentary-colour/30 bg-complimentary-colour/5 text-primary-colour"
                          : "border-light-grey-2 bg-universal-white text-primary-colour"
                    } ${
                      plan.isPopular && selectedPlan !== plan.code
                        ? "shadow-md"
                        : ""
                    }`}
                  >
                    <div className="space-y-3 text-center">
                      <div
                        className={`text-[12px] leading-tight ${
                          selectedPlan === plan.code
                            ? "text-universal-white"
                            : "text-primary-shade-4"
                        } ${Magnetik_Regular.className}`}
                      >
                        {formatPlanDuration(plan.name, plan.durationDays)
                          .split("\n")
                          .map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                      </div>

                      <div
                        className={`text-md font-bold text-center ${
                          selectedPlan === plan.code
                            ? "text-universal-white"
                            : "text-primary-colour"
                        } ${Magnetik_Bold.className}`}
                      >
                        {plan.formattedPrice}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-6 text-center">
          {showCheckout ? (
            <>
              <p
                className={`text-primary-colour text-[14px] ${Magnetik_Medium.className}`}
              >
                Upgrade your experience with Storytime today!
              </p>

              {checkoutError && (
                <p
                  className={`text-sm text-red-600 ${Magnetik_Regular.className}`}
                >
                  {checkoutError}
                </p>
              )}

              <Button
                className={`w-full bg-primary-shade-6 text-universal-white py-4 text-lg ${Magnetik_Medium.className}`}
                size="lg"
                onPress={handleCheckout}
                isDisabled={isCheckingOut || !plansReady || !selectedPlanData}
                isLoading={isCheckingOut}
              >
                {isCheckingOut ? "Processing..." : "Pay"}
              </Button>
            </>
          ) : (
            isPremium &&
            !premiumLoading && (
              <>
                <p
                  className={`text-primary-colour text-[14px] ${Magnetik_Medium.className}`}
                >
                  Enjoy unlimited access to your Premium benefits.
                </p>
                <Button
                  as={Link}
                  href="/home"
                  className={`w-full bg-primary-shade-6 text-universal-white py-4 text-lg ${Magnetik_Medium.className}`}
                  size="lg"
                >
                  Start reading
                </Button>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumView;
