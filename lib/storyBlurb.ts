export const STORY_BLURB_MIN_WORDS = 50;
export const STORY_BLURB_MAX_WORDS = 100;

export const STORY_BLURB_HELPER_TEXT =
  "Write a short summary of your story in 50–100 words (about 3–5 sentences). This appears on your story page and helps readers decide whether to read.";

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getStoryBlurbValidationError(
  description: string,
): string | undefined {
  const trimmed = description.trim();

  if (!trimmed) {
    return "Please write a story blurb before continuing.";
  }

  const wordCount = countWords(trimmed);

  if (wordCount < STORY_BLURB_MIN_WORDS) {
    const remaining = STORY_BLURB_MIN_WORDS - wordCount;
    return `Your blurb has ${wordCount} word${wordCount === 1 ? "" : "s"}. Add ${remaining} more to reach the ${STORY_BLURB_MIN_WORDS}-word minimum.`;
  }

  if (wordCount > STORY_BLURB_MAX_WORDS) {
    const excess = wordCount - STORY_BLURB_MAX_WORDS;
    return `Your blurb has ${wordCount} words. Shorten it by ${excess} word${excess === 1 ? "" : "s"} (maximum is ${STORY_BLURB_MAX_WORDS}).`;
  }

  if (trimmed.length < 50) {
    return "Your blurb is too short. Add a bit more detail so readers know what your story is about.";
  }

  return undefined;
}
