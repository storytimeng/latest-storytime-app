"use client";

import React, { useState, useEffect, useRef } from "react";
import { Avatar } from "@heroui/avatar";
import { X } from "lucide-react";
import { Magnetik_Regular, Magnetik_Medium } from "@/lib/font";
import { cn } from "@/lib/utils";
import { searchCollaborators } from "@/src/client";

interface Collaborator {
  id: string;
  penName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface CollaboratorInputProps {
  value: string; // Comma-separated pen names
  onChange: (value: string) => void;
  className?: string;
}

export const CollaboratorInput: React.FC<CollaboratorInputProps> = ({
  value,
  onChange,
  className,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Collaborator[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCollaborators, setSelectedCollaborators] = useState<
    Collaborator[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Parse initial value into selected collaborators
  useEffect(() => {
    if (value && selectedCollaborators.length === 0) {
      const penNames = value
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
      const collaborators = penNames.map((penName) => ({
        id: penName, // Use penName as ID for initial values
        penName,
      }));
      setSelectedCollaborators(collaborators);
    }
  }, [value]);

  // Search for collaborators as user types
  useEffect(() => {
    const searchDebounced = setTimeout(async () => {
      if (inputValue.trim().length >= 2) {
        setIsSearching(true);
        try {
          // Remove @ symbol if present before searching
          const searchTerm = inputValue.trim().replace(/^@/, "");

          const response = await searchCollaborators({
            query: {
              penName: searchTerm,
              limit: 10,
            },
          });

          // Unwrap the nested data structure
          const responseData = response.data as any;
          const suggestions =
            responseData?.data?.suggestions || responseData?.suggestions || [];

          if (Array.isArray(suggestions)) {
            // Filter out already selected collaborators
            const filtered = suggestions.filter(
              (suggestion: any) =>
                !selectedCollaborators.some(
                  (selected) => selected.penName === suggestion.penName
                )
            );
            setSuggestions(filtered as Collaborator[]);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("Failed to search collaborators:", error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounced);
  }, [inputValue, selectedCollaborators]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCollaborator = (collaborator: Collaborator) => {
    const newSelected = [...selectedCollaborators, collaborator];
    setSelectedCollaborators(newSelected);

    // Update parent with comma-separated pen names
    const penNames = newSelected.map((c) => c.penName).join(", ");
    onChange(penNames);

    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRemoveCollaborator = (penName: string) => {
    const newSelected = selectedCollaborators.filter(
      (c) => c.penName !== penName
    );
    setSelectedCollaborators(newSelected);

    // Update parent with comma-separated pen names
    const penNames = newSelected.map((c) => c.penName).join(", ");
    onChange(penNames);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className={cn("relative", className)}>
      <label
        className={`text-primary-colour text-base mb-2 block ${Magnetik_Medium.className}`}
      >
        Collaborate (optional)
      </label>

      {/* Selected Collaborators */}
      {selectedCollaborators.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedCollaborators.map((collaborator) => (
            <div
              key={collaborator.penName}
              className="flex items-center gap-2 bg-accent-shade-2 rounded-full px-3 py-1.5"
            >
              {collaborator.avatar && (
                <Avatar
                  src={collaborator.avatar}
                  name={collaborator.penName}
                  size="sm"
                  className="w-4 h-4"
                />
              )}
              <span
                className={cn(
                  "text-xs text-primary-colour",
                  Magnetik_Regular.className
                )}
              >
                @{collaborator.penName}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveCollaborator(collaborator.penName)}
                className="text-primary-shade-3 hover:text-primary-colour transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
          placeholder="Type @ to search collaborators..."
          className={cn(
            "w-full px-4 py-3 rounded-lg border transition-colors",
            "bg-accent-shade-2 border-light-grey-2",
            "text-primary-colour placeholder:text-primary-shade-3",
            "focus:outline-none focus:border-complimentary-colour",
            Magnetik_Regular.className
          )}
        />

        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-complimentary-colour border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-universal-white border border-light-grey-2 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSelectCollaborator(suggestion)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent-shade-1 transition-colors text-left"
            >
              <Avatar
                src={suggestion.avatar || "/images/placeholder-image.svg"}
                name={suggestion.penName}
                size="sm"
                className="w-8 h-8"
              />
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-sm text-primary-colour font-medium",
                    Magnetik_Medium.className
                  )}
                >
                  @{suggestion.penName}
                </div>
                {(suggestion.firstName || suggestion.lastName) && (
                  <div
                    className={cn(
                      "text-xs text-primary-shade-3",
                      Magnetik_Regular.className
                    )}
                  >
                    {suggestion.firstName} {suggestion.lastName}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions &&
        !isSearching &&
        inputValue.length >= 2 &&
        suggestions.length === 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-universal-white border border-light-grey-2 rounded-lg shadow-lg px-4 py-3"
          >
            <p
              className={cn(
                "text-xs text-primary-shade-3 text-center",
                Magnetik_Regular.className
              )}
            >
              No collaborators found
            </p>
          </div>
        )}
    </div>
  );
};
