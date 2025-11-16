import React from "react";
import { Button } from "@/components/ui/button";
import { Magnetik_Medium } from "@/lib/font";

interface GenreButtonProps {
  genre: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

const GenreButton: React.FC<GenreButtonProps> = ({
  genre,
  isSelected,
  onClick,
  className = "",
}) => {
  return (
    <Button
      variant="primary"
      aria-pressed={isSelected}
      className={`
        relative whitespace-nowrap flex-shrink-0 snap-start transition-all duration-200 ease-in-out
        px-4 py-2 rounded-lg min-w-[96px] text-center
        ${isSelected ? " shadow-xl" : ""}
        ${Magnetik_Medium.className}
        ${className}
      `}
      style={{
        backgroundImage: `repeating-linear-gradient(-45deg, #f89a28, #f89a28 18px, #ec8e1c 18px, #ec8e1c 36px)`,
        color: "white",
        border: isSelected
          ? "2px solid rgba(255,255,255,0.9)"
          : "1px solid rgba(0,0,0,0.06)",
        boxShadow: isSelected
          ? "0 8px 20px -8px rgba(0,0,0,0.2)"
          : "0 3px 8px -6px rgba(0,0,0,0.12)",
        fontWeight: 600,
      }}
      onClick={onClick}
    >
      {/* check-in-circle top-right */}
      {isSelected && (
        <span
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-white"
          style={{ border: "2px solid #f28a20" }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M20 6L9 17L4 12"
              stroke="#f28a20"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      <span className="relative z-10">{genre}</span>
    </Button>
  );
};

export default GenreButton;
