import { Button } from "@/components/ui/button";
import { Magnetik_Medium } from "@/lib/font";

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectGallery: () => void;
}

export default function ImagePickerModal({
  isOpen,
  onClose,
  onSelectCamera,
  onSelectGallery,
}: ImagePickerModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-universal-white rounded-t-3xl p-6 shadow-2xl transform transition-all duration-300 ease-out">
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg text-primary-colour ${Magnetik_Medium.className}`}>
            Profile Picture
          </h3>
          <button
            onClick={onClose}
            className="text-grey-2 hover:text-primary-colour transition-colors duration-200"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <Button
            className="w-full bg-transparent text-orange-500 py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border border-orange-500"
            onClick={onSelectCamera}
          >
            Take a photo
          </Button>
          <Button
            className="w-full bg-transparent text-orange-500 py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border border-orange-500"
            onClick={onSelectGallery}
          >
            Select from album
          </Button>
        </div>
      </div>
    </div>
  );
}
