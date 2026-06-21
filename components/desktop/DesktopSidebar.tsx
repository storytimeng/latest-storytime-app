"use client";

import Link from "next/link";
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
import { Magnetik_Medium, Magnetik_Bold } from "@/lib/font";
import {
  DESKTOP_BASE,
  DESKTOP_NAV_ITEMS,
  DESKTOP_SECONDARY_NAV,
} from "@/config/desktopRoutes";

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
        <Link href={`${DESKTOP_BASE}/home`} className="flex items-center gap-2">
          <span
            className={cn(
              "text-lg text-primary-colour",
              Magnetik_Bold.className,
            )}
          >
            Storytime
          </span>
          <span className="rounded-md bg-primary-colour/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-colour">
            Desktop
          </span>
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
        <Link
          href="/home"
          className={cn(
            "block rounded-lg px-3 py-2 text-xs text-[#361B17]/60 hover:bg-black/[0.04] hover:text-[#361B17]",
            Magnetik_Medium.className,
          )}
        >
          Switch to mobile site →
        </Link>
      </div>
    </aside>
  );
}
