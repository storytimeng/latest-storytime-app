import { motion } from "framer-motion";
import { SETUP_CONFIG } from "@/config/setup";

interface SetupProgressProps {
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}

export default function SetupProgress({ 
  currentStep,
  onStepClick 
}: SetupProgressProps) {
  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-1 mt-2">
        {Array.from({ length: SETUP_CONFIG.progressSteps }).map((_, i) => {
          const stepNumber = i + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;
          const isActive = isCompleted || isCurrent;
          
          // Only allow clicking steps that are already completed or the current one
          // This prevents skipping required fields
          const isClickable = stepNumber <= currentStep;

          return (
            <button
              key={i}
              onClick={() => isClickable && onStepClick?.(stepNumber)}
              className={`h-1 flex-1 relative rounded-full overflow-hidden transition-opacity ${
                isClickable ? "cursor-pointer hover:opacity-80" : "cursor-default"
              }`}
              disabled={!isClickable}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-orange-200" />
              
              {/* Fill */}
              <motion.div
                className="absolute inset-0 bg-orange-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isActive ? 1 : 0 }}
                transition={{
                  duration: SETUP_CONFIG.animation.progressDuration,
                  ease: SETUP_CONFIG.animation.progressEasing,
                }}
                style={{ transformOrigin: "left" }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
