"use client";

import { ReactNode } from "react";
import { DesktopSidebar } from "./DesktopSidebar";
import { DesktopHeader } from "./DesktopHeader";
import { DesktopMobileNav } from "./DesktopMobileNav";

type DesktopShellProps = {
  children: ReactNode;
  title?: string;
};

export function DesktopShell({ children, title }: DesktopShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-[#FFFAF1]">
      <DesktopSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <DesktopHeader title={title} />
        <DesktopMobileNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
