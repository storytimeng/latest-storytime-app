"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HomePage from "./(tabs)/home/page";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if onboarding has been completed
    const onboardingCompleted = localStorage.getItem("storyTimeOnboarding");

    if (!onboardingCompleted || onboardingCompleted === "false") {
      // Redirect to onboarding if not completed
      router.push("/auth/onboarding");
    }
  }, [router]);

  return <HomePage />;
}
