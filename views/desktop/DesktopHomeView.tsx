"use client";

import Link from "next/link";
import { BookOpen, PenTool, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { DESKTOP_ROUTES } from "@/config/desktopRoutes";
import { useUserProfile } from "@/src/hooks/useUserProfile";

const QUICK_LINKS = [
  {
    label: "Browse library",
    href: DESKTOP_ROUTES.library,
    icon: BookOpen,
    description: "Saved stories, downloads, and reading lists",
  },
  {
    label: "Start writing",
    href: DESKTOP_ROUTES.write,
    icon: PenTool,
    description: "Create or continue a draft",
  },
  {
    label: "Search stories",
    href: DESKTOP_ROUTES.search,
    icon: Search,
    description: "Find stories by title, genre, or author",
  },
] as const;

export function DesktopHomeView() {
  const { user: profileUser } = useUserProfile();
  const name = profileUser?.penName || profileUser?.firstName || "Storyteller";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary-colour/10 p-2.5 text-primary-colour">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-colour">
              Phase 1 · Desktop shell
            </p>
            <h2
              className={cn(
                "mt-1 text-2xl text-[#361B17] md:text-3xl",
                Magnetik_Bold.className,
              )}
            >
              Welcome back, {name}
            </h2>
            <p
              className={cn(
                "mt-2 max-w-2xl text-sm leading-relaxed text-[#361B17]/70 md:text-base",
                Magnetik_Regular.className,
              )}
            >
              This is the new Storytime desktop experience. Your mobile app is
              unchanged — we&apos;re building features here one segment at a
              time, reusing the same data and auth underneath.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map(({ label, href, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-black/10 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-colour/10 text-primary-colour transition-colors group-hover:bg-primary-colour group-hover:text-white">
              <Icon className="h-5 w-5" />
            </div>
            <h3
              className={cn(
                "mt-4 text-base text-[#361B17]",
                Magnetik_Medium.className,
              )}
            >
              {label}
            </h3>
            <p className="mt-1 text-sm text-[#361B17]/60">{description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
