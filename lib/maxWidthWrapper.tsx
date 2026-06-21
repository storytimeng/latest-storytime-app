"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isDesktopAppPath } from "@/config/desktopRoutes";

export function MaxWidthWrapper({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isDesktop = isDesktopAppPath(pathname);

  return (
    <main
      className={cn(
        "w-full min-h-screen bg-[#FFFAF1]",
        !isDesktop && "max-w-md mx-auto",
        className,
      )}
    >
      {children}
    </main>
  );
}
