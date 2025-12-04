"use client";

import React, {
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
  useMemo,
} from "react";
import useSWR from "swr";
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

// SWR fetcher function
const fetchCollaborators = async (penName: string) => {
  const response = await searchCollaborators({
    query: {
      penName,
      limit: 20,
    },
  });

  const responseData = response.data as any;
  const suggestions =
    responseData?.data?.suggestions || responseData?.suggestions || [];
  return Array.isArray(suggestions) ? suggestions : [];
};

export const CollaboratorInput: React.FC<CollaboratorInputProps> = ({
  value,
  onChange,
  className,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCollaborators, setSelectedCollaborators] = useState<
    Collaborator[]
  >([]);
  const [isTypingMention, setIsTypingMention] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine search term for SWR
  const swrKey = useMemo(() => {
    if (inputValue === "@") {
      return "%"; // Search all
    } else if (inputValue.startsWith("@") && inputValue.length >= 2) {
      const term = inputValue.slice(1).trim();
      return term || "%"; // Use % if empty after @
    }
    return null; // Don't search
  }, [inputValue]);

  // Use SWR for caching and data fetching
  const { data: allSuggestions, isLoading } = useSWR(
    swrKey ? `collaborators-${swrKey}` : null,
    () => (swrKey ? fetchCollaborators(swrKey) : []),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  // Filter out already selected collaborators
  const suggestions = useMemo(() => {
    if (!allSuggestions) return [];
    return allSuggestions.filter(
      (suggestion: any) =>
        !selectedCollaborators.some(
          (selected) => selected.penName === suggestion.penName
        )
    );
  }, [allSuggestions, selectedCollaborators]);

  // Update suggestions visibility and typing state
  useEffect(() => {
    if (swrKey) {
      setIsTypingMention(true);
      setShowSuggestions(true);
    } else {
      setIsTypingMention(false);
      setShowSuggestions(false);
    }
  }, [swrKey]);

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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to remove last collaborator when input is empty
    if (
      e.key === "Backspace" &&
      inputValue === "" &&
      selectedCollaborators.length > 0
    ) {
      e.preventDefault();
      const newSelected = selectedCollaborators.slice(0, -1);
      setSelectedCollaborators(newSelected);
      const penNames = newSelected.map((c) => c.penName).join(", ");
      onChange(penNames);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <label
        className={`mb-2 text-sm body-text-small-medium-auto text-grey-2 ${Magnetik_Medium.className}`}
      >
        Collaborate (optional)
      </label>

      {/* Input Field with Inline Collaborator Chips */}
      <div
        ref={containerRef}
        className={cn(
          "w-full min-h-[56px] px-3 py-2 rounded-lg border transition-colors",
          "bg-transparent border-light-grey-2",
          "hover:border-primary-colour focus-within:border-primary-colour",
          "flex flex-wrap items-center gap-2 cursor-text"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Inline Selected Collaborators */}
        {selectedCollaborators.map((collaborator) => (
          <div
            key={collaborator.penName}
            className="flex items-center gap-1.5 bg-complimentary-colour/10 rounded-full px-2.5 py-1 border border-complimentary-colour/30"
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
                "text-xs text-complimentary-colour font-medium",
                Magnetik_Medium.className
              )}
            >
              @{collaborator.penName}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveCollaborator(collaborator.penName);
              }}
              className="text-complimentary-colour/70 hover:text-complimentary-colour transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedCollaborators.length === 0
              ? "Type @ to search collaborators..."
              : ""
          }
          className={cn(
            "flex-1 min-w-[120px] bg-transparent outline-none",
            "text-primary-colour placeholder:text-primary-shade-3",
            Magnetik_Regular.className
          )}
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex-shrink-0">
            <div className="w-4 h-4 border-2 border-complimentary-colour border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-accent-shade-2 border border-light-grey-2 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSelectCollaborator(suggestion)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent-shade-1 transition-colors text-left first:rounded-t-lg last:rounded-b-lg"
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
        !isLoading &&
        inputValue.startsWith("@") &&
        inputValue.length >= 1 &&
        suggestions.length === 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-2 bg-universal-white border border-light-grey-2 rounded-lg shadow-lg px-4 py-3"
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
