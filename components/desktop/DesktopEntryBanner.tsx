"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Monitor, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import {
  DESKTOP_ROUTES,
  isDesktopAppPath,
} from "@/config/desktopRoutes";
import {
  isWideViewport,
  readShellPreferenceClient,
} from "@/lib/shellRouting";
import { ShellSwitchLink } from "./ShellSwitchLink";

const DISMISS_KEY = "storytime-desktop-prompt-dismissed";

function shouldShowBanner(pathname: string): boolean {
  if (isDesktopAppPath(pathname)) return false;
  if (pathname.startsWith("/auth")) return false;
  if (pathname.startsWith("/premium/callback")) return false;
  if (pathname === "/") return false;

  const preference = readShellPreferenceClient();
  if (preference === "desktop" || preference === "mobile") return false;

  if (typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY)) {
    return false;
  }

  return isWideViewport();
}

export function DesktopEntryBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      setVisible(shouldShowBanner(pathname ?? "/"));
    };

    update();
    const media = window.matchMedia("(min-width: 768px)");
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [pathname]);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 hidden border-t border-black/10 bg-white px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] md:block"
      role="region"
      aria-label="Desktop dashboard suggestion"
    >
      <div className="mx-auto flex max-w-4xl items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-colour/10 text-primary-colour">
          <Monitor className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm text-[#361B17]",
              Magnetik_Medium.className,
            )}
          >
            Try the desktop dashboard
          </p>
          <p
            className={cn(
              "truncate text-xs text-[#361B17]/65",
              Magnetik_Regular.className,
            )}
          >
            Sidebar navigation and wider layouts on larger screens.
          </p>
        </div>
        <ShellSwitchLink
          href={DESKTOP_ROUTES.home}
          preference="desktop"
          className={cn(
            "shrink-0 rounded-lg bg-primary-colour px-3 py-2 text-xs text-white transition-colors hover:bg-primary-shade-6",
            Magnetik_Medium.className,
          )}
        >
          Open dashboard
        </ShellSwitchLink>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg p-2 text-[#361B17]/50 transition-colors hover:bg-black/[0.04] hover:text-[#361B17]"
          aria-label="Dismiss desktop dashboard suggestion"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
