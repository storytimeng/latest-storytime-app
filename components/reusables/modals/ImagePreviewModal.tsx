import React, { useEffect } from "react";
import { Button } from "@heroui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  imageUrl: string;
  altText?: string;
  layoutId?: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onOpenChange,
  imageUrl,
  altText = "Image preview",
  layoutId,
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!imageUrl) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            onClick={onOpenChange}
          >
            {/* Blurred Background Image */}
            <div className="absolute inset-0 overflow-hidden opacity-40">
              <Image
                src={imageUrl}
                alt="Background"
                fill
                className="object-cover blur-3xl scale-110"
                priority
              />
            </div>
          </motion.div>

          {/* Close Button */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.1 }}
            className="absolute top-4 right-4 z-50"
          >
            <Button
              isIconOnly
              variant="light"
              className="text-white/70 hover:text-white bg-black/20 backdrop-blur-md rounded-full"
              onPress={onOpenChange}
            >
              <X size={24} />
            </Button>
          </motion.div>

          {/* Main Image Container */}
          <div className="relative z-10 w-full h-full p-4 flex items-center justify-center pointer-events-none">
            {/* Layer 1: Transition Image (Cropped, Layout Animated) */}
            {/* This layer handles the smooth geometry transition from the thumbnail */}
            <motion.div
              layoutId={layoutId}
              className="relative h-[80vh] aspect-[2/3] shadow-2xl overflow-hidden rounded-xl bg-transparent"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8
              }}
            >
              <Image
                src={imageUrl}
                alt={altText}
                fill
                className="object-cover blur-xl brightness-75"
                priority
              />
            </motion.div>

            {/* Layer 2: Full Image (Uncropped, Fade Animated) */}
            {/* This layer fades in to show the complete image details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-auto p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full max-w-5xl max-h-[85vh] shadow-2xl drop-shadow-2xl">
                <Image
                  src={imageUrl}
                  alt={altText}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

