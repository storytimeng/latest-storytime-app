"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Magnetik_Medium } from "@/lib/font";
import { DESKTOP_NAV_ITEMS } from "@/config/desktopRoutes";
import { ShellSwitchLink } from "./ShellSwitchLink";

export function DesktopMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-black/10 bg-white px-3 py-2 md:hidden"
      aria-label="Mobile desktop navigation"
    >
      {DESKTOP_NAV_ITEMS.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs transition-colors",
              Magnetik_Medium.className,
              active
                ? "bg-primary-colour text-white"
                : "bg-black/[0.04] text-[#361B17]/80",
            )}
          >
            {label}
          </Link>
        );
      })}
      <ShellSwitchLink
        href="/home"
        preference="mobile"
        className={cn(
          "shrink-0 rounded-full px-3 py-1.5 text-xs text-[#361B17]/60",
          Magnetik_Medium.className,
        )}
      >
        Mobile site
      </ShellSwitchLink>
    </nav>
  );
}
