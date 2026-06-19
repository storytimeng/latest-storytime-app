"use client";

import Link from "next/link";
import { cn } from "@/lib";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function AmbassadorStepIndicator({
  steps,
  currentStep,
}: StepIndicatorProps) {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isComplete = stepNumber < currentStep;

          return (
            <div key={label} className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm border-2",
                  isComplete || isActive
                    ? "bg-primary-colour border-primary-colour text-white"
                    : "bg-white border-grey-3 text-grey-3",
                )}
              >
                {stepNumber}
              </div>
              <span
                className={cn(
                  Magnetik_Regular.className,
                  "text-[10px] mt-1 text-center",
                  isActive ? "text-primary-colour" : "text-grey-3",
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TypeCardProps {
  title: string;
  description: string;
  emoji: string;
  selected: boolean;
  onClick: () => void;
}

export function AmbassadorTypeCard({
  title,
  description,
  emoji,
  selected,
  onClick,
}: TypeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-xl border-2 text-left transition-colors",
        selected
          ? "border-primary-colour bg-primary-shade-2"
          : "border-grey-4 bg-white",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className={cn(Magnetik_Medium.className, "text-primary-colour")}>
            {title}
          </p>
          <p className="text-sm text-grey-2 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}

interface ScoreBarProps {
  label: string;
  score: number;
  maxScore: number;
}

export function ScoreProgressBar({ label, score, maxScore }: ScoreBarProps) {
  const pct = maxScore > 0 ? Math.min(100, (score / maxScore) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-primary-colour">{label}</span>
        <span className="text-grey-2">
          {score}/{maxScore}
        </span>
      </div>
      <div className="h-2 bg-grey-5 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-colour rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface QuickActionProps {
  icon: string;
  label: string;
  href: string;
}

export function QuickActionCard({ icon, label, href }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-grey-5 hover:border-primary-colour transition-colors"
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span
        className={cn(
          Magnetik_Medium.className,
          "text-xs text-primary-colour text-center",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
