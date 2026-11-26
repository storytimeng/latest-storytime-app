"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function OnboardingGate() {
  const router = useRouter();

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("storyTimeOnboarding");
    if (!onboardingCompleted || onboardingCompleted === "false") {
      router.push("/auth/onboarding");
    }
  }, [router]);

  return null;
}
