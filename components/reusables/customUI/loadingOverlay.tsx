"use client";

import { useLoadingStore } from "@/src/stores/useLoadingStore";

export default function LoadingOverlay() {
  const { isVisible, message } = useLoadingStore();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-[#101010CC] flex flex-col items-center justify-center z-50">
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
      <p className="body-text-small-bold-auto text-universal-white text-center">
        {message}
      </p>
    </div>
  );
}

