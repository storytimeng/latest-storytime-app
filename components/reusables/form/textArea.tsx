"use client";
import React, { ReactElement } from "react";
import { cn } from "@/lib";
import { Label } from "@/components/ui/label";
import { Textarea } from "@heroui/input";

import RichTextEditor from "./RichTextEditor";
import { stripHtmlForWordCount } from "@/lib/storyContentFormat";

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
  helperText?: string;
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
  helperText,
  className,
  isRichText = false,
}) => {
  const handleChange = (value: string) => {
    onChange(value);
  };

  // Calculate word count (strip HTML when using the rich text editor)
  const countableText = isRichText ? stripHtmlForWordCount(value) : value || "";
  const wordCount = countableText
    ? countableText.split(/\s+/).filter(Boolean).length
    : 0;

  const getCounterColor = () => {
    if (!minWords || !maxWords) return "text-gray-500";

    if (isInvalid) {
      return "text-red-500";
    }

    if (wordCount > maxWords) {
      return "text-amber-600";
    }

    if (wordCount >= minWords && wordCount <= maxWords) {
      return "text-green-600";
    }

    return "text-gray-500";
  };

  const getCounterText = () => {
    if (!minWords || !maxWords) return `${wordCount} words`;

    if (wordCount < minWords) {
      return `${wordCount} words · ${minWords}–${maxWords} required`;
    }

    if (wordCount > maxWords) {
      return `${wordCount} words · over ${maxWords}-word limit`;
    }

    return `${wordCount} words · within limit`;
  };

  // Determine if we should use Rich Text Editor
  // For now, if 'isRichText' is true, or purely based on a new prop
  if (isRichText) {
    return (
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor={htmlFor} className={cn("mb-2 text-sm text-black")}>
          {label} {required && <sup className="text-danger">*</sup>}
        </Label>
        {helperText && (
          <p className="-mt-1 mb-2 text-xs text-gray-500">{helperText}</p>
        )}
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
          <div
            className={`text-xs font-medium ${getCounterColor()}`}
            aria-live="polite"
          >
            {getCounterText()}
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
      {helperText && (
        <p className="-mt-1 mb-2 text-xs text-gray-500">{helperText}</p>
      )}
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
        <div
          className={`text-xs font-medium ${getCounterColor()}`}
          aria-live="polite"
        >
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
