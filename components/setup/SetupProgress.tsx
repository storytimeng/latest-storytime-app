import { motion } from "framer-motion";
import { SETUP_CONFIG } from "@/config/setup";

interface SetupProgressProps {
  currentStep: number;
}

export default function SetupProgress({ currentStep }: SetupProgressProps) {
  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-2 mt-2">
        {Array.from({ length: SETUP_CONFIG.progressSteps }).map((_, i) => {
          const stepNumber = i + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;
          const isActive = isCompleted || isCurrent;

          return (
            <motion.div
              key={i}
              className="h-1.5 flex-1 rounded-full bg-orange-200 overflow-hidden"
              initial={false}
            >
              <motion.div
                className="h-full bg-orange-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isActive ? 1 : 0 }}
                transition={{
                  duration: SETUP_CONFIG.animation.progressDuration,
                  ease: SETUP_CONFIG.animation.progressEasing,
                }}
                style={{ transformOrigin: "left" }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
