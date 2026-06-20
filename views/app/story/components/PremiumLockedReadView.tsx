"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, Lock } from "lucide-react";
import { Button } from "@heroui/button";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { PREMIUM_UPSELL_CONTENT } from "@/src/lib/premiumUpsell";

interface PremiumLockedReadViewProps {
  storyId: string;
  storyTitle: string;
}

export const PremiumLockedReadView: React.FC<PremiumLockedReadViewProps> = ({
  storyId,
  storyTitle,
}) => {
  const router = useRouter();
  const content = PREMIUM_UPSELL_CONTENT.exclusiveStory;

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto px-4 py-6">
      <Link
        href={`/story/${storyId}`}
        className="inline-flex items-center gap-2 text-primary-colour mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className={Magnetik_Medium.className}>Back to story</span>
      </Link>

      <div className="flex flex-col items-center text-center pt-8">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-[#FFEBD0] flex items-center justify-center">
            <Crown className="w-10 h-10 text-complimentary-colour" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-colour flex items-center justify-center border-2 border-accent-shade-1">
            <Lock className="w-4 h-4 text-white" />
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-complimentary-colour bg-complimentary-colour/10 px-3 py-1 rounded-full mb-4">
          Only on Storytime
        </span>

        <h1
          className={`text-xl text-primary-colour mb-2 ${Magnetik_Bold.className}`}
        >
          {content.title}
        </h1>

        <p
          className={`text-sm text-primary-shade-4 leading-relaxed mb-2 max-w-xs ${Magnetik_Regular.className}`}
        >
          <span className="font-medium text-primary-shade-5">{storyTitle}</span>{" "}
          is exclusive to Premium members.
        </p>

        <p
          className={`text-sm text-primary-shade-4 leading-relaxed mb-8 max-w-xs ${Magnetik_Regular.className}`}
        >
          {content.description}
        </p>

        <ul className="w-full max-w-sm space-y-3 mb-8 text-left">
          {content.benefits.map((benefit) => (
            <li
              key={benefit}
              className={`flex items-start gap-2.5 text-sm text-primary-shade-5 ${Magnetik_Regular.className}`}
            >
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-complimentary-colour shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>

        <Button
          className="w-full max-w-sm bg-complimentary-colour text-white font-semibold mb-3"
          onPress={() => router.push("/premium")}
        >
          Unlock with Premium
        </Button>

        <Button
          variant="light"
          className="text-primary-shade-4"
          onPress={() => router.push(`/story/${storyId}`)}
        >
          Preview story details
        </Button>
      </div>
    </div>
  );
};
