"use client";

import React from "react";
import { Card } from "@heroui/card";
import { Magnetik_Regular, Magnetik_Bold } from "@/lib/font";

interface PremiumBannerProps {
  title?: string;
  subtitle?: string;
  emoji?: string;
  className?: string;
  link?: string;
}

const PremiumBanner: React.FC<PremiumBannerProps> = ({
  title = "Go premium",
  subtitle = "To enjoy full benefit on Storytime",
  emoji = "🚀",
  className = "",
}) => {
  return (
    <div className={`mb-4 bg-[#FFEBD0] rounded-lg shadow-xl ${className}`}>
      <Card className="bg-[#FFEBD0] border-none p-4 relative overflow-hidden rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p
                className={`text-[10px] text-grey-2 mb-[4px] ${Magnetik_Regular.className}`}
              >
                {subtitle}
              </p>
            </div>
            <span
              className={`text-[14px] font-bold text-[#F8951D] ${Magnetik_Bold.className}`}
            >
              {title}
            </span>
          </div>
          <div className="text-4xl">{emoji}</div>
        </div>
      </Card>
    </div>
  );
};

export default PremiumBanner;
