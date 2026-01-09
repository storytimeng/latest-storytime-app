"use client";

import React, { useState, useEffect } from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Magnetik_Bold, Magnetik_Medium } from "@/lib/font";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useUpdateProfile } from "@/src/hooks/useUpdateProfile";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import ImageUpload from "@/components/reusables/form/imageUpload";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import { UPLOAD_PATHS } from "@/src/config/uploadPaths";

export const EditProfileModal = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserProfile();
  const { updateProfile, isUpdating } = useUpdateProfile();
  const { upload: avatarUpload, isUploading: isAvatarUploading } = useImageUpload(UPLOAD_PATHS.USER_AVATAR);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    penName: "",
    bio: "",
    avatar: "",
    profilePicture: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        penName: user.penName || "",
        bio: user.bio || "",
        avatar: user.avatar || user.profilePicture || "",
        profilePicture: user.profilePicture || user.avatar || "",
      });
    }
  }, [user]);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      [field]: value,
      // If updating one, update both for compatibility
      ...(field === "avatar" ? { profilePicture: value } : {}),
      ...(field === "profilePicture" ? { avatar: value } : {}),
    }));
  };

  const handleSave = async () => {
    const success = await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      penName: formData.penName,
      bio: formData.bio,
      avatar: formData.avatar,
      profilePicture: formData.profilePicture,
    });

    if (success) {
      handleClose();
    }
  };

  return (
    <>
      <ModalHeader className="flex flex-col gap-1 pb-4">
        <h2 className={`text-xl text-center ${Magnetik_Bold.className}`}>
          Edit Profile
        </h2>
      </ModalHeader>
      <ModalBody className="pb-6 overflow-y-auto">
        <div className="space-y-6 pb-10">
          {/* Avatar Upload */}
          <div className="flex justify-center">
            <div className="w-32 h-32">
              <ImageUpload
                value={formData.avatar}
                onChange={(url) => handleChange("avatar", url || "")}
                aspectRatio="square"
                placeholder="Upload Avatar"
                className="rounded-full overflow-hidden"
                autoUpload={true}
                uploadFn={avatarUpload}
                isUploading={isAvatarUploading}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                label="First Name"
                placeholder="Enter first name"
                value={formData.firstName}
                onValueChange={(val) => handleChange("firstName", val)}
                variant="bordered"
                classNames={{
                  label: Magnetik_Medium.className,
                  input: Magnetik_Medium.className,
                }}
              />
              <Input
                label="Last Name"
                placeholder="Enter last name"
                value={formData.lastName}
                onValueChange={(val) => handleChange("lastName", val)}
                variant="bordered"
                classNames={{
                  label: Magnetik_Medium.className,
                  input: Magnetik_Medium.className,
                }}
              />
            </div>

            <Input
              label="Pen Name"
              placeholder="Enter pen name"
              value={formData.penName}
              onValueChange={(val) => handleChange("penName", val)}
              variant="bordered"
              description="This will be displayed publicly"
              classNames={{
                label: Magnetik_Medium.className,
                input: Magnetik_Medium.className,
              }}
            />

            <Textarea
              label="Bio"
              placeholder="Tell us about yourself"
              value={formData.bio}
              onValueChange={(val) => handleChange("bio", val)}
              variant="bordered"
              classNames={{
                label: Magnetik_Medium.className,
                input: Magnetik_Medium.className,
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="bordered"
              className="flex-1 border-2 border-primary-colour h-14"
              onClick={handleClose}
            >
              <span className={Magnetik_Medium.className}>Cancel</span>
            </Button>
            <Button
              className="flex-1 bg-primary-colour text-white h-14"
              onClick={handleSave}
              isLoading={isUpdating}
            >
              <span className={Magnetik_Medium.className}>Save</span>
            </Button>
          </div>
        </div>
      </ModalBody>
    </>
  );
};
