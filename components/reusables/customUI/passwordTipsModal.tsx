"use client";

import { PASSWORD_TIPS_CONFIG } from "@/config";
import { X } from "lucide-react";

interface PasswordTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordTipsModal({
  isOpen,
  onClose,
}: PasswordTipsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-grey-1 hover:text-grey-2"
        >
          <X size={24} />
        </button>

        <h2 className="body-text-big-bold text-dark-grey-1 mb-5">
          {PASSWORD_TIPS_CONFIG.title}
        </h2>

        <ol className="space-y-3">
          {PASSWORD_TIPS_CONFIG.tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="body-text-small-regular-auto text-dark-grey-1 min-w-[20px]">
                {index + 1}.
              </span>
              <span className="body-text-small-regular-auto text-dark-grey-1">
                {tip}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
