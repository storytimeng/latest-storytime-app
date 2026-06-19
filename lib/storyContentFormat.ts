function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isLikelyHtml(content: string): boolean {
  return /<(p|div|br|h[1-6]|ul|ol|li|blockquote|strong|em|b|i|a|img)\b/i.test(
    content,
  );
}

export function stripHtmlForWordCount(content?: string | null): string {
  if (!content) return "";
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitPlainTextParagraphs(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  if (/\n\s*\n/.test(normalized)) {
    return normalized
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  if (normalized.length < 300) {
    return [normalized];
  }

  const sentences = normalized.split(/(?<=[.!?…])\s+/).filter(Boolean);
  if (sentences.length <= 2) {
    return [normalized];
  }

  const paragraphs: string[] = [];
  let chunk: string[] = [];
  let chunkLength = 0;

  for (const sentence of sentences) {
    chunk.push(sentence);
    chunkLength += sentence.length;

    if (chunk.length >= 3 && chunkLength >= 280) {
      paragraphs.push(chunk.join(" "));
      chunk = [];
      chunkLength = 0;
    }
  }

  if (chunk.length > 0) {
    paragraphs.push(chunk.join(" "));
  }

  return paragraphs.length > 0 ? paragraphs : [normalized];
}

/**
 * Ensures story body text renders with paragraphs and spacing.
 * - Rich text from TipTap is passed through unchanged.
 * - Plain text (legacy imports) is wrapped in <p> tags with smart breaks.
 */
export function normalizeStoryHtml(content?: string | null): string {
  const trimmed = content?.trim();
  if (!trimmed) return "";

  if (isLikelyHtml(trimmed)) {
    return trimmed;
  }

  const paragraphs = splitPlainTextParagraphs(trimmed);
  return paragraphs
    .map(
      (paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}
