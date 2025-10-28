"use client";

import React from "react";
import { Button as HeroUIButton } from "@heroui/react";
import { Magnetik_Regular } from "@/lib/font";
import { cn } from "@/lib/utils";

export interface CustomButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "text" | "google" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  isDisabled?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  isDisabled = false,
  startContent,
  endContent,
  className,
  onClick,
  type = "button",
  fullWidth = false,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          className: cn(
            "bg-primary-colour text-white hover:bg-primary-colour/90 font-medium rounded-2xl border-0",
            Magnetik_Regular.className
          ),
          color: "primary" as const,
        };
      case "secondary":
        return {
          className: cn(
            "bg-transparent border-2 border-complimentary-colour text-primary-colour hover:bg-complimentary-colour/10 font-medium rounded-2xl",
            Magnetik_Regular.className
          ),
          variant: "bordered" as const,
        };
      case "text":
        return {
          className: cn(
            "bg-transparent text-primary-colour hover:text-primary-colour/80 font-medium underline-offset-4 hover:underline p-0 h-auto min-w-0",
            Magnetik_Regular.className
          ),
          variant: "light" as const,
        };
      case "google":
        return {
          className: cn(
            "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium rounded-2xl shadow-sm",
            Magnetik_Regular.className
          ),
          variant: "bordered" as const,
        };
      case "icon":
        return {
          className: cn(
            "bg-complimentary-colour text-white hover:bg-complimentary-colour/90 rounded-full min-w-0 p-0 aspect-square",
            Magnetik_Regular.className
          ),
          isIconOnly: true as const,
        };
      default:
        return {
          className: cn(Magnetik_Regular.className),
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "h-9 px-3 text-xs";
      case "md":
        return "h-10 px-4 text-sm";
      case "lg":
        return "h-12 px-6 text-sm";
      case "xl":
        return "h-14 px-8 text-base";
      default:
        return "h-10 px-4 text-sm";
    }
  };

  const variantConfig = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <HeroUIButton
      {...variantConfig}
      className={cn(
        variantConfig.className,
        sizeStyles,
        fullWidth && "w-full",
        className
      )}
      isLoading={isLoading}
      isDisabled={isDisabled}
      startContent={startContent}
      endContent={endContent}
      onPress={onClick}
      type={type}
      radius="lg"
      {...props}
    >
      {children}
    </HeroUIButton>
  );
};

export default CustomButton;
