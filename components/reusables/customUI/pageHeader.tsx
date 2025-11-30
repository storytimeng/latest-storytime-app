"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title?: string;
  backLink?: string;
  className?: string;
  titleClassName?: string;
  backButtonClassName?: string;
  showBackButton?: boolean;
  iconSize?: number;
}

const PageHeader = ({
  title,
  backLink = "/home",
  className = "my-[13px]",
  titleClassName = "body-text-small-medium-auto text-primary-colour",
  backButtonClassName = "text-primary-colour",
  showBackButton = true,
  iconSize = 18,
}: PageHeaderProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center relative mb-6" ,
        className
      )}
    >
      {showBackButton && (
        <Link
          href={backLink}
          className={cn(
            "absolute left-0 text-primary-colour pl-3",
            backButtonClassName
          )}
        >
          <ArrowLeft size={iconSize} className="" />
        </Link>
      )}
      {title && <h1 className={cn(titleClassName)}>{title}</h1>}
    </div>
  );
};

export default PageHeader;
