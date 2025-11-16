"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Crown } from "lucide-react";
import Link from "next/link";
import { Magnetik_Medium } from "@/lib/font";

interface PremiumButtonProps {
  variant?: "default" | "small" | "banner";
  className?: string;
  children?: React.ReactNode;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({ 
  variant = "default", 
  className = "",
  children 
}) => {
  const getButtonContent = () => {
    if (children) return children;
    
    switch (variant) {
      case "small":
        return (
          <div className="flex items-center gap-1">
            <Crown className="w-4 h-4" />
            <span>Premium</span>
          </div>
        );
      case "banner":
        return "Upgrade to Premium";
      default:
        return (
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            <span>Go Premium</span>
          </div>
        );
    }
  };

  const getButtonStyles = () => {
    switch (variant) {
      case "small":
        return `bg-gradient-to-r from-complimentary-colour to-complimentary-shade-1 text-universal-white px-3 py-1 text-xs ${Magnetik_Medium.className}`;
      case "banner":
        return `bg-gradient-to-r from-complimentary-colour to-complimentary-shade-1 text-universal-white px-6 py-3 text-base ${Magnetik_Medium.className}`;
      default:
        return `bg-gradient-to-r from-complimentary-colour to-complimentary-shade-1 text-universal-white px-4 py-2 ${Magnetik_Medium.className}`;
    }
  };

  return (
    <Link href="/premium">
      <Button
        className={`${getButtonStyles()} hover:shadow-lg transition-all duration-200 ${className}`}
        size={variant === "small" ? "sm" : variant === "banner" ? "lg" : "md"}
      >
        {getButtonContent()}
      </Button>
    </Link>
  );
};

export default PremiumButton;