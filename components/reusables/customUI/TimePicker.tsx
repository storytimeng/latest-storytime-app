"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface TimePickerProps {
  value: { hour: number; minute: number; period: "AM" | "PM" };
  onChange: (value: { hour: number; minute: number; period: "AM" | "PM" }) => void;
}

const ITEM_HEIGHT = 40;

const ScrollPicker = ({
  items,
  value,
  onChange,
}: {
  items: (string | number)[];
  value: string | number;
  onChange: (value: string | number) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Triple the items for infinite scroll illusion
  const extendedItems = useMemo(() => [...items, ...items, ...items], [items]);
  const loopHeight = items.length * ITEM_HEIGHT;
  
  // Initialize in the middle set
  const initialIndex = items.indexOf(value) + items.length;
  const y = useMotionValue(-initialIndex * ITEM_HEIGHT);

  useEffect(() => {
    // Sync external value changes to the middle set position
    if (!isDragging && !isEditing) {
      const currentIndex = items.indexOf(value);
      const targetIndex = currentIndex + items.length;
      const targetY = -targetIndex * ITEM_HEIGHT;
      animate(y, targetY, { type: "spring", stiffness: 300, damping: 30 });
    }
  }, [value, items, y, isDragging, isEditing]);

  useEffect(() => {
    const unsubscribe = y.on("change", (latest) => {
      // Infinite scroll logic: jump between sets when reaching boundaries
      const middleSetStart = -items.length * ITEM_HEIGHT;
      const middleSetEnd = -items.length * 2 * ITEM_HEIGHT;

      if (latest > middleSetStart + ITEM_HEIGHT) {
        // Scrolled too far up (into first set), jump to middle
        y.set(latest - loopHeight);
      } else if (latest < middleSetEnd - ITEM_HEIGHT) {
        // Scrolled too far down (into last set), jump to middle
        y.set(latest + loopHeight);
      }
    });
    return unsubscribe;
  }, [loopHeight, items.length, y]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    const currentY = y.get();
    // Calculate index relative to the extended list
    const extendedIndex = Math.round(-currentY / ITEM_HEIGHT);
    // Map back to original item
    const originalItem = extendedItems[extendedIndex];
    
    if (originalItem !== undefined) {
      onChange(originalItem);
      
      // Snap to the nearest slot in the middle set for consistency
      const originalIndex = items.indexOf(originalItem);
      const targetIndex = originalIndex + items.length;
      animate(y, -targetIndex * ITEM_HEIGHT, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
    }
  };

  const handleTap = () => {
    if (!isDragging) {
      setIsEditing(true);
      setInputValue(String(value).padStart(2, "0"));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // Only digits
    if (val.length <= 2) {
      setInputValue(val);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const numValue = parseInt(inputValue, 10);
    
    if (!isNaN(numValue)) {
      const validValue = items.find(item => Number(item) === numValue);
      if (validValue !== undefined) {
        onChange(validValue);
      }
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  // Mouse wheel handler
  const handleWheel = (e: WheelEvent) => {
    // Prevent default page scroll
    e.preventDefault();
    e.stopPropagation();
    
    // Stop any ongoing animation
    y.stop();
    
    // Move based on scroll delta (adjust divisor for sensitivity)
    const currentY = y.get();
    y.set(currentY - e.deltaY);
    
    if (window.timePickerSnapTimeout) {
      clearTimeout(window.timePickerSnapTimeout);
    }
    
    window.timePickerSnapTimeout = setTimeout(() => {
      handleDragEnd();
    }, 150);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (window.timePickerSnapTimeout) {
        clearTimeout(window.timePickerSnapTimeout);
      }
    };
  }, []);

  // Attach non-passive listener for wheel event to prevent scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // We need to attach this manually to use { passive: false }
      container.addEventListener("wheel", handleWheel, { passive: false });
      
      return () => {
        container.removeEventListener("wheel", handleWheel);
      };
    }
  }, [y, handleDragEnd]); // Dependencies for the listener closure

  return (
    <div 
      ref={containerRef}
      className="relative h-[90px] overflow-hidden w-[48px]"
      // onWheel removed as we attach it manually
    >
      {/* Selection highlight - orange border */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[48px] w-[48px] border-2 border-complimentary-colour rounded-xl pointer-events-none z-10 box-border" />
      
      {/* Editable input overlay */}
      {isEditing && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[48px] w-[48px] flex items-center justify-center z-30 bg-white rounded-xl">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="w-full h-full text-xl font-medium text-center bg-transparent outline-none font-magnetik-medium"
          />
        </div>
      )}
      
      {/* Gradient overlays for fade effect - reduced opacity for visibility */}
      <div className="absolute inset-x-0 top-0 h-[21px] bg-gradient-to-b from-white via-white/40 to-transparent pointer-events-none z-20" />
      <div className="absolute inset-x-0 bottom-0 h-[21px] bg-gradient-to-t from-white via-white/40 to-transparent pointer-events-none z-20" />

      <motion.div
        ref={containerRef}
        style={{ y, top: "50%", marginTop: -ITEM_HEIGHT / 2 }}
        drag="y"
        dragConstraints={{ top: -loopHeight * 2, bottom: 0 }}
        dragElastic={0.05}
        dragTransition={{ power: 0.3, timeConstant: 200 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        className="absolute inset-x-0 cursor-grab active:cursor-grabbing z-10"
      >
        {extendedItems.map((item, index) => {
          const uniqueKey = `${item}-${index}`;
          
          const itemY = useTransform(
            y,
            (latest) => {
              const offset = (index * ITEM_HEIGHT) + latest;
              return offset;
            }
          );
          
          // Opacity logic - increased visibility for neighbors (0.8)
          const opacity = useTransform(
            itemY,
            [-ITEM_HEIGHT * 1.5, -ITEM_HEIGHT * 0.5, ITEM_HEIGHT * 0.5, ITEM_HEIGHT * 1.5],
            [0.8, 1, 1, 0.8]
          );

          const scale = useTransform(
            itemY,
            [-ITEM_HEIGHT, 0, ITEM_HEIGHT],
            [0.85, 1, 0.85]
          );

          // Interpolate styles based on distance from center
          // Unselected: #707070 (dark-grey-3), Selected: #000000
          const color = useTransform(
            itemY,
            [-ITEM_HEIGHT, 0, ITEM_HEIGHT],
            ["#707070", "#000000", "#707070"]
          );

          const fontSize = useTransform(
            itemY,
            [-ITEM_HEIGHT, 0, ITEM_HEIGHT],
            ["16px", "20px", "16px"]
          );

          const fontWeight = useTransform(
            itemY,
            [-ITEM_HEIGHT, 0, ITEM_HEIGHT],
            [400, 500, 400]
          );

          return (
            <motion.div
              key={uniqueKey}
              style={{ 
                opacity: isEditing ? 0 : opacity, 
                scale,
                height: ITEM_HEIGHT,
              }}
              className="flex items-center justify-center"
            >
              <motion.span 
                style={{ color, fontSize, fontWeight }}
                className="transition-colors font-magnetik-medium"
              >
                 {String(item).padStart(2, "0")}
              </motion.span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="bg-transparent rounded-xl p-2 w-full flex justify-center">
      <div 
        className="flex items-center justify-center"
        style={{ transform: "scale(0.9)", transformOrigin: "center" }}
      >
        {/* Hours */}
        <ScrollPicker
          items={hours}
          value={value.hour}
          onChange={(h) => onChange({ ...value, hour: h as number })}
        />

        {/* Spacer */}
        <div className="w-[8px]" />

        {/* Divider */}
        <div className="w-[1px] h-[77px] bg-light-grey-2" />

        {/* Spacer */}
        <div className="w-[8px]" />

        {/* Minutes */}
        <ScrollPicker
          items={minutes}
          value={value.minute}
          onChange={(m) => onChange({ ...value, minute: m as number })}
        />

        {/* Spacer */}
        <div className="w-[8px]" />

        {/* Divider */}
        <div className="w-[1px] h-[77px] bg-light-grey-2" />

        {/* Spacer */}
        <div className="w-[8px]" />

        {/* AM/PM */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => onChange({ ...value, period: "AM" })}
            className={`px-2 py-1 rounded-lg font-medium text-xs transition-colors min-w-[40px] ${
              value.period === "AM"
                ? "bg-primary-colour text-white"
                : "bg-accent-shade-2 text-dark-grey-3"
            }`}
          >
            AM
          </button>
          <button
            onClick={() => onChange({ ...value, period: "PM" })}
            className={`px-2 py-1 rounded-lg font-medium text-xs transition-colors min-w-[40px] ${
              value.period === "PM"
                ? "bg-primary-colour text-white"
                : "bg-accent-shade-2 text-dark-grey-3"
            }`}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
};

// Add global declaration for the timeout
declare global {
  interface Window {
    timePickerSnapTimeout?: NodeJS.Timeout;
  }
}
