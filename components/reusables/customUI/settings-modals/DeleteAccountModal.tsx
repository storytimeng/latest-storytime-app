"use client";

import React, { useState } from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@/components/ui/button";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { useUserStore } from "@/src/stores/useUserStore";
import { getAuthToken } from "@/src/stores/useAuthStore";
import { showToast } from "@/lib/showNotification";

interface DeleteAccountModalProps {
  onClose?: () => void;
}

const DeleteAccountModal = ({ onClose }: DeleteAccountModalProps) => {
  const { user } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);

  const handleRequestDeletion = async () => {
    if (!user?.id) {
      showToast({ type: "error", message: "Unable to identify your account. Please log in again." });
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.storytime.ng";
      const token = getAuthToken();

      const res = await fetch(`${apiUrl}/users/${user.id}/request-deletion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to submit deletion request.");
      }

      if (data.scheduledDate) {
        const formatted = new Date(data.scheduledDate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        setScheduledDate(formatted);
      }
      setSubmitted(true);
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <ModalHeader>
          <h2 className={`text-xl ${Magnetik_Bold.className}`}>
            Request Submitted
          </h2>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className={`text-amber-800 font-medium ${Magnetik_Medium.className}`}>
                Your account deletion request has been submitted.
              </p>
            </div>
            {scheduledDate && (
              <p className={`text-grey-2 ${Magnetik_Regular.className}`}>
                Your account is scheduled for deletion on{" "}
                <strong className="text-foreground">{scheduledDate}</strong>.
              </p>
            )}
            <p className={`text-grey-2 text-sm ${Magnetik_Regular.className}`}>
              You will receive a confirmation email shortly. Your account remains active during this period. Our team will review your request and you will be notified.
            </p>
            <Button variant="bordered" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </ModalBody>
      </>
    );
  }

  return (
    <>
      <ModalHeader>
        <h2 className={`text-xl text-red ${Magnetik_Bold.className}`}>
          Delete Account
        </h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-4">
          <p className={`text-grey-2 ${Magnetik_Regular.className}`}>
            Are you sure you want to delete your account?
          </p>
          <div className="bg-red/10 p-3 rounded-lg border border-red/20">
            <p className={`text-red text-sm ${Magnetik_Medium.className}`}>
              ⚠️ Your deletion request will be reviewed by our team. Your account will be deleted within 30 days and you will receive a confirmation email.
            </p>
          </div>

          <div className="space-y-2">
            <p className={`text-sm font-medium ${Magnetik_Medium.className}`}>
              What will be deleted:
            </p>
            <ul className={`text-sm text-grey-2 space-y-1 ${Magnetik_Regular.className}`}>
              <li>• All your written stories</li>
              <li>• Reading progress and bookmarks</li>
              <li>• Profile information and preferences</li>
              <li>• Account history and achievements</li>
            </ul>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="bordered" className="flex-1" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleRequestDeletion}
              disabled={isLoading}
            >
              {isLoading ? "Submitting…" : "Delete Account"}
            </Button>
          </div>
        </div>
      </ModalBody>
    </>
  );
};

export default DeleteAccountModal;
