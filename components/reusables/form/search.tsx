"use client";
import React, { ChangeEvent, ReactElement } from "react";
import { cn, Magnetik_Medium } from "@/lib";
import { Input } from "@heroui/input";
import { Search } from "lucide-react";

interface SearchFieldProps {
  label?: string;
  htmlFor?: string;
  type?: string;
  id?: string;
  variant?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  size?: string;
  startcnt?: string | ReactElement;
  endcnt?: ReactElement;
  placeholder?: string;
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
  type = "text",
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
  // Build a label node to pass into heroui Input's label prop
  const labelNode = label ? (
    <label
      htmlFor={htmlFor ?? id}
      className={cn("mb-2", Magnetik_Medium.className)}
    >
      <span className={cn("text-sm text-black", Magnetik_Medium.className)}>
        {label}
      </span>
      {reqValue && <sup className="ml-1 text-danger">{reqValue}</sup>}
    </label>
  ) : undefined;

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      <Input
        id={id}
        name={htmlFor}
        type={type}
        label={labelNode}
        variant="bordered"
        classNames={{
          inputWrapper: [
            "bg-white rounded-lg",
            "data-[hover=true]:border-complimentary-colour group-data-[focus=true]:border-complimentary-colour",
            "shadow-sm",
          ],
          input: "text-primary-shade-2 placeholder:text-primary-shade-2",
        }}
        aria-label={label ?? placeholder}
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
      {icon}
      {isInvalid && <div className="text-xs text-red-500">{errorMessage}</div>}
    </div>
  );
};

export default SearchField;
