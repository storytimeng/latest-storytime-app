"use client";

import React from "react";
import Link from "next/link";
import { Switch } from "@heroui/switch";
import { ChevronRight } from "lucide-react";
import { Magnetik_Regular } from "@/lib/font";
import { cn } from "@/lib";

export interface SettingOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  hasToggle?: boolean;
  isEnabled?: boolean;
  route?: string;
  isDanger?: boolean;
  onToggle?: (enabled: boolean) => void;
}

interface SettingsOptionProps {
  option: SettingOption;
  onOptionClick?: (optionId: string) => void;
  className?: string;
}

const SettingsOption: React.FC<SettingsOptionProps> = ({
  option,
  onOptionClick,
  className = "",
}) => {
  const baseClasses = "flex items-center justify-between px-8 py-4";
  const interactiveClasses = "transition-colors cursor-pointer hover:bg-light-grey-1";
  
  const textColor = option.isDanger ? "text-red" : "text-primary-colour";
  const textColorDanger = option.isDanger ? "text-red-500" : "text-primary-colour";

  // Toggle option
  if (option.hasToggle) {
    return (
      <div className={cn(baseClasses, className)}>
        <div className="flex items-center gap-3">
          <div className="text-primary-colour">{option.icon}</div>
          <span className={cn("text-primary-colour", Magnetik_Regular.className)}>
            {option.label}
          </span>
        </div>
        <Switch
          defaultSelected={option.isEnabled}
          onValueChange={option.onToggle}
          color="warning"
          size="sm"
        />
      </div>
    );
  }

  // Navigation option (has route)
  if (option.route) {
    return (
      <Link href={option.route}>
        <div className={cn(baseClasses, interactiveClasses, className)}>
          <div className="flex items-center gap-3">
            <div className={textColorDanger}>{option.icon}</div>
            <span className={cn(textColorDanger, Magnetik_Regular.className)}>
              {option.label}
            </span>
          </div>
          <ChevronRight size={16} className={textColorDanger} />
        </div>
      </Link>
    );
  }

  // Modal option (no route)
  return (
    <div
      onClick={() => onOptionClick?.(option.id)}
      className={cn(baseClasses, interactiveClasses, className)}
    >
      <div className="flex items-center gap-3">
        <div className={textColor}>{option.icon}</div>
        <span className={cn(textColor, Magnetik_Regular.className)}>
          {option.label}
        </span>
      </div>
      <ChevronRight
        size={16}
        className={option.isDanger ? "text-red" : "text-grey-2"}
      />
    </div>
  );
};

export default SettingsOption;
