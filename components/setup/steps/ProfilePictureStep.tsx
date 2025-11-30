import { useRef } from "react";
import { Magnetik_Medium } from "@/lib/font";
import StepContainer from "../shared/StepContainer";
import ImagePickerModal from "../shared/ImagePickerModal";
import ImagePreviewModal from "../shared/ImagePreviewModal";
import type { StepComponentProps } from "../types";

interface ProfilePictureStepProps extends StepComponentProps {
  imagePreview: string | null;
  showImagePicker: boolean;
  showImagePreview: boolean;
  onImagePickerToggle: (show: boolean) => void;
  onImagePreviewToggle: (show: boolean) => void;
  onImageSelect: (file: File | null) => void;
  onImageAccept: () => void;
}

export default function ProfilePictureStep({
  imagePreview,
  showImagePicker,
  showImagePreview,
  onImagePickerToggle,
  onImagePreviewToggle,
  onImageSelect,
  onImageAccept,
  onNext,
  onSkip,
  canContinue,
  isTransitioning,
}: ProfilePictureStepProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageSelection = (file: File | null) => {
    if (!file) return;
    onImageSelect(file);
    onImagePickerToggle(false);
    onImagePreviewToggle(true);
  };

  return (
    <>
      <StepContainer
        title="Add a profile picture 👋"
        subtitle="Add an image you like as your display picture."
        onNext={onNext}
        onSkip={onSkip}
        canContinue={canContinue}
        isTransitioning={isTransitioning}
        showSkip
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-28 h-28 rounded-full bg-accent-shade-1 flex items-center justify-center overflow-hidden">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full border-2 border-primary-colour flex items-center justify-center text-primary-colour">
                👤
              </div>
            )}
          </div>
          <button
            type="button"
            className={`text-primary-colour underline ${Magnetik_Medium.className}`}
            onClick={() => onImagePickerToggle(true)}
          >
            Tap to change
          </button>
        </div>
      </StepContainer>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageSelection(e.target.files?.[0] ?? null)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => handleImageSelection(e.target.files?.[0] ?? null)}
      />

      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => onImagePickerToggle(false)}
        onSelectCamera={() => cameraInputRef.current?.click()}
        onSelectGallery={() => fileInputRef.current?.click()}
      />

      <ImagePreviewModal
        isOpen={showImagePreview}
        imageUrl={imagePreview}
        onAccept={() => {
          onImageAccept();
          onImagePreviewToggle(false);
        }}
        onCancel={() => onImagePreviewToggle(false)}
      />
    </>
  );
}
