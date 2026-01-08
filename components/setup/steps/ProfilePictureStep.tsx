import { useRef } from "react";
import { Magnetik_Medium } from "@/lib/font";
import StepContainer from "../shared/StepContainer";
import type { StepComponentProps } from "../types";
import ImageUpload from "@/components/reusables/form/imageUpload";

interface ProfilePictureStepProps extends StepComponentProps {
  imagePreview: string | null;
  showImagePicker: boolean;
  showImagePreview: boolean;
  onImagePickerToggle: (show: boolean) => void;
  onImagePreviewToggle: (show: boolean) => void;
  onImageSelect: (file: File | null) => void;
  onImageAccept: () => void;
  onPreviewChange: (url: string | null) => void;
}

export default function ProfilePictureStep({
  imagePreview,
  showImagePicker,
  showImagePreview,
  onImagePickerToggle,
  onImagePreviewToggle,
  onImageSelect,
  onImageAccept,
  onPreviewChange,
  onUploadReady,
  onNext,
  onSkip,
  canContinue,
  isTransitioning,
}: ProfilePictureStepProps & { onUploadReady: (fn: () => Promise<string | null>) => void }) {
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
          <div className="w-48 h-48">
             <ImageUpload 
                value={imagePreview || ""}
                onChange={(url) => onPreviewChange(url)}
                autoUpload={false}
                onUploadReady={onUploadReady}
                aspectRatio="square"
                className="rounded-full overflow-hidden w-full h-full"
                placeholder="Upload Photo"
             />
          </div>
        </div>
      </StepContainer>

       {/* We can remove the hidden inputs and custom modals if we fully switch to ImageUpload 
           For now, to strictly follow the plan which said "Update handleImageSelection", 
           I should actually be updating SetupView to pass the props down.
           Wait, the current ProfilePictureStep uses hidden inputs. 
           The implementation plan said "Update handleImageSelection to pass the File object".
           
           Let's look at `setupView.tsx`.
           
           The user asked for: "add an auto uplaod setting... if auto is set... uploaded... if not... manually trigger".
           
           In `useSetup.ts`, I added `activeUploadTrigger`.
           
           The `ProfilePictureStep` is currently using custom UI (`StepContainer` + `div` with img tag + hidden inputs).
           It is NOT using `ImageUpload` component.
           
           My plan said: 
           "Views -> setupView.tsx -> Update handleImageSelection to pass the File object..."
           
           But `useSetup` doesn't have a `profileImageFile` state anymore, instead I added `activeUploadTrigger`.
           
           So I need to change `ProfilePictureStep` to use `ImageUpload` component? 
           Or modify `ProfilePictureStep` to basically reimplement what `ImageUpload` does but with the existing UI?
           
           The request was "add an auto uplaod setting to image uplaode compenet".
           And "setup upload endpoint hook then use it there [profile set, profile editing...]".
           
           So for Profile Setup, I should USE `ImageUpload` component instead of the custom UI, OR update the existing UI to use the hook.
           Using `ImageUpload` component seems cleaner and more consistent.
           
           Let's REPLACE the custom UI in `ProfilePictureStep` with `ImageUpload`.
       */}
    </>
  );
}
