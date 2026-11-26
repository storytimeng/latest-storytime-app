import HomePage from "./(tabs)/home/page";
import { OnboardingGate } from "@/components/reusables/OnboardingGate";

export default function AuthPage() {
  return (
    <>
      <OnboardingGate />
      <HomePage />
    </>
  );
}
