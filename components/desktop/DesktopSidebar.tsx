"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Award,
  Bell,
  BookOpen,
  Crown,
  Home,
  PenTool,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetik_Medium } from "@/lib/font";
import { APP_CONFIG } from "@/config/app";
import {
  DESKTOP_BASE,
  DESKTOP_NAV_ITEMS,
  DESKTOP_SECONDARY_NAV,
} from "@/config/desktopRoutes";
import { ShellSwitchLink } from "./ShellSwitchLink";

const ICONS = {
  home: Home,
  library: BookOpen,
  write: PenTool,
  notifications: Bell,
  profile: User,
  settings: Settings,
  premium: Crown,
  ambassador: Award,
} as const;

function NavItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
}) {
  const pathname = usePathname();
  const Icon = ICONS[icon];
  const active =
    href === `${DESKTOP_BASE}/home`
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        Magnetik_Medium.className,
        active
          ? "bg-primary-colour/10 text-primary-colour font-semibold"
          : "text-[#361B17]/80 hover:bg-black/[0.04] hover:text-[#361B17]",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:border-r md:border-black/10 md:bg-white">
      <div className="flex h-14 items-center border-b border-black/10 px-5">
        <Link href={`${DESKTOP_BASE}/home`} className="flex items-center">
          <Image
            src={APP_CONFIG.logo.src}
            alt={APP_CONFIG.logo.alt}
            width={APP_CONFIG.logo.width}
            height={APP_CONFIG.logo.height}
            className="object-contain"
            priority
          />
        </Link>
      </div>

      <nav
        className="flex flex-1 flex-col gap-1 p-3"
        aria-label="Desktop navigation"
      >
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#361B17]/45">
          Main
        </p>
        {DESKTOP_NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        <div className="my-3 border-t border-black/10" />

        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#361B17]/45">
          Account
        </p>
        {DESKTOP_SECONDARY_NAV.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      <div className="border-t border-black/10 p-3">
        <ShellSwitchLink
          href="/home"
          preference="mobile"
          className={cn(
            "block rounded-lg px-3 py-2 text-xs text-[#361B17]/60 hover:bg-black/[0.04] hover:text-[#361B17]",
            Magnetik_Medium.className,
          )}
        >
          Switch to mobile site →
        </ShellSwitchLink>
      </div>
    </aside>
  );
}
