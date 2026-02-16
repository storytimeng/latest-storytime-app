"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Accordion, AccordionItem } from "@heroui/accordion";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { ChevronRight, Trash2, X, ArrowLeft } from "lucide-react";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import FormField from "./formField";
import TextAreaField from "./textArea";
import ImageUpload from "./imageUpload";
import { CollaboratorInput } from "./CollaboratorInput";
import { cn } from "@/lib/utils";
import { showToast } from "@/lib/showNotification";
import { ErrorModal } from "@/components/reusables/modals/ErrorModal";
import { UPLOAD_PATHS } from "@/src/config/uploadPaths";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import { useGenres } from "@/src/hooks/useGenres";
import { useStoryFormState } from "@/src/hooks/useStoryFormState";
import { useStoryContent } from "@/src/hooks/useStoryContent";
import { useUserStore } from "@/src/stores/useUserStore";
import type {
  StoryFormData,
  StoryStructure,
  Chapter,
  Part,
  StoryFormProps,
  StoryBriefModalProps,
  AdditionalInfoModalProps,
} from "@/types/story";
import { LANGUAGES, STATUSES } from "@/types/story";

// Initial form data
const getInitialFormData = (
  initialData?: Partial<StoryFormData>,
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
                      // If selecting Yes for chapters, set episodes to No
                      hasEpisodes: index === 1 ? false : prev.hasEpisodes,
                    }))
                  }
                  className={cn(
                    "flex-1",
                    structure.hasChapters === Boolean(index)
                      ? "bg-complimentary-colour text-universal-white"
                      : "border-complimentary-colour text-complimentary-colour",
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
                      // If selecting Yes for episodes, set chapters to No
                      hasChapters: index === 1 ? false : prev.hasChapters,
                    }))
                  }
                  className={cn(
                    "flex-1",
                    structure.hasEpisodes === Boolean(index)
                      ? "bg-complimentary-colour text-universal-white"
                      : "border-complimentary-colour text-complimentary-colour",
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
              Note: A story can have either chapters or episodes, not both.
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

// Helper function to format timestamps
const formatTimestamp = (timestamp?: string): string => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

// Main Story Form Component
const StoryForm: React.FC<StoryFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  createdStoryId,
  initialChapters,
  initialParts,
  // Lifted state props
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
}) => {
  const { user } = useUserStore();
  const userId = user?.id;

  // Fetch genres from API
  const { genres: apiGenres, isLoading: isLoadingGenres } = useGenres();
  const genres = apiGenres || [];

  // Get storyId for lazy loading (edit mode uses initialData.id, create mode uses createdStoryId)
  const storyId =
    mode === "edit" ? (initialData?.id as string) : createdStoryId || undefined;

  const contentStateHook = useStoryContent({
    storyStructure: storyStructure,
    initialChapters,
    initialParts,
    storyId,
  });

  // Content state from hooks
  const chapters = contentStateHook.chapters;
  const parts = contentStateHook.parts;

  // Debug logging
  console.log("[storyForm] Render state:", {
    mode,
    storyStructure,
    initialChapters,
    initialParts,
    chapters,
    parts,
  });
  const setChapters = contentStateHook.setChapters;
  const setParts = contentStateHook.setParts;
  const addChapter = contentStateHook.addChapter;
  const addPart = contentStateHook.addPart;
  const toggleChapter = contentStateHook.toggleChapter;
  const toggleEpisode = contentStateHook.toggleEpisode;
  const expandedChapters = contentStateHook.expandedChapters;
  const expandedEpisodes = contentStateHook.expandedEpisodes;
  const setExpandedChapters = contentStateHook.setExpandedChapters;
  const setExpandedEpisodes = contentStateHook.setExpandedEpisodes;
  const updateChapter = contentStateHook.updateChapter;
  const updatePart = contentStateHook.updatePart;
  const getEditedChapters = contentStateHook.getEditedChapters;
  const getEditedParts = contentStateHook.getEditedParts;
  const getAllModifiedChapters = contentStateHook.getAllModifiedChapters;
  const getAllModifiedParts = contentStateHook.getAllModifiedParts;
  const selectedChapterIndex = contentStateHook.selectedChapterIndex;
  const selectedPartIndex = contentStateHook.selectedPartIndex;
  const setSelectedChapterIndex = contentStateHook.setSelectedChapterIndex;
  const setSelectedPartIndex = contentStateHook.setSelectedPartIndex;
  const loadChapterContent = contentStateHook.loadChapterContent;
  const loadEpisodeContent = contentStateHook.loadEpisodeContent;
  const loadingChapterIds = contentStateHook.loadingChapterIds;
  const loadingPartIds = contentStateHook.loadingPartIds;
  const deletedChapterIds = contentStateHook.deletedChapterIds;
  const deletedPartIds = contentStateHook.deletedPartIds;
  const markChapterForDeletion = contentStateHook.markChapterForDeletion;
  const markPartForDeletion = contentStateHook.markPartForDeletion;
  const restoreChapter = contentStateHook.restoreChapter;
  const restorePart = contentStateHook.restorePart;
  const getDeletedChapters = contentStateHook.getDeletedChapters;
  const getDeletedParts = contentStateHook.getDeletedParts;
  const renumberChapters = contentStateHook.renumberChapters;
  const renumberParts = contentStateHook.renumberParts;

  // Error modal state
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState<string | undefined>();

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "chapter" | "episode";
    id: number;
    title: string;
    uuid?: string;
  } | null>(null);

  // Windowed loading: Show ±5 episodes/chapters from selected index
  const visibleChapters = useMemo(() => {
    if (selectedChapterIndex === null || chapters.length <= 10) {
      console.log("[storyForm] Showing all chapters:", chapters.length);
      return chapters; // Show all if 10 or fewer
    }

    const start = Math.max(0, selectedChapterIndex - 5);
    const end = Math.min(chapters.length, selectedChapterIndex + 6); // +6 to include selected + 5 after
    const visible = chapters.slice(start, end);
    console.log("[storyForm] Windowed chapters:", {
      selectedChapterIndex,
      start,
      end,
      visibleCount: visible.length,
      totalCount: chapters.length,
    });
    return visible;
  }, [chapters, selectedChapterIndex]);

  const visibleParts = useMemo(() => {
    if (selectedPartIndex === null || parts.length <= 10) {
      console.log("[storyForm] Showing all episodes:", parts.length);
      return parts; // Show all if 10 or fewer
    }

    const start = Math.max(0, selectedPartIndex - 5);
    const end = Math.min(parts.length, selectedPartIndex + 6);
    const visible = parts.slice(start, end);
    console.log("[storyForm] Windowed episodes:", {
      selectedPartIndex,
      start,
      end,
      visibleCount: visible.length,
      totalCount: parts.length,
    });
    return visible;
  }, [parts, selectedPartIndex]);

  // Track what we've attempted to load to prevent infinite loops
  const attemptedChapterLoads = useRef<Set<string>>(new Set());
  const attemptedEpisodeLoads = useRef<Set<string>>(new Set());

  // Clear attempted loads when story changes
  useEffect(() => {
    attemptedChapterLoads.current.clear();
    attemptedEpisodeLoads.current.clear();
    console.log("[storyForm] Cleared attempted loads for new story:", storyId);
  }, [storyId]);

  // Auto-expand selected episode/chapter when entering writing view and load content
  useEffect(() => {
    if (currentStep === "writing" && mode === "edit" && storyId) {
      if (selectedChapterIndex !== null && chapters[selectedChapterIndex]) {
        const selectedChapter = chapters[selectedChapterIndex];
        console.log("[storyForm] Auto-expanding chapter:", {
          selectedChapterIndex,
          chapterId: selectedChapter.id,
          chapterUuid: selectedChapter.uuid,
          title: selectedChapter.title,
        });
        setExpandedChapters(new Set([selectedChapter.id]));

        // Load chapter content if it has a UUID and we haven't attempted yet
        if (
          selectedChapter.uuid &&
          !attemptedChapterLoads.current.has(selectedChapter.uuid)
        ) {
          attemptedChapterLoads.current.add(selectedChapter.uuid);
          loadChapterContent(selectedChapter.uuid, selectedChapterIndex);
        }
      }
      if (selectedPartIndex !== null && parts[selectedPartIndex]) {
        const selectedPart = parts[selectedPartIndex];
        console.log("[storyForm] Auto-expanding episode:", {
          selectedPartIndex,
          partId: selectedPart.id,
          partUuid: selectedPart.uuid,
          title: selectedPart.title,
        });
        setExpandedEpisodes(new Set([selectedPart.id]));

        // Load episode content if it has a UUID and we haven't attempted yet
        if (
          selectedPart.uuid &&
          !attemptedEpisodeLoads.current.has(selectedPart.uuid)
        ) {
          attemptedEpisodeLoads.current.add(selectedPart.uuid);
          loadEpisodeContent(selectedPart.uuid, selectedPartIndex);
        }
      }
    }
  }, [
    currentStep,
    selectedChapterIndex,
    selectedPartIndex,
    mode,
    storyId,
    setExpandedChapters,
    setExpandedEpisodes,
    loadChapterContent,
    loadEpisodeContent,
  ]);

  // Load content for expanded chapters (when user clicks accordion)
  useEffect(() => {
    if (
      mode === "edit" &&
      storyId &&
      expandedChapters.size > 0 &&
      chapters.length > 0
    ) {
      expandedChapters.forEach((chapterId) => {
        const chapterIndex = chapters.findIndex((ch) => ch.id === chapterId);
        if (chapterIndex !== -1) {
          const chapter = chapters[chapterIndex];
          // Load if has UUID and we haven't attempted to load it yet
          if (
            chapter.uuid &&
            !attemptedChapterLoads.current.has(chapter.uuid)
          ) {
            console.log("[storyForm] Loading content for expanded chapter:", {
              chapterId,
              chapterIndex,
              uuid: chapter.uuid,
            });
            attemptedChapterLoads.current.add(chapter.uuid);
            loadChapterContent(chapter.uuid, chapterIndex);
          }
        }
      });
    }
  }, [expandedChapters, chapters, mode, storyId, loadChapterContent]);

  // Load content for expanded episodes (when user clicks accordion)
  useEffect(() => {
    if (
      mode === "edit" &&
      storyId &&
      expandedEpisodes.size > 0 &&
      parts.length > 0
    ) {
      expandedEpisodes.forEach((episodeId) => {
        const episodeIndex = parts.findIndex((p) => p.id === episodeId);
        if (episodeIndex !== -1) {
          const episode = parts[episodeIndex];
          // Load if has UUID and we haven't attempted to load it yet
          if (
            episode.uuid &&
            !attemptedEpisodeLoads.current.has(episode.uuid)
          ) {
            console.log("[storyForm] Loading content for expanded episode:", {
              episodeId,
              episodeIndex,
              uuid: episode.uuid,
            });
            attemptedEpisodeLoads.current.add(episode.uuid);
            loadEpisodeContent(episode.uuid, episodeIndex);
          }
        }
      });
    }
  }, [expandedEpisodes, parts, mode, storyId, loadEpisodeContent]);

  // Auto-save state
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>("");

  // Show error in modal
  const showError = useCallback((message: string, details?: string) => {
    setErrorMessage(message);
    setErrorDetails(details);
    setErrorModalOpen(true);
  }, []);

  // Auto-save to IndexedDB
  const autoSave = useCallback(async () => {
    if (!userId) return;

    const currentData = JSON.stringify({
      formData,
      chapters,
      parts,
      storyStructure,
      timestamp: new Date().toISOString(),
    });

    // Don't save if nothing changed
    if (currentData === lastSavedDataRef.current) return;

    try {
      const storyKey = createdStoryId || initialData?.id || "draft";
      const db = await openDB();
      await db.put("autoSave", {
        id: `story-${storyKey}`,
        data: currentData,
        timestamp: Date.now(),
      });
      lastSavedDataRef.current = currentData;
      console.log("✅ Auto-saved at", new Date().toLocaleTimeString());
    } catch (error) {
      console.error("❌ Auto-save failed:", error);
    }
  }, [
    userId,
    formData,
    chapters,
    parts,
    storyStructure,
    createdStoryId,
    initialData?.id,
  ]);

  // Set up auto-save interval
  useEffect(() => {
    if (currentStep !== "writing" && currentStep !== "form") return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    // Auto-save every 30 seconds
    autoSaveTimerRef.current = setInterval(() => {
      autoSave();
    }, 30000);

    // Save on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSave();
      }
    };
  }, [currentStep, autoSave]);

  // Helper to open IndexedDB
  const openDB = async () => {
    return new Promise<any>((resolve, reject) => {
      const request = indexedDB.open("StoryAutosave", 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () =>
        resolve({
          put: (store: string, data: any) => {
            const db = request.result;
            const transaction = db.transaction([store], "readwrite");
            const objectStore = transaction.objectStore(store);
            return new Promise((res, rej) => {
              const req = objectStore.put(data);
              req.onsuccess = () => res(req.result);
              req.onerror = () => rej(req.error);
            });
          },
        });
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("autoSave")) {
          db.createObjectStore("autoSave", { keyPath: "id" });
        }
      };
    });
  };

  // Auto-save chapters/episodes to cache when they change
  useEffect(() => {
    if (chapters.length > 0 || parts.length > 0) {
      autoSave();
    }
  }, [chapters, parts, autoSave]);

  // Update form data when initialData changes (for edit mode)
  React.useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData(getInitialFormData(initialData));
      // Update story structure based on chapter/episodes flags
      setStoryStructure({
        hasChapters: initialData.chapter || false,
        hasEpisodes: initialData.episodes || false,
      });
      // Always stay on form step in edit mode - user can navigate to writing
      setCurrentStep("form");
    }
  }, [mode, initialData]);

  // Form validation is now handled by formStateHook.validateForm

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;

    if (mode === "create" && currentStep === "form") {
      setCurrentStep("structure");
      return;
    }

    // For edit mode, only send edited chapters/episodes
    // For create mode, send all
    let contentData: Chapter[] | undefined;
    let partsData: Part[] | undefined;

    if (mode === "edit") {
      // Only send edited items
      contentData = storyStructure.hasChapters
        ? getAllModifiedChapters()
        : undefined;
      partsData = !storyStructure.hasChapters
        ? getAllModifiedParts()
        : undefined;

      console.log("[storyForm] Submitting edited items:", {
        editedChapters: contentData,
        editedParts: partsData,
      });
    } else {
      // Create mode - send all
      contentData = storyStructure.hasChapters ? chapters : undefined;
      partsData = !storyStructure.hasChapters ? parts : undefined;
    }

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
    getAllModifiedChapters,
    getAllModifiedParts,
  ]);

  // Wrap submission with error handling (defined after handleSubmit)
  const handleSubmitWithErrorHandling = useCallback(async () => {
    try {
      await handleSubmit();
    } catch (error: any) {
      const message =
        error?.message || "An error occurred while saving the story";
      const details = error?.response?.data?.message || error?.toString();
      showError(message, details);
    }
  }, [handleSubmit, showError]);

  // Handle additional info submission
  const handleAdditionalInfoSubmit = useCallback(
    (authorNote: string, giveConsent: boolean) => {
      const finalData = { ...formData, authorNote, giveConsent };

      // For edit mode, only send edited chapters/episodes and deleted ones
      let contentData: Chapter[] | undefined;
      let partsData: Part[] | undefined;
      let deletedChaptersData: Chapter[] | undefined;
      let deletedPartsData: Part[] | undefined;

      if (mode === "edit") {
        contentData = storyStructure.hasChapters
          ? getAllModifiedChapters()
          : undefined;
        partsData = !storyStructure.hasChapters
          ? getAllModifiedParts()
          : undefined;
        deletedChaptersData = storyStructure.hasChapters
          ? getDeletedChapters()
          : undefined;
        deletedPartsData = !storyStructure.hasChapters
          ? getDeletedParts()
          : undefined;
      } else {
        contentData = storyStructure.hasChapters ? chapters : undefined;
        partsData = !storyStructure.hasChapters ? parts : undefined;
      }

      onSubmit(
        finalData,
        contentData,
        partsData,
        deletedChaptersData,
        deletedPartsData,
      );
    },
    [
      formData,
      storyStructure,
      chapters,
      parts,
      mode,
      getAllModifiedChapters,
      getAllModifiedParts,
      getDeletedChapters,
      getDeletedParts,
      onSubmit,
    ],
  );

  // Handle delete modal
  const handleDeleteClick = useCallback(
    (type: "chapter" | "episode", id: number, title: string, uuid?: string) => {
      setItemToDelete({ type, id, title, uuid });
      setDeleteModalOpen(true);
    },
    [],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "chapter") {
      markChapterForDeletion(itemToDelete.id);
    } else {
      markPartForDeletion(itemToDelete.id);
    }

    setDeleteModalOpen(false);
    setItemToDelete(null);
    showToast({
      type: "success",
      message: `${itemToDelete.type === "chapter" ? "Chapter" : "Episode"} marked for deletion. Save to confirm.`,
    });
  }, [itemToDelete, markChapterForDeletion, markPartForDeletion]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  }, []);

  // Handle cover image change
  const handleCoverImageChange = useCallback(
    (imageUrl: string | null) => {
      handleFieldChange("coverImage", imageUrl || "");
    },
    [handleFieldChange],
  );

  // Define specialized upload hook for cover images
  const { upload: coverUpload, isUploading: isCoverUploading } = useImageUpload(
    UPLOAD_PATHS.STORY_COVER,
  );

  // Render cover image section
  const renderCoverImage = () => (
    <ImageUpload
      value={formData.coverImage}
      onChange={handleCoverImageChange}
      aspectRatio="video"
      placeholder="Add cover image"
      className="w-full"
      autoUpload={true}
      uploadFn={coverUpload}
      isUploading={isCoverUploading}
    />
  );

  // Render form fields
  const renderFormFields = () => (
    <div className="space-y-6 ">
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
        className="pt-4"
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
        minLen={50}
        maxLen={1000}
        rows={4}
        showWordCounter={true}
        minWords={50}
        maxWords={100}
        className="max-h-[400px]"
      />

      {/* Content Field */}
      <TextAreaField
        label="Story Content"
        htmlFor="content"
        id="content"
        placeholder="Write your story content here..."
        value={formData.content || ""}
        onChange={(value) => handleFieldChange("content", value)}
        isInvalid={!!formErrors.content}
        errorMessage={formErrors.content || ""}
        required={!storyStructure.hasChapters && !storyStructure.hasEpisodes}
        rows={6}
        className="max-h-[400px]"
        isRichText={true}
      />
      {!storyStructure.hasChapters && !storyStructure.hasEpisodes && (
        <p className="-mt-4 text-xs text-gray-500">
          Content is required when your story doesn't have chapters or episodes.
        </p>
      )}

      {/* Show Chapters/Episodes in Edit Mode */}
      {mode === "edit" &&
        (storyStructure.hasChapters || storyStructure.hasEpisodes) &&
        ((storyStructure.hasChapters && chapters.length > 0) ||
          (storyStructure.hasEpisodes && parts.length > 0)) && (
          <div className="space-y-2">
            <label
              className={`text-primary-colour text-base block ${Magnetik_Medium.className}`}
            >
              {storyStructure.hasChapters ? "Chapters" : "Episodes"}
            </label>
            <div className="max-h-[300px] overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
              {(storyStructure.hasChapters ? chapters : parts)
                .slice(0, 5)
                .map((item, sliceIndex) => {
                  // Find the actual index in the full array
                  const actualIndex = storyStructure.hasChapters
                    ? chapters.findIndex((ch) => ch.id === item.id)
                    : parts.findIndex((p) => p.id === item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        console.log("[storyForm] Chapter/Episode clicked:", {
                          itemId: item.id,
                          actualIndex,
                          title: item.title,
                          hasChapters: storyStructure.hasChapters,
                        });

                        if (storyStructure.hasChapters) {
                          setSelectedChapterIndex(actualIndex);
                        } else {
                          setSelectedPartIndex(actualIndex);
                        }
                        setCurrentStep("writing");
                      }}
                      className="flex items-center justify-between w-full p-3 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="text-left">
                        <p
                          className={`text-primary-colour text-sm ${Magnetik_Medium.className}`}
                        >
                          {storyStructure.hasChapters
                            ? `Chapter ${actualIndex + 1}`
                            : `Episode ${actualIndex + 1}`}
                        </p>
                        <p className="text-gray-500 text-xs truncate max-w-[250px]">
                          {item.title || "Untitled"}
                        </p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </button>
                  );
                })}
              {(storyStructure.hasChapters ? chapters.length : parts.length) >
                5 && (
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setCurrentStep("writing")}
                  className="w-full py-2 text-xs text-gray-600 hover:text-primary-colour"
                >
                  <span className={Magnetik_Regular.className}>
                    +
                    {(storyStructure.hasChapters
                      ? chapters.length
                      : parts.length) - 5}{" "}
                    more {storyStructure.hasChapters ? "chapters" : "episodes"}{" "}
                    - Click to view all
                  </span>
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep("writing")}
              className="w-full text-complimentary-colour"
            >
              Edit {storyStructure.hasChapters ? "Chapters" : "Episodes"}
            </Button>
          </div>
        )}

      {/* Genre Selection */}
      <div>
        <label
          className={`text-primary-colour text-base mb-4 block ${Magnetik_Medium.className}`}
        >
          Select Genres (max 3){" "}
          {formErrors.selectedGenres && <span className="text-red-500">*</span>}
        </label>
        {isLoadingGenres ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-8 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {genres.map((genre: string) => {
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
                      : "cursor-pointer",
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
        )}
        {formErrors.selectedGenres && (
          <p className="mt-1 text-xs text-red-500">
            {formErrors.selectedGenres}
          </p>
        )}
      </div>

      {/* Story Language */}
      <div>
        <label
          className={`mb-2 text-sm body-text-small-medium-auto text-grey-2 ${Magnetik_Medium.className}`}
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
          classNames={{
            trigger:
              "border-light-grey-2 hover:border-primary-colour data-[hover=true]:border-primary-colour",
            value: "text-grey-2",
          }}
          popoverProps={{
            classNames: {
              content: "bg-accent-shade-2",
            },
          }}
          listboxProps={{
            itemClasses: {
              base: "data-[hover=true]:bg-complimentary-colour/10 data-[focus=true]:bg-complimentary-colour/20 data-[selected=true]:bg-complimentary-colour/20",
            },
          }}
          variant="bordered"
          radius="lg"
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
                  : "border-light-grey-2 text-primary-colour hover:border-complimentary-colour",
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
        <div className="space-y-4">
          {chapters.length > 10 && selectedChapterIndex !== null && (
            <Button
              size="sm"
              variant="light"
              className="mb-2 text-sm text-gray-600 hover:text-primary-colour"
              onClick={() => setCurrentStep("writing")}
            >
              <span className={Magnetik_Regular.className}>
                Showing {visibleChapters.length} of {chapters.length} chapters
                (±5 from selected) - Click to view all
              </span>
            </Button>
          )}
          <Accordion
            variant="splitted"
            selectionMode="multiple"
            selectedKeys={Array.from(expandedChapters).map(String)}
            onSelectionChange={(keys) => {
              const newSet = new Set(
                Array.from(keys as Set<string>).map((k) => parseInt(k, 10)),
              );
              setExpandedChapters(newSet);
            }}
            className="px-0"
            itemClasses={{
              base: "mb-4",
              trigger:
                "py-4 px-4 bg-white hover:bg-accent-shade-1 rounded-lg data-[hover=true]:bg-accent-shade-1",
              title: `text-base text-primary-colour font-medium ${Magnetik_Medium.className}`,
              indicator: "text-primary-colour",
              content: "px-4 pb-4 pt-0",
            }}
          >
            {visibleChapters.map((chapter, chapterIndex) => {
              const isDeleted = deletedChapterIds.has(chapter.id);

              return (
                <AccordionItem
                  key={chapter.uuid || `chapter-${chapter.id}`}
                  aria-label={`Chapter ${chapter.id}`}
                  title={
                    <div className="flex items-center justify-between w-full pr-2">
                      <div className="flex flex-col gap-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Chapter</span>
                          <input
                            type="number"
                            min="1"
                            value={chapter.chapterNumber ?? chapter.id}
                            onChange={(e) => {
                              e.stopPropagation();
                              const num = parseInt(e.target.value);
                              if (!isNaN(num) && num > 0) {
                                updateChapter(chapter.id, "chapterNumber", num);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                              "w-16 px-2 py-1 text-sm border rounded",
                              isDeleted && "opacity-50",
                            )}
                            disabled={isDeleted}
                          />
                          <span
                            className={cn(
                              isDeleted && "line-through opacity-50",
                            )}
                          >
                            : {chapter.title || `Chapter ${chapter.id}`}
                          </span>
                        </div>
                        {(chapter.createdAt || chapter.updatedAt) && (
                          <span className="text-xs text-gray-500">
                            {chapter.createdAt && (
                              <span>
                                Created: {formatTimestamp(chapter.createdAt)}
                              </span>
                            )}
                            {chapter.updatedAt &&
                              chapter.updatedAt !== chapter.createdAt && (
                                <span className="ml-3">
                                  Updated: {formatTimestamp(chapter.updatedAt)}
                                </span>
                              )}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isDeleted) {
                            restoreChapter(chapter.id);
                            showToast({
                              type: "success",
                              message: "Chapter restored",
                            });
                          } else {
                            handleDeleteClick(
                              "chapter",
                              chapter.id,
                              chapter.title || `Chapter ${chapter.id}`,
                              chapter.uuid,
                            );
                          }
                        }}
                        className={cn(
                          "p-2 rounded-md transition-colors",
                          isDeleted
                            ? "text-green-600 hover:bg-green-50"
                            : "text-red-600 hover:bg-red-50",
                        )}
                        title={isDeleted ? "Restore chapter" : "Delete chapter"}
                      >
                        {isDeleted ? (
                          <span className="text-sm font-medium">Restore</span>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  }
                  classNames={{
                    base: cn(isDeleted && "opacity-60"),
                  }}
                >
                  <div className="space-y-4">
                    <FormField
                      label={`Chapter ${chapter.id} Title`}
                      type="text"
                      id={`chapter-${chapter.id}-title`}
                      placeholder={`Chapter ${chapter.id}`}
                      value={chapter.title}
                      onValueChange={(value) => {
                        updateChapter(chapter.id, "title", value);
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
                                            : ep,
                                        ),
                                      }
                                    : ch,
                                ),
                              );
                            }}
                          />
                        </div>
                      ))}

                    <div className="relative">
                      <TextAreaField
                        label="Content"
                        htmlFor={`chapter-${chapter.id}-body`}
                        id={`chapter-${chapter.id}-body`}
                        isInvalid={false}
                        errorMessage=""
                        placeholder="Write your story content here..."
                        value={chapter.body}
                        onChange={(value) => {
                          updateChapter(chapter.id, "body", value);
                        }}
                        rows={12}
                        isRichText={true}
                      />
                      {chapter.uuid && loadingChapterIds.has(chapter.uuid) && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-complimentary-colour"></div>
                            <p
                              className={`text-sm text-gray-500 ${Magnetik_Regular.className}`}
                            >
                              Loading content...
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Add Chapter and Renumber Buttons - Outside Accordion */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex items-center flex-1 gap-2 border border-dashed text-complimentary-colour border-complimentary-colour"
              onClick={addChapter}
            >
              <span className={Magnetik_Medium.className}>+ Add Chapter</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 border border-dashed text-primary-colour border-primary-colour"
              onClick={() => {
                renumberChapters();
                showToast({
                  type: "success",
                  message: "Chapters renumbered successfully",
                });
              }}
            >
              <span className={Magnetik_Medium.className}>Renumber</span>
            </Button>
          </div>
        </div>
      ) : storyStructure.hasEpisodes ? (
        <div className="space-y-4">
          {parts.length > 10 && selectedPartIndex !== null && (
            <Button
              size="sm"
              variant="light"
              className="mb-2 text-sm text-gray-600 hover:text-primary-colour"
              onClick={() => setCurrentStep("writing")}
            >
              <span className={Magnetik_Regular.className}>
                Showing {visibleParts.length} of {parts.length} episodes (±5
                from selected)
              </span>
            </Button>
          )}
          <Accordion
            variant="splitted"
            selectionMode="multiple"
            selectedKeys={Array.from(expandedEpisodes).map(String)}
            onSelectionChange={(keys) => {
              const newSet = new Set(
                Array.from(keys as Set<string>).map((k) => parseInt(k, 10)),
              );
              setExpandedEpisodes(newSet);
            }}
            className="px-0"
            itemClasses={{
              base: "mb-4",
              trigger:
                "py-4 px-4 bg-white hover:bg-accent-shade-1 rounded-lg data-[hover=true]:bg-accent-shade-1",
              title: `text-base text-primary-colour font-medium ${Magnetik_Medium.className}`,
              indicator: "text-primary-colour",
              content: "px-4 pb-4 pt-0",
            }}
          >
            {visibleParts.map((part, partIndex) => {
              const isDeleted = deletedPartIds.has(part.id);

              return (
                <AccordionItem
                  key={part.uuid || `episode-${part.id}`}
                  aria-label={`Episode ${part.id}`}
                  title={
                    <div className="flex items-center justify-between w-full pr-2">
                      <div className="flex flex-col gap-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Episode</span>
                          <input
                            type="number"
                            min="1"
                            value={part.episodeNumber ?? part.id}
                            onChange={(e) => {
                              e.stopPropagation();
                              const num = parseInt(e.target.value);
                              if (!isNaN(num) && num > 0) {
                                updatePart(part.id, "episodeNumber", num);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                              "w-16 px-2 py-1 text-sm border rounded",
                              isDeleted && "opacity-50",
                            )}
                            disabled={isDeleted}
                          />
                          <span
                            className={cn(
                              isDeleted && "line-through opacity-50",
                            )}
                          >
                            : {part.title || `Episode ${part.id}`}
                          </span>
                        </div>
                        {(part.createdAt || part.updatedAt) && (
                          <span className="text-xs text-gray-500">
                            {part.createdAt && (
                              <span>
                                Created: {formatTimestamp(part.createdAt)}
                              </span>
                            )}
                            {part.updatedAt &&
                              part.updatedAt !== part.createdAt && (
                                <span className="ml-3">
                                  Updated: {formatTimestamp(part.updatedAt)}
                                </span>
                              )}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isDeleted) {
                            restorePart(part.id);
                            showToast({
                              type: "success",
                              message: "Episode restored",
                            });
                          } else {
                            handleDeleteClick(
                              "episode",
                              part.id,
                              part.title || `Episode ${part.id}`,
                              part.uuid,
                            );
                          }
                        }}
                        className={cn(
                          "p-2 rounded-md transition-colors",
                          isDeleted
                            ? "text-green-600 hover:bg-green-50"
                            : "text-red-600 hover:bg-red-50",
                        )}
                        title={isDeleted ? "Restore episode" : "Delete episode"}
                      >
                        {isDeleted ? (
                          <span className="text-sm font-medium">Restore</span>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  }
                  classNames={{
                    base: cn(isDeleted && "opacity-60"),
                  }}
                >
                  <div className="space-y-4">
                    <FormField
                      label="Episode Title"
                      type="text"
                      id={`part-${part.id}-title`}
                      placeholder={part.title}
                      value={part.title}
                      onValueChange={(value) => {
                        updatePart(part.id, "title", value);
                      }}
                    />

                    <div className="relative">
                      <TextAreaField
                        label="Content"
                        htmlFor={`part-${part.id}-body`}
                        id={`part-${part.id}-body`}
                        isInvalid={false}
                        errorMessage=""
                        placeholder="Write your episode content here..."
                        value={part.body}
                        onChange={(value) => {
                          updatePart(part.id, "body", value);
                        }}
                        rows={12}
                        isRichText={true}
                      />
                      {part.uuid && loadingPartIds.has(part.uuid) && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-complimentary-colour"></div>
                            <p
                              className={`text-sm text-gray-500 ${Magnetik_Regular.className}`}
                            >
                              Loading content...
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Add Episode and Renumber Buttons - Outside Accordion */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex items-center flex-1 gap-2 border border-dashed text-complimentary-colour border-complimentary-colour"
              onClick={addPart}
            >
              <span className={Magnetik_Medium.className}>+ Add Episode</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 border border-dashed text-primary-colour border-primary-colour"
              onClick={() => {
                renumberParts();
                showToast({
                  type: "success",
                  message: "Episodes renumbered successfully",
                });
              }}
            >
              <span className={Magnetik_Medium.className}>Renumber</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <TextAreaField
            label="Story Content"
            htmlFor="content"
            id="content"
            isInvalid={false}
            errorMessage=""
            placeholder="Write your full story here..."
            value={formData.content || ""}
            onChange={(value) => handleFieldChange("content", value)}
            rows={20}
            isRichText={true}
          />
          <p className="text-xs text-gray-500">
            Write your complete story in this field since you selected no
            chapters or episodes.
          </p>
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
                mode === "edit" && storyStructure.hasChapters
                  ? getAllModifiedChapters()
                  : storyStructure.hasChapters
                    ? chapters
                    : undefined,
                mode === "edit" && !storyStructure.hasChapters
                  ? getAllModifiedParts()
                  : !storyStructure.hasChapters
                    ? parts
                    : undefined,
                mode === "edit" && storyStructure.hasChapters
                  ? getDeletedChapters()
                  : undefined,
                mode === "edit" && !storyStructure.hasChapters
                  ? getDeletedParts()
                  : undefined,
              );
            }}
            disabled={isLoading}
          >
            Save as Draft
          </Button>
          <Button
            className={`flex-1 bg-primary-shade-6 text-universal-white ${Magnetik_Medium.className}`}
            onClick={() => {
              if (mode === "edit") {
                const publishData = { ...formData, storyStatus: "Published" };
                onSubmit(
                  publishData,
                  storyStructure.hasChapters
                    ? getAllModifiedChapters()
                    : undefined,
                  !storyStructure.hasChapters
                    ? getAllModifiedParts()
                    : undefined,
                  storyStructure.hasChapters ? getDeletedChapters() : undefined,
                  !storyStructure.hasChapters ? getDeletedParts() : undefined,
                );
              } else {
                setCurrentStep("additional");
              }
            }}
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
          onClick={handleSubmitWithErrorHandling}
          disabled={isLoading}
          isLoading={isLoading}
        >
          {mode === "edit" ? "Update Story" : "Continue"}
        </Button>
      </div>
    );
  };
  console.log("story structure", storyStructure);
  console.log("episodes", parts);
  console.log("chapters", chapters);
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
            onSkip={() => {
              onSubmit(
                formData,
                storyStructure.hasChapters ? chapters : undefined,
                !storyStructure.hasChapters ? parts : undefined,
                undefined, // deletedChapters - not used in create mode
                undefined, // deletedParts - not used in create mode
              );
            }}
          />
        </>
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        message={errorMessage}
        details={errorDetails}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        placement="bottom"
        classNames={{
          backdrop: "bg-black/50",
          base: "bg-universal-white rounded-t-3xl m-0 mb-0 max-w-[28rem] mx-auto",
          closeButton: "hidden",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center justify-between px-6 pt-6 pb-4">
            <button
              onClick={handleDeleteCancel}
              className="text-primary-colour"
            >
              <ArrowLeft size={20} />
            </button>
            <h2
              className={`flex-1 text-center body-text-small-medium-auto text-primary-colour ${Magnetik_Medium.className}`}
            >
              Delete {itemToDelete?.type === "chapter" ? "Chapter" : "Episode"}
            </h2>
            <button
              onClick={handleDeleteCancel}
              className="text-primary-colour"
            >
              <X size={20} />
            </button>
          </ModalHeader>

          <ModalBody className="px-6 py-8">
            <p
              className={`text-center body-text-small-medium-auto text-primary-colour ${Magnetik_Regular.className}`}
            >
              Are you sure you want to delete &ldquo;{itemToDelete?.title}
              &rdquo;?
            </p>
            <p
              className={`mt-4 text-center text-sm text-red-600 ${Magnetik_Regular.className}`}
            >
              This {itemToDelete?.type} will be deleted when you save.
            </p>
          </ModalBody>

          <ModalFooter className="flex gap-4 px-6 pt-0 pb-8">
            <Button
              onPress={handleDeleteCancel}
              className={`flex-1 py-7 text-base bg-transparent border-2 rounded-full border-primary-colour text-primary-colour ${Magnetik_Medium.className}`}
            >
              Cancel
            </Button>
            <Button
              onPress={handleDeleteConfirm}
              className={`flex-1 py-7 text-base rounded-full bg-red-600 hover:bg-red-700 text-white ${Magnetik_Medium.className}`}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default StoryForm;
