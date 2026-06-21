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
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-[#FFFAF1]">
      <DesktopSidebar />
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DesktopHeader title={title} />
        <DesktopMobileNav />
        <main
          id="main-content"
          className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
