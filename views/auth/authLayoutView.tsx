"use client";

import React, { ReactNode } from "react";
import Image from "next/image";
import { APP_CONFIG } from "@/config";
import { cn } from "@/lib/utils";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";

interface AuthLayoutViewProps {
  children: ReactNode;
  className?: string;
}

export default function AuthLayoutView({
  children,
  className = "",
}: AuthLayoutViewProps) {
  return (
    <div
      className={cn(
        "relative left-1/2 min-h-screen w-screen max-w-none -translate-x-1/2",
        "flex flex-col bg-[#FFFAF1] lg:flex-row",
        className,
      )}
    >
      <div className="hidden lg:flex lg:w-[min(480px,45%)] lg:shrink-0 lg:flex-col lg:justify-between lg:bg-primary-colour lg:p-10 lg:text-white">
        <Image
          src={APP_CONFIG.images.banner}
          alt={APP_CONFIG.logo.alt}
          width={160}
          height={52}
          className="object-contain brightness-0 invert"
        />
        <div className="space-y-3">
          <h1
            className={cn(
              "text-2xl leading-tight",
              Magnetik_Bold.className,
            )}
          >
            Stories worth telling
          </h1>
          <p
            className={cn(
              "text-sm leading-relaxed text-white/80",
              Magnetik_Regular.className,
            )}
          >
            Join Storytime to read, write, and share stories from Nigeria and
            beyond.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:items-center lg:justify-center lg:p-8">
        <div className="mt-8 flex items-center justify-center px-5 lg:hidden">
          <Image
            src={APP_CONFIG.images.banner}
            alt={APP_CONFIG.logo.alt}
            width={APP_CONFIG.logo.width}
            height={APP_CONFIG.logo.height}
            className="object-contain"
          />
        </div>

        <div className="mt-5 flex flex-1 flex-col justify-start px-5 lg:mt-0 lg:w-full lg:max-w-md lg:flex-none lg:justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
