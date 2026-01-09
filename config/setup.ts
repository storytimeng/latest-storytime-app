export interface SetupStep {
  id: number;
  hashId: string;
  title: string;
  subtitle: string;
  isOptional?: boolean;
  requiresValidation?: boolean;
}

export const SETUP_STEPS: SetupStep[] = [
  {
    id: 1,
    hashId: "name",
    title: "Enter a Pen Name 👋",
    subtitle: "A unique Pen Name to make you stand out.",
    requiresValidation: true,
  },
  {
    id: 2,
    hashId: "avatar",
    title: "Add a profile picture 👋",
    subtitle: "Add an image you like as your display picture.",
    isOptional: true,
  },
  {
    id: 3,
    hashId: "genres",
    title: "Select Favourite Genre 👋",
    subtitle: "Choose the genres you love to read. This will help us recommend the best stories for you.",
    requiresValidation: true,
  },
  {
    id: 4,
    hashId: "read-time",
    title: "Select best time to read 👋",
    subtitle: "Kindly select the best time to read. We will always send you a reminder.",
  },
  {
    id: 5,
    hashId: "write-time",
    title: "Select best time to write 👋",
    subtitle: "Kindly select the best time to write. We will always send you a reminder.",
    isOptional: true,
  },
  {
    id: 6,
    hashId: "preview",
    title: "Preview",
    subtitle: "You can always edit this in your profile",
  },
];

export const ALL_GENRES = [
  "Action",
  "Adventure",
  "Anthology",
  "Biography",
  "Classic",
  "Comedy",
  "Drama",
  "Fantasy",
  "Historical",
  "Horror",
  "Mystery",
  "Poetry",
  "Romance",
  "Sci-fi",
  "Thriller",
];

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const SETUP_CONFIG = {
  animation: {
    duration: 0.3,
    easing: "easeInOut" as const,
    progressDuration: 0.5,
    progressEasing: [0.16, 1, 0.3, 1] as const,
  },
  validation: {
    minPenNameLength: 3,
    minGenres: 1,
    penNameDebounceMs: 1000,
  },
  routes: {
    onComplete: "/home",
    onCancel: "/auth/login",
  },
  progressSteps: 6, // Show 6 segments in progress bar
};
