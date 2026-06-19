"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Loader2, Clock, XCircle } from "lucide-react";
import { Magnetik_Medium, Magnetik_SemiBold } from "@/lib/font";
import { AmbassadorHeader } from "@/components/ambassador/AmbassadorHeader";
import { AmbassadorStepIndicator } from "@/components/ambassador/AmbassadorComponents";
import { useAmbassadorOverview } from "@/src/hooks/useAmbassador";

const REVIEW_STEPS = ["Submitted", "Under Review", "Decision"];

export default function AmbassadorStatusView() {
  const router = useRouter();
  const { overview, isLoading } = useAmbassadorOverview();

  useEffect(() => {
    if (!isLoading && overview?.isAmbassador) {
      router.replace("/ambassador/dashboard");
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

  if (!application) {
    router.replace("/ambassador");
    return null;
  }

  if (application.status === "accepted") {
    router.replace("/ambassador/dashboard");
    return null;
  }

  const isPending = application.status === "pending";
  const isDeclined = application.status === "declined";

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto pb-24">
      <AmbassadorHeader title="Application Status" />

      <div className="px-4 py-6 space-y-6">
        <div className="text-center space-y-3">
          {isPending && (
            <>
              <Clock className="w-12 h-12 text-primary-colour mx-auto" />
              <h2
                className={`${Magnetik_SemiBold.className} text-xl text-primary-colour`}
              >
                Under Review
              </h2>
              <p className="text-sm text-grey-2">
                Your {application.type === "campus" ? "Campus" : "Community"}{" "}
                Ambassador application is being reviewed.
              </p>
            </>
          )}
          {isDeclined && (
            <>
              <XCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h2
                className={`${Magnetik_SemiBold.className} text-xl text-primary-colour`}
              >
                Application Declined
              </h2>
              <p className="text-sm text-grey-2">
                Unfortunately your application was not approved at this time.
              </p>
            </>
          )}
        </div>

        {isPending && (
          <>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="text-3xl font-magnetik-bold text-primary-colour">
                {application.daysRemaining}
              </p>
              <p className="text-sm text-grey-2">days remaining for review</p>
            </div>

            <AmbassadorStepIndicator steps={REVIEW_STEPS} currentStep={2} />

            <div className="bg-white rounded-xl p-4 space-y-2 shadow-sm">
              <p className={`${Magnetik_Medium.className} text-primary-colour`}>
                Tips while you wait
              </p>
              <ul className="text-sm text-grey-2 space-y-2 list-disc pl-4">
                <li>Keep reading and writing on Storytime.</li>
                <li>Engage with stories in your favorite genres.</li>
                <li>
                  Build your profile — badges help your application stand out.
                </li>
              </ul>
            </div>
          </>
        )}

        {isDeclined && application.declineReason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className={`${Magnetik_Medium.className} text-red-700 text-sm`}>
              Reason
            </p>
            <p className="text-sm text-red-600 mt-1">
              {application.declineReason}
            </p>
          </div>
        )}

        {isDeclined && (
          <Button
            className="w-full bg-primary-colour text-white"
            onPress={() => router.push("/ambassador/apply")}
          >
            Apply Again
          </Button>
        )}

        {isPending && (
          <Button
            variant="bordered"
            className="w-full border-primary-colour text-primary-colour"
            onPress={() => router.push("/profile")}
          >
            Back to Profile
          </Button>
        )}
      </div>
    </div>
  );
}
