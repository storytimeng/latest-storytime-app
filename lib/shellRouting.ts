import { DESKTOP_ROUTES } from "@/config/desktopRoutes";
import { ROUTES } from "@/config/routes";

/** Explicit shell choice; `auto` follows viewport on post-auth redirects only. */
export type ShellPreference = "desktop" | "mobile" | "auto";

export const SHELL_PREFERENCE_COOKIE = "storytime-shell-preference";

const DESKTOP_HOME = DESKTOP_ROUTES.home;
const MOBILE_HOME = ROUTES.home;

export function parseShellPreference(
  value: string | null | undefined,
): ShellPreference {
  if (value === "desktop" || value === "mobile") {
    return value;
  }
  return "auto";
}

export function isWideViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 768px)").matches;
}

export function readShellPreferenceClient(): ShellPreference {
  if (typeof document === "undefined") return "auto";
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${SHELL_PREFERENCE_COOKIE}=([^;]*)`),
  );
  return parseShellPreference(match?.[1] ? decodeURIComponent(match[1]) : null);
}

export function writeShellPreferenceClient(preference: ShellPreference): void {
  if (typeof document === "undefined") return;
  if (preference === "auto") {
    document.cookie = `${SHELL_PREFERENCE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }
  document.cookie = `${SHELL_PREFERENCE_COOKIE}=${preference}; path=/; max-age=31536000; SameSite=Lax`;
}

/**
 * Default home after auth/setup/onboarding completion.
 * Respects explicit shell cookie, current /app path, then viewport width.
 */
export function getPostAuthHomePath(options?: {
  shellPreference?: ShellPreference;
  pathname?: string;
}): string {
  const preference = options?.shellPreference ?? readShellPreferenceClient();
  const pathname =
    options?.pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "");

  if (preference === "desktop") return DESKTOP_HOME;
  if (preference === "mobile") return MOBILE_HOME;
  if (pathname.startsWith("/app")) return DESKTOP_HOME;
  if (isWideViewport()) return DESKTOP_HOME;
  return MOBILE_HOME;
}

export function premiumPathForShell(shell: "desktop" | "mobile"): string {
  return shell === "desktop" ? DESKTOP_ROUTES.premium : ROUTES.premium;
}
