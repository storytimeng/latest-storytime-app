"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Magnetik_Medium } from "@/lib/font";
import { useAmbassadorRoutes } from "@/components/ambassador/AmbassadorRoutesProvider";

export function DesktopAmbassadorNav() {
  const pathname = usePathname();
  const routes = useAmbassadorRoutes();

  const items = [
    { label: "Dashboard", href: routes.dashboard },
    { label: "Leaderboard", href: routes.leaderboard },
    { label: "Share link", href: routes.share },
    { label: "Monthly report", href: routes.report },
    { label: "Score breakdown", href: routes.breakdown },
  ];

  return (
    <nav
      className="flex flex-wrap gap-2 lg:flex-col lg:gap-1"
      aria-label="Ambassador navigation"
    >
      {items.map(({ label, href }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm transition-colors",
              Magnetik_Medium.className,
              active
                ? "bg-primary-colour/10 text-primary-colour font-semibold"
                : "text-[#361B17]/80 hover:bg-black/[0.04] hover:text-[#361B17]",
            )}
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
