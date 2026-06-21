"use client";

import React, { useState } from "react";
import { ModalHeader, ModalBody, useModalContext } from "@heroui/modal";
import { Button } from "@heroui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import {
  Magnetik_Bold,
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import { cn } from "@/lib";
import { useAmbassadorRoutes } from "@/components/ambassador/AmbassadorRoutesProvider";

const BENEFITS = [
  "Official Ambassador Certificate",
  "Ambassador icon on your profile",
  "Special recognition & Leadership Visibility.",
  "Referral rewards",
  "Access to insider opportunities",
] as const;

type AmbassadorModalStep = "intro" | "benefits";

export const BecomeAmbassadorModal = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { onClose } = useModalContext();
  const routes = useAmbassadorRoutes();
  const [step, setStep] = useState<AmbassadorModalStep>("intro");

  const closeModal = () => {
    setStep("intro");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    router.push(`?${params.toString()}`, { scroll: false });
    onClose?.();
  };

  const handleBack = () => {
    if (step === "benefits") {
      setStep("intro");
      return;
    }
    closeModal();
  };

  const handleApply = () => {
    closeModal();
    router.push(routes.apply);
  };

  const title =
    step === "intro"
      ? "Become a StorytimeNG Ambassador :"
      : "Enjoy exclusive benefits :";

  return (
    <>
      <ModalHeader className="flex items-center gap-2 px-4 pt-2 pb-3 border-b border-grey-5">
        <button
          type="button"
          onClick={handleBack}
          className="text-primary-colour p-1 -ml-1"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2
          className={cn(
            Magnetik_Medium.className,
            "flex-1 text-sm text-primary-colour leading-snug",
          )}
        >
          {title}
        </h2>
      </ModalHeader>

      <ModalBody className="px-4 py-5 pb-6">
        {step === "intro" ? (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5 space-y-4">
              <h3
                className={cn(
                  Magnetik_Bold.className,
                  "text-xl leading-tight text-primary-colour",
                )}
              >
                Amplify Your Story.
                <br />
                Empower Your Community.
              </h3>
              <p
                className={cn(
                  Magnetik_Regular.className,
                  "text-sm text-grey-2 leading-relaxed",
                )}
              >
                Ready to go beyond being a reader and Writer? As a storytimeNG
                Ambassador, you become a recognized voice in our community.
              </p>
              <Button
                className={cn(
                  "w-full h-12 rounded-full bg-primary-colour text-white",
                  Magnetik_SemiBold.className,
                )}
                onPress={() => setStep("benefits")}
              >
                Become an Ambassador
              </Button>
              <button
                type="button"
                onClick={() => {
                  closeModal();
                  router.push(routes.hub);
                }}
                className={cn(
                  "w-full text-center text-sm text-primary-colour underline underline-offset-2",
                  Magnetik_Medium.className,
                )}
              >
                Learn more about the program
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5">
              <ul className="space-y-4">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <Star
                      className="w-4 h-4 text-[#f8951d] fill-[#f8951d] shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <span
                      className={cn(
                        Magnetik_Regular.className,
                        "text-sm text-primary-colour leading-snug",
                      )}
                    >
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="bordered"
                className={cn(
                  "flex-1 h-12 rounded-full border-primary-colour text-primary-colour bg-white",
                  Magnetik_Medium.className,
                )}
                onPress={closeModal}
              >
                Cancel
              </Button>
              <Button
                className={cn(
                  "flex-1 h-12 rounded-full bg-primary-colour text-white",
                  Magnetik_SemiBold.className,
                )}
                onPress={handleApply}
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </ModalBody>
    </>
  );
};
