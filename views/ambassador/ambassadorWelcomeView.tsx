"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/components/AppLink";
import { ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib";
import {
  Magnetik_Bold,
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import { PrimaryFormButton } from "@/components/ambassador/application-form-ui";
import { useAmbassadorOverview } from "@/src/hooks/useAmbassador";
import {
  formatAmbassadorTypeLabel,
  hasSeenAmbassadorWelcome,
  markAmbassadorWelcomeSeen,
  type AmbassadorType,
} from "@/src/lib/ambassadors";

const NEXT_STEPS = [
  "Set up your Ambassador Dashboard and explore your tools",
  "Explore your Ambassador Dashboard and referral tools",
  "Start sharing your unique referral link with your community",
] as const;

export default function AmbassadorWelcomeView() {
  const router = useRouter();
  const { overview, isLoading } = useAmbassadorOverview();

  useEffect(() => {
    if (!isLoading && hasSeenAmbassadorWelcome() && overview?.isAmbassador) {
      router.replace("/ambassador/dashboard");
    }
    if (!isLoading && !overview?.isAmbassador) {
      router.replace("/profile");
    }
  }, [isLoading, overview, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-colour" />
      </div>
    );
  }

  if (!overview?.isAmbassador) {
    return null;
  }

  const ambassadorType: AmbassadorType =
    overview.ambassador?.type ?? overview.application?.type ?? "campus";
  const roleLabel = formatAmbassadorTypeLabel(ambassadorType);

  const handleViewDashboard = () => {
    markAmbassadorWelcomeSeen();
    router.push("/ambassador/dashboard");
  };

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto pb-10">
      <div className="bg-primary-colour text-white px-4 pt-5 pb-8">
        <div className="max-w-md mx-auto">
          <Link href="/profile" className="inline-flex text-white mb-6">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex flex-col items-center text-center space-y-4">
            <span className="text-6xl leading-none" aria-hidden>
              🎉
            </span>
            <div className="space-y-2">
              <h1
                className={cn(
                  Magnetik_Bold.className,
                  "text-2xl leading-tight max-w-xs mx-auto",
                )}
              >
                Congratulations! You&apos;re Now a Storytime Ambassador!
              </h1>
              <p
                className={cn(
                  Magnetik_Regular.className,
                  "text-sm text-white/85 leading-relaxed max-w-sm mx-auto",
                )}
              >
                Welcome to our community of storytelling champions. We&apos;re
                excited to have you on board!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-2 space-y-4">
        <div className="rounded-2xl bg-accent-shade-2 border border-complimentary-colour/30 p-5 text-center">
          <p
            className={cn(
              Magnetik_Regular.className,
              "text-xs text-primary-colour",
            )}
          >
            Your Role
          </p>
          <p
            className={cn(
              Magnetik_Bold.className,
              "text-2xl text-complimentary-colour mt-1",
            )}
          >
            {roleLabel}
          </p>
        </div>

        <div className="rounded-2xl border border-grey-4 bg-white p-4 shadow-sm space-y-3">
          <h2
            className={cn(
              Magnetik_SemiBold.className,
              "text-base text-primary-colour",
            )}
          >
            Next Steps
          </h2>
          <div className="space-y-2">
            {NEXT_STEPS.map((step, index) => (
              <div
                key={step}
                className="flex items-start gap-3 rounded-xl bg-accent-shade-2 px-3 py-3"
              >
                <span
                  className={cn(
                    Magnetik_SemiBold.className,
                    "w-7 h-7 shrink-0 rounded-md bg-complimentary-colour text-white text-sm flex items-center justify-center",
                  )}
                >
                  {index + 1}
                </span>
                <p
                  className={cn(
                    Magnetik_Regular.className,
                    "text-sm text-primary-colour leading-relaxed pt-0.5",
                  )}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-[#34A853] bg-[#34A853]/10 p-4">
          <p
            className={cn(
              Magnetik_Regular.className,
              "text-sm text-primary-colour leading-relaxed",
            )}
          >
            Remember: As an Ambassador, you&apos;ll be expected to submit
            monthly activity reports and maintain active engagement with the
            Storytime community. We&apos;re here to support you every step of
            the way!
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <PrimaryFormButton onClick={handleViewDashboard}>
            View Ambassador Dashboard
          </PrimaryFormButton>
          <button
            type="button"
            onClick={() => router.push("/ambassador/dashboard")}
            className={cn(
              Magnetik_Medium.className,
              "w-full text-sm text-primary-colour underline underline-offset-2",
            )}
          >
            Open Ambassador Hub
          </button>
        </div>
      </div>
    </div>
  );
}
