"use client";

import { useEffect } from "react";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("Error caught by error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-shade-1 px-4">
      <div className="max-w-md w-full text-center">
        <h2
          className={`text-2xl text-primary-colour mb-4 ${Magnetik_Bold.className}`}
        >
          Something went wrong!
        </h2>
        <p
          className={`text-primary-shade-4 mb-6 ${Magnetik_Regular.className}`}
        >
          {error.message || "An unexpected error occurred"}
        </p>
        {error.digest && (
          <p
            className={`text-xs text-primary-shade-3 mb-4 ${Magnetik_Regular.className}`}
          >
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className={`bg-complimentary-colour text-universal-white px-6 py-3 rounded-lg ${Magnetik_Regular.className}`}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
