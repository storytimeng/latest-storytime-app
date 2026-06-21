import { ReactNode } from "react";
import { headers } from "next/headers";
import { cn } from "@/lib/utils";
import {
  STORYTIME_SHELL_HEADER,
  type StorytimeShell,
} from "@/config/desktopRoutes";
import { AmbassadorRoutesProvider } from "@/components/ambassador/AmbassadorRoutesProvider";

type AppRootShellProps = {
  className?: string;
  children: ReactNode;
};

function shellFromHeaders(headerValue: string | null): StorytimeShell {
  return headerValue === "desktop" ? "desktop" : "mobile";
}

/**
 * Root layout shell — mobile uses a constrained <main>; desktop uses a full-width
 * wrapper so DesktopShell can own the primary content landmark.
 *
 * Shell mode is resolved on the server via middleware (no client pathname), which
 * keeps SSR and hydration markup aligned.
 */
export async function AppRootShell({ className, children }: AppRootShellProps) {
  const headersList = await headers();
  const shell = shellFromHeaders(headersList.get(STORYTIME_SHELL_HEADER));

  const content =
    shell === "desktop" ? (
      <div
        className={cn(
          "w-full h-screen overflow-hidden bg-[#FFFAF1]",
          className,
        )}
      >
        {children}
      </div>
    ) : (
      <main
        className={cn(
          "w-full min-h-screen max-w-md mx-auto bg-[#FFFAF1]",
          className,
        )}
      >
        {children}
      </main>
    );

  return (
    <AmbassadorRoutesProvider shell={shell}>{content}</AmbassadorRoutesProvider>
  );
}
