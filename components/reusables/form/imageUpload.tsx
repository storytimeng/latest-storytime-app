"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import FormField from "./formField";
import { showToast } from "@/lib/showNotification";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  className?: string;
  aspectRatio?: "video" | "square" | "auto";
  placeholder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  className,
  aspectRatio = "video",
  placeholder = "Add cover image",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"preview" | "upload">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate image URL
  const validateImageUrl = useCallback((url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!url) {
        resolve(false);
        return;
      }

      const img = new window.Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }, []);

  // Handle URL input change
  const handleUrlChange = useCallback(
    async (url: string) => {
      setImageUrl(url);
      setPreviewUrl(null);

      if (url) {
        setIsLoading(true);
        const isValid = await validateImageUrl(url);
        setIsValidUrl(isValid);
        if (isValid) {
          setPreviewUrl(url);
        }
        setIsLoading(false);
      } else {
        setIsValidUrl(false);
      }
    },
    [validateImageUrl]
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Check if file is an image
        if (!file.type.startsWith("image/")) {
          showToast({
            type: "error",
            message: "Please select an image file",
            duration: 3000,
          });
          return;
        }

        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPreviewUrl(result);
          setImageUrl(result);
          setIsValidUrl(true);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  // Handle save image
  const handleSaveImage = useCallback(() => {
    if (isValidUrl && (previewUrl || imageUrl)) {
      onChange(previewUrl || imageUrl);
      setIsModalOpen(false);
      setImageUrl("");
      setPreviewUrl(null);
    }
  }, [isValidUrl, previewUrl, imageUrl, onChange]);

  // Handle remove image
  const handleRemoveImage = useCallback(() => {
    onChange(null);
  }, [onChange]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setImageUrl("");
    setPreviewUrl(null);
    setIsValidUrl(false);
  }, []);

  const aspectRatioClass = {
    video: "aspect-video",
    square: "aspect-square",
    auto: "aspect-auto min-h-[200px]",
  }[aspectRatio];

  return (
    <>
      <div className={cn("relative", aspectRatioClass, className)}>
        {value ? (
          // Display selected image
          <div className="relative w-full h-full overflow-hidden rounded-lg bg-light-grey-2 group">
            {/* Clickable image for full-screen preview */}
            <div
              className="w-full h-full cursor-pointer"
              onClick={() => {
                setModalMode("preview");
                setIsModalOpen(true);
              }}
            >
              <Image
                src={value}
                alt="Cover image"
                fill
                className="object-cover transition-transform hover:scale-105"
              />
            </div>

            {/* Hover overlay with action buttons */}
            <div className="absolute inset-0 flex items-center justify-center transition-colors opacity-0 bg-black/0 group-hover:bg-black/20 group-hover:opacity-100">
              <div className="px-3 py-1 rounded-full bg-black/50">
                <span className="text-sm font-medium text-white">
                  Tap to preview
                </span>
              </div>
            </div>

            {/* Change cover button - positioned like in the image */}
            <Button
              variant="solid"
              className="absolute flex items-center gap-2 text-white bg-orange-500 shadow-lg bottom-4 right-4 hover:bg-orange-600"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the image click
                setModalMode("upload");
                setIsModalOpen(true);
              }}
            >
              <span className="text-sm">🖼️</span>
              <span className="text-sm font-medium">Change cover image</span>
            </Button>

            {/* Small remove button in top-right corner */}
            <Button
              isIconOnly
              variant="solid"
              size="sm"
              className="absolute text-white transition-opacity bg-red-500 shadow-lg opacity-0 top-2 right-2 hover:bg-red-600 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
            >
              ✕
            </Button>
          </div>
        ) : (
          // Display upload placeholder
          <div className="flex items-center justify-center w-full h-full transition-colors rounded-lg cursor-pointer bg-accent-colour hover:bg-accent-colour/80">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-complimentary-colour"
              onClick={() => {
                setModalMode("upload");
                setIsModalOpen(true);
              }}
            >
              <span className="font-medium">📷 {placeholder}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Upload/Preview Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        size={modalMode === "preview" ? "5xl" : "2xl"}
        scrollBehavior="inside"
        classNames={{
          base: modalMode === "preview" ? "bg-black" : "",
          backdrop: modalMode === "preview" ? "bg-black/90" : "",
        }}
      >
        <ModalContent>
          {modalMode === "preview" ? (
            // Full-screen preview mode
            <>
              <ModalHeader className="flex items-center justify-between text-white bg-black">
                <h3 className="text-lg font-semibold">Cover Image Preview</h3>
                <div className="flex gap-2">
                  <Button
                    variant="solid"
                    size="sm"
                    className="text-white bg-orange-500 hover:bg-orange-600"
                    onClick={() => setModalMode("upload")}
                  >
                    🖼️ Change Image
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    onClick={handleModalClose}
                  >
                    ✕
                  </Button>
                </div>
              </ModalHeader>
              <ModalBody className="p-0 bg-black flex items-center justify-center min-h-[70vh]">
                {value && (
                  <div className="relative max-w-full max-h-full">
                    <Image
                      src={value}
                      alt="Cover image preview"
                      width={1200}
                      height={800}
                      className="object-contain max-w-full max-h-full"
                    />
                  </div>
                )}
              </ModalBody>
            </>
          ) : (
            // Upload mode
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-primary-colour">
                  {value ? "Change Cover Image" : "Add Cover Image"}
                </h3>
              </ModalHeader>

              <ModalBody className="space-y-6">
                {/* File Upload Section */}
                <div>
                  <h4 className="mb-3 font-medium text-primary-colour">
                    Upload from Device
                  </h4>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="bordered"
                    className="w-full h-20 border-2 border-dashed border-complimentary-colour/50 text-complimentary-colour hover:bg-complimentary-colour/5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">📁</span>
                      <span>Click to upload image</span>
                      <span className="text-xs opacity-70">
                        PNG, JPG, GIF up to 10MB
                      </span>
                    </div>
                  </Button>
                </div>

                {/* URL Input Section */}
                <div>
                  <h4 className="mb-3 font-medium text-primary-colour">
                    Or Add from URL
                  </h4>
                  <div className="space-y-3">
                    <FormField
                      label=""
                      type="url"
                      id="imageUrl"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onValueChange={handleUrlChange}
                      startContent="🔗"
                      isInvalid={imageUrl ? !isValidUrl : false}
                      errorMessage={
                        imageUrl && !isValidUrl ? "Invalid image URL" : ""
                      }
                    />
                    {isLoading && (
                      <div className="text-sm text-grey-1">
                        Validating image...
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview Section */}
                {previewUrl && (
                  <div>
                    <h4 className="mb-3 font-medium text-primary-colour">
                      Preview
                    </h4>
                    <div className="relative max-w-md mx-auto overflow-hidden rounded-lg aspect-video bg-light-grey-2">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="ghost"
                  onPress={handleModalClose}
                  className="text-primary-colour"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-primary-shade-6 text-universal-white"
                  onPress={handleSaveImage}
                  isDisabled={!isValidUrl}
                  isLoading={isLoading}
                >
                  {value ? "Update Image" : "Add Image"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ImageUpload;
