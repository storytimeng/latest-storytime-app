"use client";

import { useRouter } from "next/navigation";
import { useLoadingStore } from "@/src/stores/useLoadingStore";

export default function LoadingOverlay() {
  const router = useRouter();
  const { isVisible, message, cancellable, cancelLabel, onCancel, hide } =
    useLoadingStore();

  if (!isVisible) return null;

  const handleCancel = () => {
    onCancel?.();
    hide();
  };

  const handleBack = () => {
    onCancel?.();
    hide();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#101010CC] flex flex-col items-center justify-center z-50 px-6">
      {/* Spinner */}
      <div className="w-8 h-8 mb-4">
        <svg
          className="animate-spin w-8 h-8 text-universal-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>

      {/* Message */}
      <p className="body-text-small-bold-auto text-universal-white text-center mb-5">
        {message}
      </p>

      {cancellable && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-full border border-universal-white/40 text-xs text-universal-white hover:bg-universal-white/10 transition-colors"
          >
            {cancelLabel || "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 rounded-full bg-universal-white/15 text-xs text-universal-white hover:bg-universal-white/25 transition-colors"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}

