"use client";

import { usePathname } from "next/navigation";
import {
  storytimeShellFromPathname,
  type StorytimeShell,
} from "@/config/desktopRoutes";

export function useStorytimeShell(): StorytimeShell {
  const pathname = usePathname();
  return storytimeShellFromPathname(pathname ?? "/");
}
