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
import { ImagePlus, X, FolderOpen, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import FormField from "./formField";
import { showToast } from "@/lib/showNotification";
import { useImageUpload } from "@/src/hooks/useImageUpload";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  className?: string;
  aspectRatio?: "video" | "square" | "auto";
  placeholder?: string;
  autoUpload?: boolean;
  onUploadReady?: (uploadFn: () => Promise<string | null>) => void;
  useUpload?: () => { upload: (file: File) => Promise<string | null>; isUploading: boolean };
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  className,
  aspectRatio = "video",
  placeholder = "Add cover image",
  autoUpload = false,
  onUploadReady,
  useUpload = useImageUpload,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"preview" | "upload">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { upload, isUploading: isHookUploading } = useUpload();

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
      setSelectedFile(null); // Clear selected file if user switches to URL

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
  const handleFileSelect = useCallback(
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

        setSelectedFile(file);

        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPreviewUrl(result);
          setImageUrl(""); // Clear URL input if user switches to file
          setIsValidUrl(true);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  // Handle save image
  const handleSaveImage = useCallback(async () => {
    // Case 1: URL provided
    if (imageUrl && isValidUrl) {
      onChange(imageUrl);
      setIsModalOpen(false);
      return;
    }

    // Case 2: File selected
    if (selectedFile) {
        // 2a: Auto upload enabled
        if (autoUpload) {
            try {
                const uploadedUrl = await upload(selectedFile);
                if (uploadedUrl) {
                    onChange(uploadedUrl);
                    setIsModalOpen(false);
                }
            } catch (error) {
                // Error handling is done in hook
            }
        } else {
            // 2b: Manual upload (pass blob URL and expose trigger)
            if (previewUrl) {
                onChange(previewUrl);
                
                if (onUploadReady) {
                    onUploadReady(async () => {
                       return await upload(selectedFile);
                    });
                }
                setIsModalOpen(false);
            }
        }
    }
  }, [imageUrl, isValidUrl, selectedFile, autoUpload, upload, onChange, onUploadReady, previewUrl]);

  // Reset state on close
  const resetState = useCallback(() => {
    setImageUrl("");
    setPreviewUrl(null);
    setIsValidUrl(false);
    setSelectedFile(null);
  }, []);

  // Handle remove image
  const handleRemoveImage = useCallback(() => {
    onChange(null);
  }, [onChange]);

  // Handle clear preview
  const handleClearPreview = useCallback(() => {
    resetState();
  }, [resetState]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    resetState();
  }, [resetState]);

  const aspectRatioClass = {
    video: "aspect-video",
    square: "aspect-square",
    auto: "aspect-auto min-h-[200px]",
  }[aspectRatio];

  const isSaving = isLoading || isHookUploading;

  return (
    <>
      <div className={cn("relative", aspectRatioClass, className)}>
        {value ? (
          // Display selected image
          <div 
            className="relative w-full h-full overflow-hidden rounded-lg bg-light-grey-2 group cursor-pointer"
            onClick={() => {
                setModalMode("preview");
                setIsModalOpen(true);
            }}
          >
            {/* Image for full-screen preview */}
            <div className="w-full h-full">
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
              className="absolute flex items-center gap-2 text-gray-700 bg-white shadow-lg bottom-4 right-4 hover:bg-gray-50"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the image click
                setModalMode("upload");
                setIsModalOpen(true);
              }}
            >
              <ImagePlus size={18} />
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
              <X size={16} />
            </Button>
          </div>
        ) : (
          // Display upload placeholder - entire area is clickable
          <div
            className="flex items-center justify-center w-full h-full transition-colors rounded-lg cursor-pointer bg-accent-colour hover:bg-accent-colour/80"
            onClick={() => {
              setModalMode("upload");
              setIsModalOpen(true);
            }}
          >
            <div className="flex items-center gap-2 text-complimentary-colour">
              <ImagePlus size={24} />
              <span className="font-medium">{placeholder}</span>
            </div>
          </div>
        )}
      </div>

      {/* Upload/Preview Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        size={modalMode === "preview" ? "5xl" : "2xl"}
        scrollBehavior="inside"
        placement="bottom"
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            },
            exit: {
              y: "100%",
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn",
              },
            },
          },
        }}
        classNames={{
          base: modalMode === "preview" ? "bg-black" : "sm:mb-0 mb-0",
          backdrop: modalMode === "preview" ? "bg-black/90" : "",
          wrapper: "items-end sm:items-center",
        }}
        isDismissable={!isSaving}
        hideCloseButton={isSaving}
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
                    <ImagePlus size={16} className="mr-1" /> Change Image
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    onClick={handleModalClose}
                  >
                    <X size={16} />
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
                {/* Preview replaces upload buttons when image is selected */}
                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="relative w-full overflow-hidden rounded-lg aspect-video bg-light-grey-2">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      {/* Close button to clear preview */}
                      <Button
                        isIconOnly
                        variant="solid"
                        size="sm"
                        className="absolute text-white bg-red-500 shadow-lg top-2 right-2 hover:bg-red-600"
                        onClick={handleClearPreview}
                        isDisabled={isSaving}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                    {!autoUpload && (
                        <p className="text-sm text-center text-gray-500">
                        Image will be uploaded when you save changes.
                        </p>
                    )}
                    <p className="text-sm text-center text-gray-500">
                      Click the X to choose a different image
                    </p>
                  </div>
                ) : (
                  <>
                    {/* File Upload Section */}
                    <div>
                      <h4 className="mb-3 font-medium text-primary-colour">
                        Upload from Device
                      </h4>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        variant="bordered"
                        className="w-full h-fit p-2 border-2 border-dashed border-complimentary-colour/50 text-complimentary-colour hover:bg-complimentary-colour/5"
                        onPress={() => fileInputRef.current?.click()}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <FolderOpen size={32} />
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
                          placeholder="https://storytime.ng/images/placeholder.jpg"
                          value={imageUrl}
                          onValueChange={handleUrlChange}
                          startContent={<LinkIcon size={16} />}
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
                  </>
                )}
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="ghost"
                  onPress={handleModalClose}
                  className="text-primary-colour"
                  isDisabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-primary-shade-6 text-universal-white"
                  onPress={handleSaveImage}
                  isDisabled={!isValidUrl || isSaving}
                  isLoading={isSaving}
                >
                  {isSaving ? "Uploading..." : (value ? "Update Image" : "Add Image")}
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
