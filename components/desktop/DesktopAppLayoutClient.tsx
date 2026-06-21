"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DesktopShell } from "./DesktopShell";

const PAGE_TITLES: Record<string, string> = {
  "/app/home": "Home",
  "/app/library": "Library",
  "/app/write": "Write",
  "/app/notifications": "Notifications",
  "/app/profile": "Profile",
  "/app/settings": "Settings",
  "/app/search": "Search",
  "/app/premium": "Premium",
  "/app/ambassador": "Ambassador",
  "/app/my-stories": "My stories",
  "/app/genres": "All genres",
};

function titleFromPath(pathname: string): string {
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname];
  }

  if (pathname.startsWith("/app/stories/") && pathname.endsWith("/read")) {
    return "Read story";
  }
  if (pathname.startsWith("/app/stories/") && pathname.endsWith("/edit")) {
    return "Edit story";
  }
  if (pathname.startsWith("/app/stories/")) {
    return "Story";
  }
  if (pathname.startsWith("/app/genres/")) {
    return "Genre";
  }
  if (pathname.startsWith("/app/ambassador/")) {
    return "Ambassador";
  }

  return "Storytime";
}

export function DesktopAppLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const title = titleFromPath(pathname ?? "/app/home");

  return <DesktopShell title={title}>{children}</DesktopShell>;
}
