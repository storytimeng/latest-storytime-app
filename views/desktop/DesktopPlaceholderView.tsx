"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import {
  DESKTOP_ROUTE_MAP,
  type DesktopRouteStatus,
} from "@/config/desktopRoutes";

const STATUS_STYLES: Record<DesktopRouteStatus, string> = {
  live: "bg-green-100 text-green-800",
  planned: "bg-amber-100 text-amber-800",
  shared: "bg-gray-100 text-gray-600",
};

type DesktopPlaceholderViewProps = {
  title: string;
  description: string;
  phase: string;
  mobilePath?: string;
};

export function DesktopPlaceholderView({
  title,
  description,
  phase,
  mobilePath,
}: DesktopPlaceholderViewProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-colour">
          {phase}
        </p>
        <h2
          className={cn(
            "mt-2 text-2xl text-[#361B17] md:text-3xl",
            Magnetik_Bold.className,
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            "mt-3 max-w-2xl text-sm leading-relaxed text-[#361B17]/70 md:text-base",
            Magnetik_Regular.className,
          )}
        >
          {description}
        </p>
        {mobilePath && (
          <Link
            href={mobilePath}
            className={cn(
              "mt-6 inline-flex rounded-lg bg-primary-colour px-4 py-2.5 text-sm text-white transition-colors hover:bg-primary-shade-6",
              Magnetik_Medium.className,
            )}
          >
            Use mobile view for now →
          </Link>
        )}
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-6">
        <h3
          className={cn(
            "text-sm font-semibold text-[#361B17]",
            Magnetik_Medium.className,
          )}
        >
          Route rollout tracker
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-[#361B17]/60">
                <th className="pb-2 pr-4 font-medium">Feature</th>
                <th className="pb-2 pr-4 font-medium">Mobile</th>
                <th className="pb-2 pr-4 font-medium">Desktop</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {DESKTOP_ROUTE_MAP.map((entry) => (
                <tr
                  key={`${entry.mobile}-${entry.desktop}`}
                  className="border-b border-black/5 last:border-0"
                >
                  <td className="py-2.5 pr-4 font-medium text-[#361B17]">
                    {entry.label}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-[#361B17]/70">
                    {entry.mobile}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-[#361B17]/70">
                    {entry.desktop}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                        STATUS_STYLES[entry.status],
                      )}
                    >
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
