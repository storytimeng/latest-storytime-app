"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import TextAreaField from "@/components/reusables/form/textArea";
import type { AdditionalInfoModalProps } from "@/types/story";

/**
 * Modal component for collecting additional story information
 * (author's note and consent)
 * Lazy-loaded to reduce initial bundle size
 */
const AdditionalInfoModal: React.FC<AdditionalInfoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSkip,
}) => {
  const [authorNote, setAuthorNote] = useState("");
  const [giveConsent, setGiveConsent] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="bg-universal-white rounded-t-2xl w-full max-w-[28rem] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2
            className={`text-xl text-primary-colour ${Magnetik_Bold.className}`}
          >
            Additional Information
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          <TextAreaField
            label="Author's note (optional)"
            htmlFor="authorNote"
            id="authorNote"
            isInvalid={false}
            errorMessage=""
            placeholder="Add author's note"
            value={authorNote}
            onChange={setAuthorNote}
            rows={4}
          />

          <div className="flex items-center gap-3">
            <Switch
              isSelected={giveConsent}
              onValueChange={setGiveConsent}
              size="sm"
              color="warning"
              classNames={{
                wrapper: "group-data-[selected=true]:bg-primary-shade-6",
                thumb: "group-data-[selected=true]:bg-universal-white",
              }}
            />
            <span
              className={`text-primary-colour text-sm ${Magnetik_Regular.className}`}
            >
              Give Consent of Ownership
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className={`w-full bg-primary-shade-6 text-universal-white py-3 ${Magnetik_Medium.className}`}
            onClick={() => onSubmit(authorNote, giveConsent)}
          >
            Publish Story
          </Button>
          <Button
            variant="ghost"
            className={`w-full text-primary-colour ${Magnetik_Regular.className}`}
            onClick={onSkip}
          >
            Skip to Publish Story
          </Button>
        </div>
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export default React.memo(AdditionalInfoModal);
