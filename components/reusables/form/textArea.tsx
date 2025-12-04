"use client";
import React, { ReactElement } from "react";
import { cn } from "@/lib";
import { Label } from "@/components/ui/label";
import { Textarea } from "@heroui/input";

interface TextFieldProps {
  label: string;
  htmlFor: string;
  id: string;
  isInvalid: boolean;
  errorMessage: string;
  placeholder: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  startContent?: string | ReactElement;
  minLen?: number;
  maxLen?: number;
  rows?: number;
  showWordCounter?: boolean;
  minWords?: number;
  maxWords?: number;
  className?: string;
}

const TextAreaField: React.FC<TextFieldProps> = ({
  label,
  htmlFor,
  id,
  isInvalid,
  errorMessage,
  placeholder,
  value,
  onChange,
  required,
  minLen,
  maxLen,
  rows = 4,
  showWordCounter = false,
  minWords,
  maxWords,
  className,
}) => {
  const handleChange = (value: string) => {
    onChange(value);
  };

  // Calculate word count
  const wordCount = value
    ? value.trim().split(/\s+/).filter(Boolean).length
    : 0;

  // Determine counter color based on word count
  const getCounterColor = () => {
    if (!minWords || !maxWords) return "text-gray-500";

    if (wordCount < minWords) {
      // Below minimum - show red if close, yellow if very far
      const progress = wordCount / minWords;
      if (progress < 0.5) return "text-gray-500";
      if (progress < 0.8) return "text-yellow-500";
      return "text-red-500";
    }

    if (wordCount > maxWords) {
      return "text-red-500"; // Over maximum - red
    }

    // Within range
    const remaining = maxWords - wordCount;
    if (remaining <= 5) return "text-yellow-500"; // Close to max - yellow
    return "text-green-500"; // Good range - green
  };

  const getCounterText = () => {
    if (!minWords || !maxWords) return `${wordCount} words`;

    if (wordCount < minWords) {
      const needed = minWords - wordCount;
      return `${wordCount}/${minWords} words (${needed} more needed)`;
    }

    if (wordCount > maxWords) {
      const excess = wordCount - maxWords;
      return `${wordCount}/${maxWords} words (${excess} over limit)`;
    }

    return `${wordCount}/${maxWords} words`;
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor={htmlFor} className={cn("mb-2 text-sm text-black")}>
        {label} {required && <sup className="text-danger">*</sup>}
      </Label>
      <Textarea
        id={id}
        placeholder={placeholder}
        aria-label={label}
        value={value}
        onValueChange={handleChange}
        required={required}
        minLength={minLen}
        maxLength={maxLen}
        rows={rows}
        radius="md"
        variant="bordered"
        className={className}
        classNames={{
          inputWrapper: [
            "data-[hover=true]:border-primary group-data-[focus=true]:border-primary",
          ],
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // Prevent the default Enter key behavior
          }
        }}
      />
      {showWordCounter && (
        <div className={`text-xs font-medium ${getCounterColor()}`}>
          {getCounterText()}
        </div>
      )}
      {isInvalid && (
        <div className="text-red-500 text-xs mt-1">{errorMessage}</div>
      )}
    </div>
  );
};

export default TextAreaField;
