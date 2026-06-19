export const STORY_COVER_FALLBACK = "/images/storytime-fallback.png";

export function getStoryCoverSrc(imageUrl?: string | null): string {
  const trimmed = imageUrl?.trim();
  return trimmed || STORY_COVER_FALLBACK;
}
