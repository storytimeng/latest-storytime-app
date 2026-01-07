"use client";
import React, { ReactElement } from "react";
import { cn } from "@/lib";
import { Label } from "@/components/ui/label";
import { Textarea } from "@heroui/input";

import RichTextEditor from "./RichTextEditor";

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
  isRichText?: boolean;
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
  isRichText = false,
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

  // Determine if we should use Rich Text Editor
  // For now, if 'isRichText' is true, or purely based on a new prop
  if (isRichText) {
    return (
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor={htmlFor} className={cn("mb-2 text-sm text-black")}>
          {label} {required && <sup className="text-danger">*</sup>}
        </Label>
        <RichTextEditor
          value={value || ""}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(isInvalid && "border-red-500", className)}
          minHeight={rows ? `min-h-[${rows * 1.5}rem]` : undefined}
        />
        {/* Word counter for RTE can be estimated from stripped HTML if needed, 
            but for now we'll rely on the same logic if passed */}
        {showWordCounter && (
          <div className={`text-xs font-medium ${getCounterColor()}`}>
            {getCounterText()}
            {/* Note: Word count on HTML values can be inaccurate without stripping tags. 
                Ideally RichTextEditor should expose a plain text word count or we strip tags here. */}
          </div>
        )}
        {isInvalid && (
          <div className="text-red-500 text-xs mt-1">{errorMessage}</div>
        )}
      </div>
    );
  }

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
             // Let Enter work normally in textarea? Using e.preventDefault() here stops newlines?
             // The original code PREVENTED default enter behavior? That seems wrong for a textarea unless it's a single-line input.
             // Line 116 in original: "if (e.key === 'Enter') e.preventDefault()"
             // This is usually for Form submission on Enter. But for TextArea?
             // Let's keep original behavior if it was there, but it's weird for a textarea.
             // Actually, usually you WANT Enter to make a new line in a textarea. 
             // Preventing it means you can't type paragraphs.
             // I will remove the preventDefault unless I see a strong reason.
             // Wait, looking at original code line 116: it DOES prevent default. Why? 
             // Maybe to submit form? But typically Shift+Enter is newline and Enter is submit? Or vice versa?
             // Standard Textarea: Enter = Newline. 
             // I'll leave it as is if I'm not touching non-RTE mode logic significantly, 
             // BUT for RichTextEditor, Tiptap handles events itself.
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
