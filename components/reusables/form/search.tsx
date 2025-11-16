"use client";
import React, { ChangeEvent, ReactElement } from "react";
import { cn, Magnetik_Medium } from "@/lib";
import { Label } from "@/components/ui/label";
import { Input } from "@heroui/react";
import { Search } from "lucide-react";

interface SearchFieldProps {
  label?: string;
  htmlFor: string;
  type?: string;
  id?: string;
  variant?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  size: string;
  startcnt?: string | ReactElement;
  endcnt?: ReactElement;
  placeholder: string;
  reqValue?: string;
  onChange?: (value: string) => void;
  onEnter?: () => void;
  required?: boolean;
  minLen?: number;
  maxLen?: number;
  value?: string;
  disabled?: boolean;
  icon?: ReactElement;
}

const SearchField: React.FC<SearchFieldProps> = ({
  label,
  htmlFor,
  type,
  id,
  isInvalid,
  errorMessage,
  placeholder,
  startcnt,
  endcnt,
  onChange,
  onEnter,
  reqValue,
  required,
  minLen,
  maxLen,
  value,
  disabled,
  icon,
}) => {
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <Label
          htmlFor={htmlFor}
          className={cn(
            "mb-2 text-sm text-black",
            Magnetik_Medium.className
          )}
        >
          {label} <sup className="text-danger">{reqValue}</sup>
        </Label>
      )}
      <Input
        type={type}
        id={id}
        variant="bordered"
        classNames={{
          inputWrapper: [
            "bg-white rounded-lg",
            "data-[hover=true]:border-complimentary-colour group-data-[focus=true]:border-complimentary-colour",
            "shadow-sm",
          ],
          input: "text-primary-shade-2 placeholder:text-primary-shade-2",
        }}
        aria-label={label}
        size="lg"
        radius="md"
        required={required}
        placeholder={placeholder}
        startContent={
          startcnt ?? <Search className="w-5 h-5 mr-2 text-primary-shade-2" />
        }
        endContent={endcnt}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange?.(e.target.value)
        }
        minLength={minLen}
        maxLength={maxLen}
        disabled={disabled}
        value={value}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter?.();
          }
        }}
      />
      {icon && icon}
      {isInvalid && <div className="text-red-500 text-xs">{errorMessage}</div>}
    </div>
  );
};

export default SearchField;
