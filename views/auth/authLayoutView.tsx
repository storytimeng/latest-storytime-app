"use client";

import React, { ReactNode } from "react";
import Image from "next/image";
import { APP_CONFIG } from "@/config";

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
      className={`relative w-full h-screen flex flex-col overflow-y-auto  ${className}`}
    >
      <div className="mt-8 px-5 flex items-center justify-center">
        <Image
          src={APP_CONFIG.images.banner}
          alt={APP_CONFIG.logo.alt}
          width={APP_CONFIG.logo.width}
          height={APP_CONFIG.logo.height}
          className="object-contain"
        />
      </div>

      <div className="flex-1 flex flex-col justify-start px-5 mt-5">
        {children}
      </div>
    </div>
  );
}
