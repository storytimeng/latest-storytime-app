/**
 * Extract a user-facing message from hey-api / NestJS error payloads.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error == null) return fallback;

  if (typeof error === "string") {
    const trimmed = error.trim();
    return trimmed || fallback;
  }

  if (error instanceof Error) {
    const trimmed = error.message?.trim();
    if (trimmed) return trimmed;
  }

  if (typeof error === "object") {
    const payload = error as Record<string, unknown>;

    const fromMessage = normalizeMessage(payload.message);
    if (fromMessage) return fromMessage;

    // Some clients nest the body under `error` or `data`
    for (const key of ["error", "data", "body"] as const) {
      const nested = payload[key];
      if (nested && typeof nested === "object") {
        const nestedMessage = normalizeMessage(
          (nested as Record<string, unknown>).message,
        );
        if (nestedMessage) return nestedMessage;
      }
    }
  }

  return fallback;
}

function normalizeMessage(message: unknown): string | null {
  if (typeof message === "string") {
    const trimmed = message.trim();
    return trimmed || null;
  }

  if (Array.isArray(message)) {
    const parts = message
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object" && "message" in item) {
          const m = (item as { message?: unknown }).message;
          return typeof m === "string" ? m.trim() : "";
        }
        return "";
      })
      .filter(Boolean);

    return parts.length > 0 ? parts.join(". ") : null;
  }

  return null;
}
