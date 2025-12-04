"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
// Icons will be replaced with text/emoji alternatives
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import FormField from "./formField";
import TextAreaField from "./textArea";
import ImageUpload from "./imageUpload";
import { CollaboratorInput } from "./CollaboratorInput";
import { cn } from "@/lib/utils";
import type {
  StoryFormData,
  StoryStructure,
  Chapter,
  Part,
  StoryFormProps,
  StoryBriefModalProps,
  AdditionalInfoModalProps,
} from "@/types/story";
import { GENRES, LANGUAGES, STATUSES } from "@/types/story";

// Initial form data
const getInitialFormData = (
  initialData?: Partial<StoryFormData>
): StoryFormData => ({
  title: "",
  collaborate: "",
  description: "",
  selectedGenres: [],
  language: "English",
  goAnonymous: false,
  onlyOnStorytime: false,
  trigger: false,
  copyright: false,
  storyStatus: "Draft",
  authorNote: "",
  giveConsent: false,
  ...initialData,
});

// Story Brief Modal Component

const StoryBriefModal: React.FC<StoryBriefModalProps> = ({
  isOpen,
  onClose,
  onNext,
}) => {
  const [structure, setStructure] = useState<StoryStructure>({
    hasChapters: false,
    hasEpisodes: false,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="bg-universal-white rounded-t-2xl w-full max-w-[28rem] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2
            className={`text-xl text-primary-colour ${Magnetik_Bold.className}`}
          >
            Story Structure
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <p
              className={`text-primary-colour text-base mb-4 ${Magnetik_Medium.className}`}
            >
              Does this story have chapters?
            </p>
            <div className="flex gap-3">
              {["No", "Yes"].map((option, index) => (
                <Button
                  key={option}
                  variant={
                    structure.hasChapters === Boolean(index)
                      ? "solid"
                      : "bordered"
                  }
                  onClick={() =>
                    setStructure((prev) => ({
                      ...prev,
                      hasChapters: Boolean(index),
                    }))
                  }
                  className={cn(
                    "flex-1",
                    structure.hasChapters === Boolean(index)
                      ? "bg-complimentary-colour text-universal-white"
                      : "border-complimentary-colour text-complimentary-colour"
                  )}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p
              className={`text-primary-colour text-base mb-4 ${Magnetik_Medium.className}`}
            >
              Is this story divided into episodes?
            </p>
            <div className="flex gap-3">
              {["No", "Yes"].map((option, index) => (
                <Button
                  key={option}
                  variant={
                    structure.hasEpisodes === Boolean(index)
                      ? "solid"
                      : "bordered"
                  }
                  onClick={() =>
                    setStructure((prev) => ({
                      ...prev,
                      hasEpisodes: Boolean(index),
                    }))
                  }
                  className={cn(
                    "flex-1",
                    structure.hasEpisodes === Boolean(index)
                      ? "bg-complimentary-colour text-universal-white"
                      : "border-complimentary-colour text-complimentary-colour"
                  )}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-complimentary-colour/10">
            <p
              className={`text-complimentary-colour text-sm ${Magnetik_Regular.className}`}
            >
              Note: You can change to chapters when you want in the story.
            </p>
          </div>
        </div>

        <Button
          className={`w-full bg-primary-shade-6 text-universal-white py-3 ${Magnetik_Medium.className}`}
          onClick={() => onNext(structure)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

// Additional Info Modal Component

const AdditionalInfoModal: React.FC<AdditionalInfoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSkip,
}) => {
  const [authorNote, setAuthorNote] = useState("");
  const [giveConsent, setGiveConsent] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="bg-universal-white rounded-t-2xl w-full max-w-[28rem] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2
            className={`text-xl text-primary-colour ${Magnetik_Bold.className}`}
          >
            Additional Information
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          <TextAreaField
            label="Author's note (optional)"
            htmlFor="authorNote"
            id="authorNote"
            isInvalid={false}
            errorMessage=""
            placeholder="Add author's note"
            value={authorNote}
            onChange={setAuthorNote}
            rows={4}
          />

          <div className="flex items-center gap-3">
            <Switch
              isSelected={giveConsent}
              onValueChange={setGiveConsent}
              size="sm"
              color="warning"
              classNames={{
                wrapper: "group-data-[selected=true]:bg-primary-shade-6",
                thumb: "group-data-[selected=true]:bg-universal-white",
              }}
            />
            <span
              className={`text-primary-colour text-sm ${Magnetik_Regular.className}`}
            >
              Give Consent of Ownership
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className={`w-full bg-primary-shade-6 text-universal-white py-3 ${Magnetik_Medium.className}`}
            onClick={() => onSubmit(authorNote, giveConsent)}
          >
            Publish Story
          </Button>
          <Button
            variant="ghost"
            className={`w-full text-primary-colour ${Magnetik_Regular.className}`}
            onClick={onSkip}
          >
            Skip to Publish Story
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Story Form Component
const StoryForm: React.FC<StoryFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
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
  >("form");
  const [storyStructure, setStoryStructure] = useState<StoryStructure>({
    hasChapters: false,
    hasEpisodes: false,
  });

  // Content state
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: 1,
      title: "Chapter 1",
      body: "",
      episodes: [{ id: 1, title: "Episode 1", body: "" }],
    },
  ]);
  const [parts, setParts] = useState<Part[]>([
    { id: 1, title: "Part 1", body: "" },
  ]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof StoryFormData, string>> = {};

    if (!formData.title.trim()) {
      errors.title = "Story title is required";
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

    if (formData.selectedGenres.length === 0) {
      errors.selectedGenres = "Please select at least one genre";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

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

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;

    if (mode === "create" && currentStep === "form") {
      setCurrentStep("structure");
      return;
    }

    // For edit mode or final submission
    const contentData = storyStructure.hasChapters ? chapters : undefined;
    const partsData = !storyStructure.hasChapters ? parts : undefined;

    onSubmit(formData, contentData, partsData);
  }, [
    mode,
    currentStep,
    formData,
    validateForm,
    onSubmit,
    storyStructure,
    chapters,
    parts,
  ]);

  // Handle story structure selection
  const handleStructureNext = useCallback((structure: StoryStructure) => {
    setStoryStructure(structure);
    setCurrentStep("writing");
  }, []);

  // Handle content operations
  const addChapter = useCallback(() => {
    setChapters((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        title: `Chapter ${prev.length + 1}`,
        body: "",
        episodes: storyStructure.hasEpisodes
          ? [{ id: 1, title: "Episode 1", body: "" }]
          : undefined,
      },
    ]);
  }, [storyStructure.hasEpisodes]);

  const addPart = useCallback(() => {
    setParts((prev) => [
      ...prev,
      { id: prev.length + 1, title: `Part ${prev.length + 1}`, body: "" },
    ]);
  }, []);

  // Handle additional info submission
  const handleAdditionalInfoSubmit = useCallback(
    (authorNote: string, giveConsent: boolean) => {
      const finalData = { ...formData, authorNote, giveConsent };
      const contentData = storyStructure.hasChapters ? chapters : undefined;
      const partsData = !storyStructure.hasChapters ? parts : undefined;

      onSubmit(finalData, contentData, partsData);
    },
    [formData, storyStructure, chapters, parts, onSubmit]
  );

  // Handle cover image change
  const handleCoverImageChange = useCallback(
    (imageUrl: string | null) => {
      handleFieldChange("coverImage", imageUrl || "");
    },
    [handleFieldChange]
  );

  // Render cover image section
  const renderCoverImage = () => (
    <ImageUpload
      value={formData.coverImage}
      onChange={handleCoverImageChange}
      aspectRatio="video"
      placeholder="Add cover image"
      className="w-full"
    />
  );

  // Render form fields
  const renderFormFields = () => (
    <div className="space-y-6">
      {/* Cover Image */}
      {renderCoverImage()}

      {/* Story Title */}
      <FormField
        label="Story Title"
        type="text"
        id="title"
        placeholder="Enter your story title"
        value={formData.title}
        onValueChange={(value) => handleFieldChange("title", value)}
        isRequired
        isInvalid={!!formErrors.title}
        errorMessage={formErrors.title}
        maxLen={100}
      />

      {/* Collaborate */}
      <CollaboratorInput
        value={formData.collaborate}
        onChange={(value) => handleFieldChange("collaborate", value)}
        className="mt-6"
      />

      {/* Description */}
      <TextAreaField
        label="Story Description"
        htmlFor="description"
        id="description"
        placeholder="Describe your story..."
        value={formData.description}
        onChange={(value) => handleFieldChange("description", value)}
        isInvalid={!!formErrors.description}
        errorMessage={formErrors.description || ""}
        required
        minLen={10}
        maxLen={500}
        rows={4}
      />

      {/* Genre Selection */}
      <div>
        <label
          className={`text-primary-colour text-base mb-4 block ${Magnetik_Medium.className}`}
        >
          Select Genres (max 3){" "}
          {formErrors.selectedGenres && <span className="text-red-500">*</span>}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {GENRES.map((genre) => {
            const isSelected = formData.selectedGenres.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => handleGenreToggle(genre)}
                disabled={!isSelected && formData.selectedGenres.length >= 3}
                className={cn(
                  "relative whitespace-nowrap flex-shrink-0 transition-all duration-200 ease-in-out",
                  "px-2 py-1 rounded-lg min-w-[70px] text-center text-xs",
                  Magnetik_Regular.className,
                  isSelected ? "shadow-lg" : "",
                  !isSelected && formData.selectedGenres.length >= 3
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                )}
                style={{
                  backgroundImage: `repeating-linear-gradient(-45deg, #f89a28, #f89a28 18px, #ec8e1c 18px, #ec8e1c 36px)`,
                  color: "white",
                  border: isSelected
                    ? "2px solid rgba(255,255,255,0.9)"
                    : "1px solid rgba(0,0,0,0.06)",
                  boxShadow: isSelected
                    ? "0 8px 20px -8px rgba(0,0,0,0.2)"
                    : "0 3px 8px -6px rgba(0,0,0,0.12)",
                  fontWeight: 300,
                }}
              >
                {/* check-in-circle top-right */}
                {isSelected && (
                  <span
                    className="absolute flex items-center justify-center w-4 h-4 bg-white rounded-full -top-1 -right-1"
                    style={{ border: "2px solid #f28a20" }}
                  >
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="#f28a20"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
                <span className="relative z-10">{genre}</span>
              </button>
            );
          })}
        </div>
        {formErrors.selectedGenres && (
          <p className="mt-1 text-xs text-red-500">
            {formErrors.selectedGenres}
          </p>
        )}
      </div>

      {/* Story Language */}
      <div>
        <label
          className={`text-primary-colour text-base mb-2 block ${Magnetik_Medium.className}`}
        >
          Story Language
        </label>
        <Select
          placeholder="Select language"
          selectedKeys={[formData.language]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            handleFieldChange("language", value);
          }}
        >
          {LANGUAGES.map((language) => (
            <SelectItem key={language}>{language}</SelectItem>
          ))}
        </Select>
      </div>

      {/* Toggle Options */}
      <div className="space-y-4">
        {[
          { key: "goAnonymous", label: "Go anonymous" },
          { key: "onlyOnStorytime", label: "Only on Storytime" },
          { key: "Contains triggers/sensitive content", label: "Trigger" },
          { key: "copyright protected", label: "Copyright" },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span
              className={`text-primary-colour ${Magnetik_Regular.className}`}
            >
              {label}
            </span>
            <Switch
              size="sm"
              color="warning"
              isSelected={formData[key as keyof StoryFormData] as boolean}
              onValueChange={(value) =>
                handleFieldChange(key as keyof StoryFormData, value)
              }
              classNames={{
                wrapper: "group-data-[selected=true]:bg-primary-shade-6",
                thumb: "group-data-[selected=true]:bg-universal-white",
              }}
            />
          </div>
        ))}
      </div>

      {/* Story Status */}
      <div>
        <label
          className={`text-primary-colour text-base mb-4 block ${Magnetik_Medium.className}`}
        >
          Story Status
        </label>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.slice(0, 4).map((status) => (
            <Button
              key={status}
              variant={formData.storyStatus === status ? "solid" : "bordered"}
              size="sm"
              onClick={() => handleFieldChange("storyStatus", status)}
              className={cn(
                formData.storyStatus === status
                  ? "bg-complimentary-colour text-universal-white"
                  : "border-light-grey-2 text-primary-colour hover:border-complimentary-colour"
              )}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  // Render writing interface
  const renderWritingInterface = () => (
    <div className="space-y-6">
      {/* Cover Image */}
      {renderCoverImage()}

      {/* Content based on story structure */}
      {storyStructure.hasChapters ? (
        <div className="space-y-6">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className="p-4 space-y-4 bg-white rounded-lg shadow-sm"
            >
              <FormField
                label={`Chapter ${chapter.id} Title`}
                type="text"
                id={`chapter-${chapter.id}-title`}
                placeholder={`Chapter ${chapter.id}`}
                value={chapter.title}
                onValueChange={(value) => {
                  setChapters((prev) =>
                    prev.map((ch) =>
                      ch.id === chapter.id ? { ...ch, title: value } : ch
                    )
                  );
                }}
              />

              {storyStructure.hasEpisodes &&
                chapter.episodes?.map((episode) => (
                  <div key={episode.id} className="ml-4">
                    <FormField
                      label={`Episode ${episode.id} Title`}
                      type="text"
                      id={`episode-${chapter.id}-${episode.id}-title`}
                      placeholder={`Episode ${episode.id}`}
                      value={episode.title}
                      onValueChange={(value) => {
                        setChapters((prev) =>
                          prev.map((ch) =>
                            ch.id === chapter.id
                              ? {
                                  ...ch,
                                  episodes: ch.episodes?.map((ep) =>
                                    ep.id === episode.id
                                      ? { ...ep, title: value }
                                      : ep
                                  ),
                                }
                              : ch
                          )
                        );
                      }}
                    />
                  </div>
                ))}

              <TextAreaField
                label="Content"
                htmlFor={`chapter-${chapter.id}-body`}
                id={`chapter-${chapter.id}-body`}
                isInvalid={false}
                errorMessage=""
                placeholder="Write your story content here..."
                value={chapter.body}
                onChange={(value) => {
                  setChapters((prev) =>
                    prev.map((ch) =>
                      ch.id === chapter.id ? { ...ch, body: value } : ch
                    )
                  );
                }}
                rows={12}
              />

              {index === chapters.length - 1 && (
                <Button
                  variant="ghost"
                  className="flex items-center w-full gap-2 border border-dashed text-complimentary-colour border-complimentary-colour"
                  onClick={addChapter}
                >
                  <span className={Magnetik_Medium.className}>
                    + Add Chapter
                  </span>
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {parts.map((part, index) => (
            <div
              key={part.id}
              className="p-4 space-y-4 bg-white rounded-lg shadow-sm"
            >
              <FormField
                label="Part Title"
                type="text"
                id={`part-${part.id}-title`}
                placeholder={part.title}
                value={part.title}
                onValueChange={(value) => {
                  setParts((prev) =>
                    prev.map((p) =>
                      p.id === part.id ? { ...p, title: value } : p
                    )
                  );
                }}
              />

              <TextAreaField
                label="Content"
                htmlFor={`part-${part.id}-body`}
                id={`part-${part.id}-body`}
                isInvalid={false}
                errorMessage=""
                placeholder="Write your story content here..."
                value={part.body}
                onChange={(value) => {
                  setParts((prev) =>
                    prev.map((p) =>
                      p.id === part.id ? { ...p, body: value } : p
                    )
                  );
                }}
                rows={12}
              />

              {index === parts.length - 1 && (
                <Button
                  variant="ghost"
                  className="flex items-center w-full gap-2 border border-dashed text-complimentary-colour border-complimentary-colour"
                  onClick={addPart}
                >
                  <span className={Magnetik_Medium.className}>+ Add Part</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render action buttons
  const renderActionButtons = () => {
    if (currentStep === "writing") {
      return (
        <div className="flex gap-3">
          <Button
            variant="bordered"
            className={`flex-1 border-light-grey-2 text-primary-colour ${Magnetik_Regular.className}`}
            onClick={() => {
              const draftData = { ...formData, storyStatus: "Draft" };
              onSubmit(
                draftData,
                storyStructure.hasChapters ? chapters : undefined,
                !storyStructure.hasChapters ? parts : undefined
              );
            }}
            disabled={isLoading}
          >
            Save as Draft
          </Button>
          <Button
            className={`flex-1 bg-primary-shade-6 text-universal-white ${Magnetik_Medium.className}`}
            onClick={() => setCurrentStep("additional")}
            disabled={isLoading}
          >
            Publish
          </Button>
        </div>
      );
    }

    return (
      <div className="flex gap-3">
        {onCancel && (
          <Button
            variant="bordered"
            className={`flex-1 border-light-grey-2 text-primary-colour ${Magnetik_Regular.className}`}
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          className={`flex-1 bg-primary-shade-6 text-universal-white ${Magnetik_Medium.className}`}
          onClick={handleSubmit}
          disabled={isLoading}
          isLoading={isLoading}
        >
          {mode === "edit" ? "Update Story" : "Continue"}
        </Button>
      </div>
    );
  };

  return (
    <div className="pb-24 space-y-6">
      {/* Main Form Content */}
      {currentStep === "form" && renderFormFields()}
      {currentStep === "writing" && renderWritingInterface()}

      {/* Action Buttons */}
      {(currentStep === "form" || currentStep === "writing") &&
        renderActionButtons()}

      {/* Modals */}
      {mode === "create" && (
        <>
          <StoryBriefModal
            isOpen={currentStep === "structure"}
            onClose={() => setCurrentStep("form")}
            onNext={handleStructureNext}
          />

          <AdditionalInfoModal
            isOpen={currentStep === "additional"}
            onClose={() => setCurrentStep("writing")}
            onSubmit={handleAdditionalInfoSubmit}
            onSkip={() =>
              onSubmit(
                formData,
                storyStructure.hasChapters ? chapters : undefined,
                !storyStructure.hasChapters ? parts : undefined
              )
            }
          />
        </>
      )}
    </div>
  );
};

export default StoryForm;
