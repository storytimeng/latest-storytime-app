import { useState, useCallback, useEffect } from "react";
import type { StoryFormData, StoryStructure } from "@/types/story";

interface UseStoryFormStateProps {
  initialData?: Partial<StoryFormData>;
  mode: "create" | "edit";
}

interface UseStoryFormStateReturn {
  formData: StoryFormData;
  formErrors: Partial<Record<keyof StoryFormData, string>>;
  currentStep: "form" | "structure" | "writing" | "additional";
  storyStructure: StoryStructure;
  setFormData: React.Dispatch<React.SetStateAction<StoryFormData>>;
  setFormErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof StoryFormData, string>>>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<"form" | "structure" | "writing" | "additional">>;
  setStoryStructure: React.Dispatch<React.SetStateAction<StoryStructure>>;
  handleFieldChange: (field: keyof StoryFormData, value: string | number | boolean | string[]) => void;
  handleGenreToggle: (genre: string) => void;
  validateForm: () => boolean;
  handleStructureNext: (structure: StoryStructure) => void;
}

const getInitialFormData = (
  initialData?: Partial<StoryFormData>
): StoryFormData => ({
  title: "",
  collaborate: "",
  description: "",
  content: "",
  selectedGenres: [],
  language: "English",
  goAnonymous: false,
  onlyOnStorytime: false,
  trigger: false,
  copyright: false,
  storyStatus: "Draft",
  authorNote: "",
  giveConsent: false,
  chapter: false,
  episodes: false,
  ...initialData,
});

/**
 * Custom hook for managing story form state and validation
 * Handles form data, errors, current step, and story structure
 */
export function useStoryFormState({
  initialData,
  mode,
}: UseStoryFormStateProps): UseStoryFormStateReturn {
  // Form state
  const [formData, setFormData] = useState<StoryFormData>(() =>
    getInitialFormData(initialData)
  );
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof StoryFormData, string>>
  >({});

  // UI state
  const [currentStep, setCurrentStep] = useState<
    "form" | "structure" | "writing" | "additional"
  >(() => {
    // Always start at form step in edit mode - user can navigate to writing later
    // This allows editing story details before working on chapters/episodes
    return "form";
  });

  const [storyStructure, setStoryStructure] = useState<StoryStructure>(() => {
    // In edit mode, initialize structure from initialData
    if (mode === "edit" && initialData) {
      return {
        hasChapters: initialData.chapter === true,
        hasEpisodes: Array.isArray(initialData.episodes) && initialData.episodes.length > 0,
      };
    }
    // For create mode, default to no structure (user will select in structure step)
    // For edit mode without initialData yet, default to false until data loads
    return {
      hasChapters: false,
      hasEpisodes: false,
    };
  });

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData(getInitialFormData(initialData));
      // Update story structure based on actual data
      const hasChapters = initialData.chapter === true;
      const hasEpisodes = Array.isArray(initialData.episodes) && initialData.episodes.length > 0;
      
      setStoryStructure({
        hasChapters,
        hasEpisodes,
      });
      // Always stay on form step in edit mode - user can navigate to writing view via button
      setCurrentStep("form");
    }
  }, [mode, initialData]);

  // Handle form field changes
  const handleFieldChange = useCallback(
    (
      field: keyof StoryFormData,
      value: string | number | boolean | string[]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (formErrors[field]) {
        setFormErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [formErrors]
  );

  // Handle genre selection
  const handleGenreToggle = useCallback((genre: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(genre)
        ? prev.selectedGenres.filter((g) => g !== genre)
        : prev.selectedGenres.length < 3
          ? [...prev.selectedGenres, genre]
          : prev.selectedGenres, // Limit to 3 genres
    }));
  }, []);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof StoryFormData, string>> = {};

    const titleRegex = /^[a-zA-Z0-9\s.,'?!-]+$/;
    if (!formData.title.trim()) {
      errors.title = "Story title is required";
    } else if (!titleRegex.test(formData.title)) {
      errors.title = "Title contains invalid characters. Only letters, numbers, spaces, and basic punctuation are allowed.";
    }

    // Description: 50-100 words, at least 50 chars
    const desc = formData.description.trim();
    const descWords = desc.split(/\s+/).filter(Boolean);
    if (!desc) {
      errors.description = "Story description is required";
    } else if (descWords.length < 50 || descWords.length > 100) {
      errors.description = "Description must be 50-100 words.";
    } else if (desc.length < 50) {
      errors.description = "Description must be at least 50 characters.";
    }

    // Content validation: required when no chapters/episodes
    if (
      !storyStructure.hasChapters &&
      !storyStructure.hasEpisodes &&
      !formData.content?.trim()
    ) {
      errors.content =
        "Story content is required when not using chapters or episodes.";
    }

    if (formData.selectedGenres.length === 0) {
      errors.selectedGenres = "Please select at least one genre";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, storyStructure]);

  // Handle story structure selection
  const handleStructureNext = useCallback(
    (structure: StoryStructure) => {
      // If user selected no chapters and no episodes, they must have content
      if (
        !structure.hasChapters &&
        !structure.hasEpisodes &&
        !formData.content?.trim()
      ) {
        const { showToast } = require("@/lib/showNotification");
        showToast({
          type: "error",
          message:
            "You must write story content if you're not using chapters or episodes.",
        });
        return;
      }

      setStoryStructure(structure);
      // Update formData with mutually exclusive chapter/episodes flags
      setFormData((prev) => ({
        ...prev,
        chapter: structure.hasChapters,
        episodes: structure.hasEpisodes,
      }));
      setCurrentStep("writing");
    },
    [formData]
  );

  return {
    formData,
    formErrors,
    currentStep,
    storyStructure,
    setFormData,
    setFormErrors,
    setCurrentStep,
    setStoryStructure,
    handleFieldChange,
    handleGenreToggle,
    validateForm,
    handleStructureNext,
  };
}
