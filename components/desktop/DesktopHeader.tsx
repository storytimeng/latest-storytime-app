"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetik_Medium } from "@/lib/font";
import { DESKTOP_ROUTES } from "@/config/desktopRoutes";
import { useUserProfile } from "@/src/hooks/useUserProfile";

type DesktopHeaderProps = {
  title?: string;
};

export function DesktopHeader({ title = "Dashboard" }: DesktopHeaderProps) {
  const { user: profileUser } = useUserProfile();
  const displayName =
    profileUser?.penName ||
    profileUser?.firstName ||
    profileUser?.email?.split("@")[0] ||
    "Reader";

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-black/10 bg-[#FFFAF1]/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-[#FFFAF1]/80 md:px-6">
      <h1
        className={cn(
          "min-w-0 truncate text-base text-[#361B17] md:text-lg",
          Magnetik_Medium.className,
        )}
      >
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-3">
        <Link
          href={DESKTOP_ROUTES.search}
          className="hidden items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-[#361B17]/60 transition-colors hover:border-black/20 hover:text-[#361B17] sm:flex"
        >
          <Search className="h-4 w-4" />
          <span>Search stories…</span>
        </Link>

        <Link
          href={DESKTOP_ROUTES.profile}
          className={cn(
            "flex max-w-[160px] items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[#361B17] hover:bg-black/[0.04]",
            Magnetik_Medium.className,
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-colour/15 text-xs font-semibold text-primary-colour">
            {displayName.charAt(0).toUpperCase()}
          </span>
          <span className="hidden truncate sm:inline">{displayName}</span>
        </Link>
      </div>
    </header>
  );
}
