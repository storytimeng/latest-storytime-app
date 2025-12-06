import { useState } from "react";
import { usersControllerUpdateProfile } from "../client/sdk.gen";
import { useUserProfile } from "./useUserProfile";
import { showToast } from "@/lib/showNotification";
import type { UsersControllerUpdateProfileData } from "../client/types.gen";

export function useUpdateProfile() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { mutate } = useUserProfile();

  const updateProfile = async (data: UsersControllerUpdateProfileData["body"]) => {
    setIsUpdating(true);
    try {
      const response = await usersControllerUpdateProfile({
        body: data,
      });

      if (response.error) {
        throw response.error;
      }

      // Refresh profile data
      await mutate();
      
      showToast({
        type: "success",
        message: "Profile updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Failed to update profile:", error);
      showToast({
        type: "error",
        message: "Failed to update profile. Please try again.",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateProfile,
    isUpdating,
  };
}
