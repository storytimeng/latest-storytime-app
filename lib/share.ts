/**
 * Native Share API utility
 * Provides cross-platform sharing with fallback to clipboard copy
 */

export interface ShareData {
  title: string;
  text?: string;
  url: string;
}

/**
 * Check if Web Share API is available
 */
export function isShareSupported(): boolean {
  return typeof navigator !== "undefined" && "share" in navigator;
}

/**
 * Share content using native share or fallback to clipboard
 */
export async function shareContent(data: ShareData): Promise<boolean> {
  // Check if Web Share API is supported
  if (isShareSupported()) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name === "AbortError") {
        console.log("Share cancelled by user");
        return false;
      }
      console.error("Error sharing:", error);
      // Fall through to clipboard copy
    }
  }

  // Fallback to clipboard copy
  try {
    await navigator.clipboard.writeText(data.url);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Share a story
 */
export async function shareStory(
  storyId: string,
  title: string,
  description?: string
): Promise<boolean> {
  const url = `${window.location.origin}/story/${storyId}`;
  const text = description
    ? `${description.slice(0, 100)}...`
    : "Check out this story on Storytime!";

  return shareContent({
    title: `${title} | Storytime`,
    text,
    url,
  });
}

/**
 * Share a specific chapter/episode
 */
export async function shareChapter(
  storyId: string,
  contentId: string,
  storyTitle: string,
  chapterTitle: string,
  isChapter: boolean = true
): Promise<boolean> {
  const url = `${window.location.origin}/story/${storyId}/read?${isChapter ? "chapterId" : "episodeId"}=${contentId}`;
  const contentType = isChapter ? "Chapter" : "Episode";

  return shareContent({
    title: `${storyTitle} - ${chapterTitle} | Storytime`,
    text: `Read ${contentType}: ${chapterTitle} from ${storyTitle} on Storytime!`,
    url,
  });
}
