import type { PremiumFeatures } from "@/src/hooks/usePremiumFeatures";

export type PremiumUpsellReason =
  | "exclusiveStory"
  | "audioNarration"
  | "offlineDownload";

export interface PremiumUpsellContent {
  title: string;
  description: string;
  benefits: string[];
  feature: keyof PremiumFeatures;
}

export const PREMIUM_UPSELL_CONTENT: Record<
  PremiumUpsellReason,
  PremiumUpsellContent
> = {
  exclusiveStory: {
    feature: "exclusiveStories",
    title: "Only on Storytime - Premium stories",
    description:
      "This story is exclusive to Storytime. Upgrade to Premium to read it and unlock our full library of original fiction.",
    benefits: [
      "Unlimited access to Only on Storytime stories",
      "Support writers publishing exclusively here",
      "Ad-free reading experience",
    ],
  },
  audioNarration: {
    feature: "audioNarration",
    title: "Listen with natural voice narration",
    description:
      "Premium members can listen to stories with studio-quality narration - perfect for commutes, chores, or winding down.",
    benefits: [
      "Human-like narration for every story",
      "Multiple voice options",
      "Listen while you read along",
    ],
  },
  offlineDownload: {
    feature: "offlineDownload",
    title: "Read anywhere - even offline",
    description:
      "Download stories to your device and keep reading without Wi‑Fi or mobile data.",
    benefits: [
      "Save chapters and episodes for offline reading",
      "Never lose your place",
      "Perfect for travel and low-connectivity areas",
    ],
  },
};

export function isExclusiveStory(story: {
  onlyOnStorytime?: boolean;
  requiresPremium?: boolean;
}): boolean {
  return Boolean(story.onlyOnStorytime || story.requiresPremium);
}

export function canReadExclusiveStory(
  story: {
    onlyOnStorytime?: boolean;
    requiresPremium?: boolean;
    authorId?: string;
  },
  options: { isPremium: boolean; userId?: string | null },
): boolean {
  if (!isExclusiveStory(story)) {
    return true;
  }

  if (options.userId && story.authorId && story.authorId === options.userId) {
    return true;
  }

  return options.isPremium;
}
