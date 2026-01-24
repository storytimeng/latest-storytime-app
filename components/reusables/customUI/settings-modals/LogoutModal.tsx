"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@/components/ui/button";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";
import { useLogout } from "@/src/hooks/useAuth";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/showNotification";

interface LogoutModalProps {
  onClose?: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ onClose }) => {
  const { logout } = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      showToast({
        type: "success",
        message: "Logged out successfully",
      });
      router.push("/auth/login");
      onClose?.();
    } catch (error) {
      console.error("Logout error:", error);
      showToast({
        type: "error",
        message: "Failed to logout. Please try again.",
      });
    }
  };

  return (
    <>
      <ModalHeader>
        <h2 className={`text-xl text-primary-colour ${Magnetik_Bold.className}`}>
          Log Out
        </h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-6">
          <p className={`text-primary-colour text-center ${Magnetik_Regular.className}`}>
            Are you sure you want to log out?
          </p>

          <div className="flex gap-3">
            <Button
              variant="bordered"
              className="flex-1"
              onPress={onClose}
            >
              No
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onPress={handleLogout}
            >
              Yes
            </Button>
          </div>
        </div>
      </ModalBody>
    </>
  );
};

export default LogoutModal;
