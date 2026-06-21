"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Magnetik_Medium } from "@/lib/font";
import { DESKTOP_ROUTES } from "@/config/desktopRoutes";
import { DesktopAmbassadorNav } from "@/components/desktop/DesktopAmbassadorNav";
import { useAmbassadorRoutes } from "@/components/ambassador/AmbassadorRoutesProvider";

type DesktopAmbassadorShellProps = {
  children: ReactNode;
  showNav?: boolean;
};

export function DesktopAmbassadorShell({
  children,
  showNav = true,
}: DesktopAmbassadorShellProps) {
  const routes = useAmbassadorRoutes();

  if (!showNav) {
    return <div className="mx-auto max-w-3xl">{children}</div>;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:gap-8">
      <aside className="w-full shrink-0 lg:w-56 xl:w-64">
        <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-4 lg:sticky lg:top-20">
          <Link
            href={DESKTOP_ROUTES.profile}
            className={cn(
              "block text-sm text-[#361B17]/60 hover:text-primary-colour",
              Magnetik_Medium.className,
            )}
          >
            ← Back to profile
          </Link>
          <DesktopAmbassadorNav />
          <Link
            href={routes.hub}
            className={cn(
              "block text-sm text-[#361B17]/60 hover:text-primary-colour",
              Magnetik_Medium.className,
            )}
          >
            Ambassador program info
          </Link>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
