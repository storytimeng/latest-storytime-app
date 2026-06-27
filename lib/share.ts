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
  description?: string,
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
 * Share a referral link
 */
export async function shareReferralLink(
  shareUrl: string,
  referralCode: string,
): Promise<boolean> {
  return shareContent({
    title: "Join Storytime",
    text: `Join me on Storytime - discover amazing stories! Use my referral code: ${referralCode}`,
    url: shareUrl,
  });
}

/**
 * Open WhatsApp share for referral link
 */
export function shareReferralViaWhatsApp(
  shareUrl: string,
  referralCode: string,
) {
  const text = encodeURIComponent(
    `Join me on Storytime! Use my referral link: ${shareUrl} (Code: ${referralCode})`,
  );
  window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
}

/**
 * Open X/Twitter share for referral link
 */
export function shareReferralViaTwitter(shareUrl: string) {
  const text = encodeURIComponent(
    "Join me on Storytime - discover amazing stories!",
  );
  window.open(
    `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

/**
 * Open Facebook share for referral link
 */
export function shareReferralViaFacebook(shareUrl: string) {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

/**
 * Share a specific chapter/episode
 */
export async function shareChapter(
  storyId: string,
  contentId: string,
  storyTitle: string,
  chapterTitle: string,
  isChapter: boolean = true,
): Promise<boolean> {
  const url = `${window.location.origin}/story/${storyId}/read?${isChapter ? "chapterId" : "episodeId"}=${contentId}`;
  const contentType = isChapter ? "Chapter" : "Episode";

  return shareContent({
    title: `${storyTitle} - ${chapterTitle} | Storytime`,
    text: `Read ${contentType}: ${chapterTitle} from ${storyTitle} on Storytime!`,
    url,
  });
}
