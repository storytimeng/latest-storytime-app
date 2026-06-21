"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { cn } from "@/lib";
import { useAmbassadorRoutes } from "@/components/ambassador/AmbassadorRoutesProvider";

interface AmbassadorHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  className?: string;
}

export function AmbassadorHeader({
  title,
  subtitle,
  backHref,
  className,
}: AmbassadorHeaderProps) {
  const routes = useAmbassadorRoutes();
  const resolvedBackHref = backHref ?? routes.profile;

  return (
    <div
      className={cn("px-4 pt-5 pb-4 bg-primary-colour text-white", className)}
    >
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <Link href={resolvedBackHref} className="text-white shrink-0">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="min-w-0">
            <h1
              className={cn(Magnetik_Medium.className, "text-lg leading-tight")}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={cn(
                  Magnetik_Regular.className,
                  "text-xs text-white/80 mt-0.5",
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
