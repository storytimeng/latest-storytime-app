"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Crown } from "lucide-react";
import { Button } from "@heroui/button";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { PREMIUM_UPSELL_CONTENT } from "@/src/lib/premiumUpsell";

interface PremiumExclusiveReadGateProps {
  storyId: string;
  storyTitle: string;
}

export const PremiumExclusiveReadGate: React.FC<
  PremiumExclusiveReadGateProps
> = ({ storyId, storyTitle }) => {
  const router = useRouter();
  const content = PREMIUM_UPSELL_CONTENT.exclusiveStory;

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto">
      <div className="px-4 pt-6">
        <Link
          href={`/story/${storyId}`}
          className="inline-flex items-center gap-2 text-primary-colour"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className={Magnetik_Medium.className}>Back</span>
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-[#FFEBD0]">
          <Crown className="w-8 h-8 text-complimentary-colour" />
        </div>

        <span className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-complimentary-colour/15 text-complimentary-colour">
          <BookOpen className="w-3 h-3" />
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
          is exclusive to Storytime Premium readers.
        </p>

        <p
          className={`text-sm text-primary-shade-4 leading-relaxed mb-8 max-w-sm ${Magnetik_Regular.className}`}
        >
          {content.description}
        </p>

        <div className="flex flex-col w-full gap-3 max-w-xs">
          <Button
            className="w-full bg-complimentary-colour text-white font-semibold"
            onPress={() => router.push("/premium")}
          >
            Unlock with Premium
          </Button>
          <Button
            variant="bordered"
            className="w-full border-light-grey-2 text-primary-shade-4"
            onPress={() => router.push(`/story/${storyId}`)}
          >
            View story details
          </Button>
        </div>
      </div>
    </div>
  );
};
