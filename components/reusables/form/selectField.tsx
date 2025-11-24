"use client";
import React from "react";
import { cn, Magnetik_Medium } from "@/lib";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@heroui/select";
import { ChevronDown } from "lucide-react";

interface SelectFieldProps {
  label?: string;
  htmlFor?: string;
  id?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  placeholder?: string;
  reqValue?: string;
  onChange: (value: string | string[]) => void;
  required?: boolean;
  selectionMode?: "single" | "multiple";
  options: { label: string; value: string }[];
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  htmlFor,
  id,
  isInvalid,
  errorMessage,
  placeholder,
  reqValue,
  onChange,
  required,
  options,
  selectionMode = "single",
}) => {
  const handleChange = (keys: unknown) => {
    const value =
      selectionMode === "multiple"
        ? Array.from(keys as Set<string>)
        : Array.from(keys as Set<string>)[0] || "";
    onChange(value);
  };

  return (
    <div className="flex flex-col space-y-1.5 border-none shadow-none">
      <Label
        htmlFor={htmlFor}
        className={cn("mb-2 text-sm text-black", Magnetik_Medium.className)}
      >
        {label} <sup className="text-danger">{reqValue}</sup>
      </Label>
      <Select
        selectionMode={selectionMode}
        id={id}
        aria-label={label}
        aria-invalid={isInvalid ? "true" : "false"}
        aria-describedby={isInvalid ? `${id}-error` : undefined}
        required={required}
        placeholder={placeholder}
        onSelectionChange={handleChange}
        radius="md"
        size="lg"
        variant="flat"
        endContent={
          <div className="p-1 ml-4 bg-gray-100 rounded-md ">
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        }
        classNames={{
          base: " w-fit",
          trigger: ["data-[focus=true]:", "active:"],
          value: "",
          innerWrapper: "",
          selectorIcon: "hidden", // Hide the default dropdown arrow
        }}
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            className="px-2 py-2 bg-white rounded-md hover:bg-complimentary-shade-2"
          >
            {option.label}
          </SelectItem>
        ))}
      </Select>
      {isInvalid && <div className="text-xs text-red-500">{errorMessage}</div>}
    </div>
  );
};

export default SelectField;
