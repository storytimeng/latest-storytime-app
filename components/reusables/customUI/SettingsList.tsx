"use client";

import React from "react";
import SettingsOption, { SettingOption } from "./SettingsOption";

interface SettingsListProps {
  options: SettingOption[];
  onOptionClick?: (optionId: string) => void;
  className?: string;
}

const SettingsList: React.FC<SettingsListProps> = ({
  options,
  onOptionClick,
  className = "",
}) => {
  return (
    <div className={`pt-6 ${className}`}>
      <div className="overflow-hidden rounded-lg">
        {options.map((option, index) => (
          <div key={option.id}>
            <SettingsOption option={option} onOptionClick={onOptionClick} />
            
            {/* Divider - not for last item */}
            {index < options.length - 1 && (
              <div className="h-px bg-light-grey-3" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsList;
