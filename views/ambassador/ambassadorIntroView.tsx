"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Magnetik_Medium, Magnetik_SemiBold } from "@/lib/font";
import { AmbassadorHeader } from "@/components/ambassador/AmbassadorHeader";
import { useAmbassadorOverview } from "@/src/hooks/useAmbassador";
import { Loader2 } from "lucide-react";

const features = [
  {
    emoji: "🎓",
    title: "Campus Ambassador",
    description:
      "Represent Storytime on your campus. Organize reading sessions and grow our student community.",
  },
  {
    emoji: "🌍",
    title: "Community Ambassador",
    description:
      "Lead online communities, share stories on social media, and inspire readers worldwide.",
  },
  {
    emoji: "🔗",
    title: "Referral rewards",
    description:
      "Get a unique referral link, track sign-ups, and climb the ambassador leaderboard.",
  },
  {
    emoji: "📊",
    title: "Monthly reports",
    description:
      "Submit impact reports, earn scores across awareness, reading, writing, and consistency.",
  },
];

export default function AmbassadorIntroView() {
  const router = useRouter();
  const { overview, isLoading } = useAmbassadorOverview();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-colour" />
      </div>
    );
  }

  if (overview?.isAmbassador) {
    router.replace("/ambassador/dashboard");
    return null;
  }

  if (overview?.application?.status === "pending") {
    router.replace("/ambassador/status");
    return null;
  }

  if (overview?.application?.status === "declined") {
    router.replace("/ambassador/status");
    return null;
  }

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto">
      <AmbassadorHeader title="Become an Ambassador" />

      <div className="px-4 py-6 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-4xl">🌟</p>
          <h2
            className={`${Magnetik_SemiBold.className} text-xl text-primary-colour`}
          >
            Join the Storytime Ambassador Program
          </h2>
          <p className="text-sm text-grey-2">
            Help spread the love of reading and writing while building your
            impact score and earning recognition.
          </p>
        </div>

        <div className="space-y-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl p-4 flex gap-3 shadow-sm"
            >
              <span className="text-2xl">{f.emoji}</span>
              <div>
                <p
                  className={`${Magnetik_Medium.className} text-primary-colour text-sm`}
                >
                  {f.title}
                </p>
                <p className="text-xs text-grey-2 mt-1">{f.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Button
          className="w-full bg-primary-colour text-white font-magnetik-medium"
          size="lg"
          onPress={() => router.push("/ambassador/apply")}
        >
          Start Application
        </Button>
      </div>
    </div>
  );
}
