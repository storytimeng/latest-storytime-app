export interface OnboardingStep {
  id: number;
  hashId: string;
  title: string;
  description: string;
  illustration: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    hashId: "explore",
    title: "Explore genres and find your next favorite.",
    description:
      "Discover new stories from thrilling adventures to heartwarming romances, explore a wide variety of genres curated just for you.",
    illustration: "/images/onboarding1.png",
  },
  {
    id: 2,
    hashId: "personalized",
    title: "Stories tailored to your taste.",
    description:
      "Our smart algorithms learn your preferences to suggest stories you'll love. The more you read, the better the recommendations.",
    illustration: "/images/onboarding2.png",
  },
  {
    id: 3,
    hashId: "share",
    title: "Share your stories with the world.",
    description:
      "Have a story to tell? Create and publish your own stories with our easy-to-use writing tools. Reach a global audience and connect with other writers.",
    illustration: "/images/onboarding3.png",
  },
];

export const ONBOARDING_CONFIG = {
  animation: {
    duration: 0.4,
    easing: "easeInOut" as const,
    indicatorDuration: 0.8,
    indicatorEasing: [0.16, 1, 0.3, 1] as const,
    flowDuration: 0.6,
    flowEasing: [0.25, 0.46, 0.45, 0.94] as const,
  },
  layout: {
    imageHeight: 336,
    textContainerHeight: 120,
    titleHeight: 60,
    descriptionHeight: 60,
  },
  routes: {
    onComplete: "/auth/login",
    onSkip: "/auth/login",
  },
};
