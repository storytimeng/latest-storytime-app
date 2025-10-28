"use client";
import React from "react";
import { DateInput } from "@heroui/react";
import { CalendarDate } from "@internationalized/date";

interface FormFieldProps {
  label: string;
  id: string;
  variant?: "flat" | "bordered" | "faded" | "underlined";
  isInvalid?: boolean;
  errorMessage?: string;
  size?: "sm" | "md" | "lg";
  placeholder: string;
  onChange?: (value: string) => void;
  isRequired?: boolean;
  value?: string;
  disabled?: boolean;
  color?: "danger" | "success" | "default";
}

const DateFormField: React.FC<FormFieldProps> = ({
  label,
  isInvalid,
  errorMessage,
  onChange,
  isRequired,
  value,
  disabled,
  color = "default",
  size = "lg",
  variant = "bordered",
}) => {
  // Handle conversion of value string (MM-DD-YYYY) to CalendarDate
  const getCalendarDate = (dateString?: string): unknown => {
    if (dateString && dateString.length === 10) {
      // Ensure it's in MM-DD-YYYY format
      const [month, day, year] = dateString.split("-").map(Number);

      // Ensure the year is a 4-digit number
      const fullYear = year < 1000 ? `20${year}` : String(year);

      // Ensure valid date parts
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        // Log the parsed values for debugging
        //console.log(`Parsing date string: ${dateString}`);
        //console.log(`Parsed Month: ${month}, Day: ${day}, Year: ${fullYear}`);

        // The month is zero-indexed in CalendarDate, so subtract 1
        const calendarDate = new CalendarDate(Number(fullYear), month - 1, day); // Month is 0-indexed in CalendarDate
        //console.log(`CalendarDate created: ${calendarDate}`);
        return calendarDate;
      }
    }
    return undefined;
  };

  const handleDateChange = (newValue: unknown) => {
    // If the value is null (e.g., after backspace), just return and do nothing
    if (!newValue) {
      //console.log("Date cleared"); // Log if date is cleared
      onChange?.(""); // Reset the value to empty string when cleared
      return;
    }

    // Cast DateValue to CalendarDate to access properties
    const calendarDate = newValue as CalendarDate;
    
    // Log the CalendarDate object to see its contents
    //console.log(`CalendarDate Object: ${calendarDate}`);
    //console.log(`Month: ${calendarDate.month}, Day: ${calendarDate.day}, Year: ${calendarDate.year}`);

    // If the new value is valid, convert CalendarDate to string (MM-DD-YYYY)
    // Make sure we correctly format the date into MM-DD-YYYY
    // Ensure the year is always a 4-digit number
    const formattedDate = `${String(calendarDate.month).padStart(2, "0")}-${String(
      calendarDate.day
    ).padStart(2, "0")}-${String(calendarDate.year).padStart(4, "0")}`;

    // Log the formatted date to ensure correct formatting
    //console.log(`Formatted Date: ${formattedDate}`);
    onChange?.(formattedDate); // Convert back to MM-DD-YYYY format
  };

  return (
    <DateInput
      label={label}
      aria-label={label}
      variant={variant}
      color={color}
      size={size}
      isInvalid={isInvalid}
      errorMessage={errorMessage}      
      placeholderValue={new CalendarDate(1995, 11, 6)} // Default date, can be dynamic
      // @ts-expect-error - Version mismatch between @internationalized/date packages
      value={getCalendarDate(value)} // Convert string to CalendarDate
      onChange={handleDateChange}
      isDisabled={disabled}
      isRequired={isRequired}
      className="w-full"
    />
  );
};

export default DateFormField;
