import React from "react";
import { Button } from "@heroui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Magnetik_Medium } from "@/lib/font";

interface NavigationBarProps {
  currentIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  isVisible: boolean;
}

export const NavigationBar = React.memo(
  ({
    currentIndex,
    total,
    onPrevious,
    onNext,
    isVisible,
  }: NavigationBarProps) => {
    return (
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[28rem] bg-[#FFEBD0]/80 backdrop-blur-sm z-40 transition-all duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between w-full">
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              isDisabled={currentIndex === 0}
              className="flex-shrink-0 bg-accent-shade-1 border-complimentary-shade-1 rounded-full p-[6px]"
            >
              <ChevronLeft className="w-6 h-6 text-complimentary-colour" />
            </Button>

            <span
              className={`text-xs text-primary-colour ${Magnetik_Medium.className}`}
            >
              {currentIndex + 1} / {total}
            </span>

            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              onClick={onNext}
              isDisabled={currentIndex === total - 1}
              className="flex-shrink-0 bg-accent-shade-1 border-complimentary-shade-1 rounded-full p-[6px]"
            >
              <ChevronRight className="w-6 h-6 text-complimentary-colour" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

NavigationBar.displayName = "NavigationBar";
