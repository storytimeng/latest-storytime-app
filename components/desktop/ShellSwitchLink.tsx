"use client";

import Link from "next/link";
import { ReactNode } from "react";
import {
  type ShellPreference,
  writeShellPreferenceClient,
} from "@/lib/shellRouting";

type ShellSwitchLinkProps = {
  href: string;
  preference: ShellPreference;
  className?: string;
  children: ReactNode;
};

export function ShellSwitchLink({
  href,
  preference,
  className,
  children,
}: ShellSwitchLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => writeShellPreferenceClient(preference)}
    >
      {children}
    </Link>
  );
}
