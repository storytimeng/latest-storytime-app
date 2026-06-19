import DOMPurify from "dompurify";

const RICH_HTML_SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "b",
    "i",
    "em",
    "strong",
    "a",
    "p",
    "br",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "span",
    "div",
    "img",
    "blockquote",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "class"],
  RETURN_TRUSTED_TYPE: false,
};

export function sanitizeRichHtml(html: string): string {
  return String(DOMPurify.sanitize(html, RICH_HTML_SANITIZE_CONFIG));
}

export function isHtmlContent(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value.trim());
}

export function stripHtml(value: string): string {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getNotificationPreview(message: string): string {
  return isHtmlContent(message) ? stripHtml(message) : message;
}
