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

  if (isDesktopAppPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <main
      className={cn(
        "w-full min-h-screen max-w-md mx-auto bg-[#FFFAF1]",
        className,
      )}
    >
      {children}
    </main>
  );
}
