import { Button } from "@/components/ui/button";

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onAccept: () => void;
  onCancel: () => void;
}

export default function ImagePreviewModal({
  isOpen,
  imageUrl,
  onAccept,
  onCancel,
}: ImagePreviewModalProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Image Container */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Image Preview"
          className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Action Buttons */}
      <div className="relative p-4 bg-universal-white/95 backdrop-blur-sm">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            className="flex-1 bg-accent-shade-1 hover:bg-accent-shade-2 text-grey-1 py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-primary-colour hover:bg-primary-shade-6 text-universal-white py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            onClick={onAccept}
          >
            Set as Profile Picture
          </Button>
        </div>
      </div>
    </div>
  );
}
