"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Cloud, Loader2 } from "lucide-react";
import { cn } from "@/lib";
import {
  Magnetik_Bold,
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import { PrimaryFormButton } from "@/components/ambassador/application-form-ui";
import { useAmbassadorOverview } from "@/src/hooks/useAmbassador";
import { getAmbassadorEntryPath } from "@/src/lib/ambassadors";

const GROWTH_TIPS = [
  "Published more stories consistently",
  "Grown your reader engagement",
  "Participated actively in community discussions",
  "Built stronger connections with other creators",
] as const;

export default function AmbassadorDeclinedView() {
  const router = useRouter();
  const { overview, isLoading } = useAmbassadorOverview();

  useEffect(() => {
    if (!isLoading && overview?.isAmbassador) {
      router.replace(getAmbassadorEntryPath());
    }
  }, [isLoading, overview, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-colour" />
      </div>
    );
  }

  const application = overview?.application;

  if (!application || application.status !== "declined") {
    router.replace("/profile");
    return null;
  }

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto pb-10">
      <div className="bg-primary-colour text-white px-4 pt-5 pb-8">
        <div className="max-w-md mx-auto">
          <Link href="/profile" className="inline-flex text-white mb-6">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex flex-col items-center text-center space-y-4">
            <span className="w-20 h-20 rounded-full bg-accent-shade-1 flex items-center justify-center">
              <Cloud
                className="w-10 h-10 text-primary-colour"
                strokeWidth={1.5}
              />
            </span>
            <div className="space-y-2">
              <h1
                className={cn(
                  Magnetik_Bold.className,
                  "text-2xl leading-tight",
                )}
              >
                Thank You for Applying
              </h1>
              <p
                className={cn(
                  Magnetik_Regular.className,
                  "text-sm text-white/85 leading-relaxed max-w-xs mx-auto",
                )}
              >
                We appreciate your interest in the Storytime Ambassador program.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-2 space-y-4">
        <div className="rounded-2xl bg-accent-shade-2 border border-complimentary-colour/20 p-4">
          <p
            className={cn(
              Magnetik_Regular.className,
              "text-sm text-primary-colour leading-relaxed",
            )}
          >
            After careful review, we&apos;ve decided not to move forward with
            your application at this time. This decision is based on our current
            program needs and capacity, and doesn&apos;t reflect on your value
            as a member of the Storytime community.
          </p>
        </div>

        {application.declineReason && (
          <div className="rounded-2xl border border-red/20 bg-red/5 p-4">
            <p
              className={cn(Magnetik_Medium.className, "text-sm text-red mb-1")}
            >
              Feedback from our team
            </p>
            <p className="text-sm text-grey-2 leading-relaxed">
              {application.declineReason}
            </p>
          </div>
        )}

        <div className="rounded-2xl bg-accent-shade-2 border border-complimentary-colour/20 p-4 space-y-3">
          <h2
            className={cn(
              Magnetik_SemiBold.className,
              "text-base text-primary-colour",
            )}
          >
            Keep Growing With Us
          </h2>
          <p
            className={cn(
              Magnetik_Regular.className,
              "text-sm text-grey-2 leading-relaxed",
            )}
          >
            We encourage you to continue building your presence on Storytime.
            You&apos;re welcome to reapply after{" "}
            <span
              className={cn(Magnetik_SemiBold.className, "text-primary-colour")}
            >
              30–60 days
            </span>{" "}
            once you&apos;ve:
          </p>
          <ul className="space-y-2">
            {GROWTH_TIPS.map((tip) => (
              <li
                key={tip}
                className={cn(
                  Magnetik_Regular.className,
                  "text-sm text-primary-colour flex items-start gap-2",
                )}
              >
                <span className="text-complimentary-colour mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          {!application.canReapply && (
            <p
              className={cn(Magnetik_Medium.className, "text-sm text-red pt-1")}
            >
              You can reapply in {application.reapplyDaysRemaining} day
              {application.reapplyDaysRemaining === 1 ? "" : "s"}.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-dashed border-[#34A853] bg-[#34A853]/10 p-4">
          <p
            className={cn(
              Magnetik_Regular.className,
              "text-sm text-primary-colour leading-relaxed",
            )}
          >
            Many of our most successful ambassadors applied multiple times
            before being accepted. Use this as motivation to strengthen your
            creative journey!
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/pen")}
            className={cn(
              "w-full h-12 rounded-full bg-complimentary-colour text-white text-sm",
              Magnetik_SemiBold.className,
            )}
          >
            Keep Writing
          </button>
          <button
            type="button"
            onClick={() => router.push("/ambassador")}
            className={cn(
              Magnetik_Medium.className,
              "w-full text-sm text-primary-colour underline underline-offset-2",
            )}
          >
            View Community Guidelines
          </button>
          {application.canReapply && (
            <PrimaryFormButton onClick={() => router.push("/ambassador/apply")}>
              Apply Again
            </PrimaryFormButton>
          )}
        </div>
      </div>
    </div>
  );
}
