"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Magnetik_Bold, Magnetik_Medium } from "@/lib/font";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  // Check if this is a network/offline error
  const isNetworkError = 
    error.message?.includes("fetch") || 
    error.message?.includes("network") ||
    error.message?.includes("timeout") ||
    !navigator.onLine;

  return (
    <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          {isNetworkError ? (
            <div className="w-20 h-20 rounded-full bg-grey-1/10 flex items-center justify-center">
              <WifiOff size={40} className="text-grey-1" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className={`${Magnetik_Bold.className} text-2xl text-primary-colour mb-3`}>
          {isNetworkError ? "You're Offline" : "Something Went Wrong"}
        </h1>

        {/* Description */}
        <p className={`${Magnetik_Medium.className} text-grey-1 text-sm mb-8`}>
          {isNetworkError 
            ? "Please check your internet connection and try again."
            : "We encountered an unexpected error. Please try refreshing the page."}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => reset()}
            className="w-full bg-primary-colour text-white"
            startContent={<RefreshCw size={18} />}
          >
            Try Again
          </Button>
          
          <Button
            onClick={() => router.push("/")}
            variant="bordered"
            className="w-full border-grey-1 text-grey-2"
            startContent={<Home size={18} />}
          >
            Go Home
          </Button>
        </div>

        {/* Error details in dev mode */}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left">
            <summary className={`${Magnetik_Medium.className} text-xs text-grey-1 cursor-pointer`}>
              Error Details (Dev Only)
            </summary>
            <pre className="mt-2 p-3 bg-black/5 rounded text-xs text-red-500 overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
