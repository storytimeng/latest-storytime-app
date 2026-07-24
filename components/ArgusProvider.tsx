"use client";

import { type ReactNode } from "react";
import { ArgusErrorBoundary } from "@argusdev/sdk-react";
import { initArgus } from "@/lib/argus";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { cn } from "@/lib/utils";

initArgus();

function ArgusFallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className={cn("text-base text-[#361B17]", Magnetik_Medium.className)}>
        Something went wrong
      </p>
      <p
        className={cn(
          "max-w-sm text-sm text-[#361B17]/70",
          Magnetik_Regular.className,
        )}
      >
        The error was reported. Reload the page to continue.
      </p>
      <button
        type="button"
        className={cn(
          "rounded-full bg-primary-colour px-4 py-2 text-sm text-white",
          Magnetik_Medium.className,
        )}
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </div>
  );
}

export function ArgusProvider({ children }: { children: ReactNode }) {
  return (
    <ArgusErrorBoundary fallback={<ArgusFallback />}>
      {children}
    </ArgusErrorBoundary>
  );
}
