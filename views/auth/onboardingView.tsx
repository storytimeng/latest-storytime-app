"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";
import { motion, AnimatePresence } from "framer-motion";
import { ONBOARDING_STEPS, ONBOARDING_CONFIG } from "@/config";

export default function OnboardingView() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const getStepFromHash = () => {
    if (typeof window === "undefined") return 1;

    const hash = window.location.hash.slice(1);
    if (!hash) return 1;

    const step = ONBOARDING_STEPS.find((step) => step.hashId === hash);
    return step ? step.id : 1;
  };

  const updateHash = (stepId: number) => {
    const step = ONBOARDING_STEPS.find((s) => s.id === stepId);
    if (step && typeof window !== "undefined") {
      const newHash = `#${step.hashId}`;
      window.history.replaceState(null, "", `/onboarding${newHash}`);
    }
  };

  useEffect(() => {
    router.prefetch(ONBOARDING_CONFIG.routes.onComplete);
    router.prefetch(ONBOARDING_CONFIG.routes.onSkip);

    const stepFromHash = getStepFromHash();
    setCurrentStep(stepFromHash);
  }, [router]);

  useEffect(() => {
    const handleHashChange = () => {
      const newStep = getStepFromHash();
      const currentStepFromState = currentStep;

      setDirection(newStep > currentStepFromState ? "forward" : "backward");
      setCurrentStep(newStep);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("hashchange", handleHashChange);
      return () => window.removeEventListener("hashchange", handleHashChange);
    }
  }, [currentStep]);

  const currentStepData = ONBOARDING_STEPS.find(
    (step) => step.id === currentStep,
  );

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length) {
      setDirection("forward");
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      updateHash(nextStep);
    } else {
      // Mark onboarding as completed before navigating
      localStorage.setItem("storyTimeOnboarding", "true");
      router.push(ONBOARDING_CONFIG.routes.onComplete);
    }
  };

  const handleSkip = () => {
    // Mark onboarding as completed even when skipping
    localStorage.setItem("storyTimeOnboarding", "true");
    router.push(ONBOARDING_CONFIG.routes.onSkip);
  };

  const goToStep = (stepId: number) => {
    setDirection(stepId > currentStep ? "forward" : "backward");
    setCurrentStep(stepId);
    updateHash(stepId);
  };

  if (!currentStepData) return null;

  return (
    <div className="relative px-5 w-full max-w-sm mx-auto h-screen flex flex-col overflow-hidden">
      {/* <div className="mt-8 transform flex items-center justify-center">
        <Image
          src={APP_CONFIG.images.banner}
          alt={APP_CONFIG.logo.alt}
          width={APP_CONFIG.logo.width}
          height={APP_CONFIG.logo.height}
          className="object-contain"
        />
      </div> */}

      <div className="flex-1 flex flex-col justify-center">
        <div
          className={`w-full flex justify-center mb-8 h-[${ONBOARDING_CONFIG.layout.imageHeight}px]`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: ONBOARDING_CONFIG.animation.duration,
                ease: ONBOARDING_CONFIG.animation.easing,
              }}
              className="flex items-center justify-center"
            >
              <Image
                src={currentStepData.illustration}
                alt={currentStepData.title}
                width={ONBOARDING_CONFIG.layout.imageHeight}
                height={ONBOARDING_CONFIG.layout.imageHeight}
                className="object-contain"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          className={`flex flex-col items-center gap-4 mb-8 h-[${ONBOARDING_CONFIG.layout.textContainerHeight}px]`}
        >
          <AnimatePresence mode="wait">
            <motion.h2
              key={`title-${currentStep}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{
                duration: ONBOARDING_CONFIG.animation.duration,
                ease: ONBOARDING_CONFIG.animation.easing,
              }}
              className={`text-2xl leading-7.5 text-center text-primary-colour tracking-tight ${Magnetik_Bold.className} h-[${ONBOARDING_CONFIG.layout.titleHeight}px] flex items-center`}
            >
              {currentStepData.title}
            </motion.h2>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={`description-${currentStep}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{
                duration: ONBOARDING_CONFIG.animation.duration,
                ease: ONBOARDING_CONFIG.animation.easing,
                delay: 0.1,
              }}
              className={`text-sm leading-5 text-center text-dark-grey-1 ${Magnetik_Regular.className} h-[${ONBOARDING_CONFIG.layout.descriptionHeight}px] flex items-center`}
            >
              {currentStepData.description}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex justify-center items-center gap-1 mb-8 relative">
          {ONBOARDING_STEPS.map((step, index) => (
            <button
              key={index}
              onClick={() => goToStep(step.id)}
              className="relative w-6 h-1 overflow-hidden rounded-full cursor-pointer hover:opacity-80 transition-opacity"
              aria-label={`Go to step ${step.id}: ${step.title}`}
            >
              <div className="absolute inset-0 bg-accent-shade-2 rounded-full" />

              <motion.div
                className="absolute inset-0 bg-complimentary-colour rounded-full"
                initial={{
                  scaleX: index === 0 ? 1 : 0,
                  transformOrigin: "left",
                }}
                animate={{
                  scaleX:
                    index === currentStep - 1
                      ? 1
                      : index < currentStep - 1
                        ? 1
                        : 0,
                  transformOrigin:
                    direction === "forward" && index === currentStep - 1
                      ? "left"
                      : direction === "backward" && index === currentStep - 1
                        ? "right"
                        : index < currentStep - 1
                          ? "left"
                          : "left",
                }}
                transition={{
                  duration: ONBOARDING_CONFIG.animation.indicatorDuration,
                  ease: ONBOARDING_CONFIG.animation.indicatorEasing,
                  delay:
                    index === currentStep - 1
                      ? 0.2
                      : index === currentStep - 2 && direction === "forward"
                        ? 0
                        : 0,
                }}
                style={{
                  boxShadow:
                    index === currentStep - 1
                      ? "0 0 8px rgba(var(--complimentary-colour), 0.3)"
                      : "none",
                }}
              />

              {index === currentStep - 2 && direction === "forward" && (
                <motion.div
                  className="absolute inset-0 bg-complimentary-colour rounded-full"
                  initial={{ scaleX: 1, transformOrigin: "left" }}
                  animate={{ scaleX: 0, transformOrigin: "right" }}
                  transition={{
                    duration: ONBOARDING_CONFIG.animation.flowDuration,
                    ease: ONBOARDING_CONFIG.animation.flowEasing,
                    delay: 0.1,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-2 pb-8">
        <Button
          onPress={handleNext}
          className={`w-full h-12 bg-primary-colour text-white rounded-2xl text-sm ${Magnetik_Regular.className}`}
          size="lg"
          radius="lg"
        >
          {currentStep === ONBOARDING_STEPS.length ? "Get Started" : "Next"}
        </Button>

        <Button onPress={handleSkip} variant="skip">
          Skip
        </Button>
      </div>
    </div>
  );
}
