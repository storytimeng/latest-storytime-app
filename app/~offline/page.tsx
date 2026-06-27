"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { WifiOff, RefreshCw, BookOpen } from "lucide-react";
import { Magnetik_Bold, Magnetik_Medium } from "@/lib/font";

/**
 * Serwist's Turbopack fallback page.
 *
 * This URL is precached and served by the service worker when a navigation
 * request fails. Keep it client-only and lightweight - no network calls,
 * no IndexedDB reads - so it can render instantly offline.
 */
export default function OfflineFallback() {
  const router = useRouter();

  const handleRetry = () => {
    if (typeof window === "undefined") return;
    if (navigator.onLine) {
      router.back();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-grey-1/10 flex items-center justify-center">
            <WifiOff size={40} className="text-grey-1" />
          </div>
        </div>

        <h1
          className={`${Magnetik_Bold.className} text-2xl text-primary-colour mb-3`}
        >
          You&rsquo;re Offline
        </h1>

        <p className={`${Magnetik_Medium.className} text-grey-1 text-sm mb-8`}>
          It looks like you&rsquo;ve lost your internet connection. Some
          features may be limited.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onPress={handleRetry}
            className="w-full bg-primary-colour text-white"
            startContent={<RefreshCw size={18} />}
          >
            Try Again
          </Button>

          <Button
            onPress={() => router.push("/library?tab=downloads")}
            variant="bordered"
            className="w-full border-grey-1 text-grey-2"
            startContent={<BookOpen size={18} />}
          >
            View Downloaded Stories
          </Button>
        </div>

        <div className="mt-8 p-4 bg-primary-colour/5 rounded-lg">
          <p className={`${Magnetik_Medium.className} text-xs text-grey-2`}>
            💡 Tip: Download stories while online to read them anytime, even
            without internet!
          </p>
        </div>
      </div>
    </div>
  );
}
