"use client";

import Link from "next/link";
import { BookOpen, PenLine, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { DESKTOP_ROUTES } from "@/config/desktopRoutes";

const ACTIONS = [
  {
    title: "New story",
    description: "Start a draft with the full desktop editor.",
    href: DESKTOP_ROUTES.newStory,
    icon: Plus,
  },
  {
    title: "My stories",
    description: "Review drafts, ongoing work, and published stories.",
    href: DESKTOP_ROUTES.myStories,
    icon: BookOpen,
  },
] as const;

export function DesktopWriteView() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section>
        <h2 className={cn("text-2xl text-[#361B17]", Magnetik_Bold.className)}>
          Write
        </h2>
        <p
          className={cn(
            "mt-2 max-w-2xl text-sm text-[#361B17]/70",
            Magnetik_Regular.className,
          )}
        >
          Create and manage stories from the desktop dashboard. The mobile Pen
          tab remains available if you prefer the phone workflow.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {ACTIONS.map(({ title, description, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-black/10 bg-white p-6 transition-colors hover:border-primary-colour/30 hover:bg-primary-colour/[0.02]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-colour/10 text-primary-colour">
              <Icon className="h-5 w-5" />
            </div>
            <h3
              className={cn(
                "text-lg text-[#361B17] group-hover:text-primary-colour",
                Magnetik_Medium.className,
              )}
            >
              {title}
            </h3>
            <p
              className={cn(
                "mt-1 text-sm text-[#361B17]/60",
                Magnetik_Regular.className,
              )}
            >
              {description}
            </p>
          </Link>
        ))}
      </div>

      <Link
        href="/pen"
        className={cn(
          "inline-flex items-center gap-2 text-sm text-[#361B17]/60 hover:text-[#361B17]",
          Magnetik_Medium.className,
        )}
      >
        <PenLine className="h-4 w-4" />
        Open mobile Pen tab
      </Link>
    </div>
  );
}
