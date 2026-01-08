"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSetup } from "@/src/hooks/useSetup";
import { SETUP_CONFIG } from "@/config/setup";
import {
  SetupProgress,
  PenNameStep,
  ProfilePictureStep,
  GenresStep,
  ReadTimeStep,
  WriteTimeStep,
  PreviewStep,
  CompletionStep,
} from "@/components/setup";

export default function SetupView() {
  const setup = useSetup();
  
  // UI state for modals
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Image handling
  const handleImageSelection = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setup.setImagePreview(url);
  };

  const handleImageAccept = () => {
    setShowImagePreview(false);
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: "forward" | "backward") => ({
      x: direction === "forward" ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "forward" | "backward") => ({
      x: direction === "forward" ? -50 : 50,
      opacity: 0,
    }),
  };

  return (
    <div
      className="w-full max-w-md mx-auto h-screen flex flex-col"
      onKeyDown={setup.handleKeyDown}
      tabIndex={0}
    >
      <SetupProgress currentStep={setup.step} />

      {/* Step Content with Framer Motion */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={setup.direction}>
          <motion.div
            key={setup.step}
            custom={setup.direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: SETUP_CONFIG.animation.duration,
              ease: SETUP_CONFIG.animation.easing,
            }}
            className="h-full"
          >
            {setup.step === 1 && (
              <PenNameStep
                penName={setup.penName}
                penStatus={setup.penStatus}
                onPenNameChange={setup.setPenName}
                onCheckPenName={setup.checkPenName}
                onNext={setup.goNext}
                canContinue={setup.canContinue}
                isTransitioning={setup.isTransitioning}
              />
            )}

            {setup.step === 2 && (
              <ProfilePictureStep
                imagePreview={setup.imagePreview}
                showImagePicker={showImagePicker}
                showImagePreview={showImagePreview}
                onImagePickerToggle={setShowImagePicker}
                onImagePreviewToggle={setShowImagePreview}
                onImageSelect={handleImageSelection}
                onImageAccept={handleImageAccept}
                onPreviewChange={setup.setImagePreview}
                onUploadReady={setup.setUploadTrigger}
                onNext={setup.goNext}
                onSkip={setup.skipStep}
                canContinue={setup.canContinue}
                isTransitioning={setup.isTransitioning}
              />
            )}

            {setup.step === 3 && (
              <GenresStep
                selectedGenres={setup.selectedGenres}
                onToggleGenre={setup.toggleGenre}
                onNext={setup.goNext}
                canContinue={setup.canContinue}
                isTransitioning={setup.isTransitioning}
              />
            )}

            {setup.step === 4 && (
              <ReadTimeStep
                readTime={setup.readTime}
                onReadTimeChange={setup.setReadTime}
                onNext={setup.goNext}
                canContinue={setup.canContinue}
                isTransitioning={setup.isTransitioning}
              />
            )}

            {setup.step === 5 && (
              <WriteTimeStep
                writeTime={setup.writeTime}
                writeDaily={setup.writeDaily}
                writeDays={setup.writeDays}
                dayPreset={setup.dayPreset}
                onWriteTimeChange={setup.setWriteTime}
                onDailyChange={setup.setWriteDaily}
                onDaysChange={setup.setWriteDays}
                onPresetChange={setup.applyDayPreset}
                onNext={setup.goNext}
                onSkip={setup.skipStep}
                canContinue={setup.canContinue}
                isTransitioning={setup.isTransitioning}
              />
            )}

            {setup.step === 6 && (
              <PreviewStep
                penName={setup.penName}
                imagePreview={setup.imagePreview}
                selectedGenres={setup.selectedGenres}
                readTime={setup.readTime}
                writeTime={setup.writeTime}
                writeDaily={setup.writeDaily}
                writeDays={setup.writeDays}
                onImagePickerToggle={setShowImagePicker}
                isSubmitting={setup.isSubmitting}
                onNext={setup.goNext}
                canContinue={setup.canContinue}
                isTransitioning={setup.isTransitioning}
              />
            )}

            {setup.step === 7 && (
              <CompletionStep onComplete={setup.completeSetup} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
