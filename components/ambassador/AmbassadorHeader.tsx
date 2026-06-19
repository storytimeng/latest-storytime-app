"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Magnetik_Medium } from "@/lib/font";
import { cn } from "@/lib";

interface AmbassadorHeaderProps {
  title: string;
  backHref?: string;
  className?: string;
}

export function AmbassadorHeader({
  title,
  backHref = "/profile",
  className,
}: AmbassadorHeaderProps) {
  return (
    <div
      className={cn("px-4 pt-5 pb-4 bg-primary-colour text-white", className)}
    >
      <div className="flex items-center gap-3 max-w-md mx-auto">
        <Link href={backHref} className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className={cn(Magnetik_Medium.className, "text-lg")}>{title}</h1>
      </div>
    </div>
  );
}
