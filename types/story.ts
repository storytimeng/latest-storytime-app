// Temporary extension for AuthorDto until updated from Swagger
export interface AuthorDto {
  id: string;
  firstName: string;
  lastName: string;
  penName: string;
  email: string;
  avatar?: string;
  createdAt: string;
}
// Story Form Types
export interface StoryFormData {
  id?: string;
  title: string;
  collaborate: string;
  description: string;
  content?: string;
  selectedGenres: string[];
  language: string;
  goAnonymous: boolean;
  onlyOnStorytime: boolean;
  trigger: boolean;
  copyright: boolean;
  storyStatus: string;
  coverImage?: string;
  authorNote?: string;
  giveConsent?: boolean;
  chapter?: boolean;
  episodes?: boolean;
}

export interface StoryStructure {
  hasChapters: boolean;
  hasEpisodes: boolean;
}

export interface Chapter {
  id: number;
  title: string;
  body: string;
  episodes?: Episode[];
}

export interface Episode {
  id: number;
  title: string;
  body: string;
}

export interface Part {
  id: number;
  title: string;
  body: string;
}

export interface StoryFormProps {
  mode: "create" | "edit";
  initialData?: Partial<StoryFormData>;
  onSubmit: (data: StoryFormData, chapters?: Chapter[], parts?: Part[]) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  createdStoryId?: string | null;
  // Lifted state props
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

// Story View Types
export interface StoryViewProps {
  mode: "create" | "edit";
  storyId?: string;
}

// Modal Props Types
export interface StoryBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (structure: StoryStructure) => void;
}

export interface AdditionalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (authorNote: string, giveConsent: boolean) => void;
  onSkip: () => void;
}

// API Response Types
export interface SaveStoryResponse {
  id: string;
  success: boolean;
  message?: string;
}

// Constants
export const GENRES = [
  "Adventure",
  "Romance",
  "Mystery",
  "Fantasy",
  "Sci-Fi",
  "Thriller",
  "Drama",
  "Comedy",
  "Horror",
  "Historical",
  "Contemporary",
  "Young Adult",
  "Poetry",
  "Non-Fiction",
  "Biography",
] as const;

export const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
] as const;

export const STATUSES = [
  "Draft",
  "Published",
  "In Progress",
  "Completed",
  "On Hold",
] as const;

export type Genre = (typeof GENRES)[number];
export type Language = (typeof LANGUAGES)[number];
export type Status = (typeof STATUSES)[number];
