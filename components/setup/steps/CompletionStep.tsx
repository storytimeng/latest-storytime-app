import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";

interface CompletionStepProps {
  onComplete: () => void;
}

export default function CompletionStep({ onComplete }: CompletionStepProps) {
  return (
    <div className="px-4 pt-10 text-center">
      <div className="flex justify-center mb-6">
        <Image
          src="/images/celebrate.gif"
          alt="Celebrate"
          width={160}
          height={160}
        />
      </div>
      <h2 className={`text-xl text-primary-colour mb-2 ${Magnetik_Bold.className}`}>
        Profile Setup Complete
      </h2>
      <p className={`text-grey-2 mb-6 ${Magnetik_Regular.className}`}>
        Your profile is ready. Start exploring, discovering new stories, and
        writing your own. Enjoy your time on Storytime!
      </p>
      <Button
        className="w-full bg-primary-colour hover:bg-primary-shade-6 text-universal-white py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        onClick={onComplete}
      >
        🚀 Start Exploring
      </Button>
    </div>
  );
}
