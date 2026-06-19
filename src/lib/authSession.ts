import Cookies from "js-cookie";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { ensureValidToken } from "@/src/lib/tokenManager";

const AUTH_TOKEN_KEY = "authToken";

/** Routes that must not trigger the global login modal (e.g. Paystack return). */
export const AUTH_EXEMPT_PATH_PREFIXES = ["/auth", "/premium/callback"];

export function isAuthExemptPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return AUTH_EXEMPT_PATH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
}

export function getStoredAuthToken(): string | undefined {
  return useAuthStore.getState().token || Cookies.get(AUTH_TOKEN_KEY);
}

export function hasAuthSession(): boolean {
  return Boolean(getStoredAuthToken());
}

/** Sync Zustand auth state from cookies after external redirects (Paystack, etc.). */
export function hydrateAuthFromCookies(): void {
  if (typeof window === "undefined") return;

  const token = Cookies.get(AUTH_TOKEN_KEY);
  const refreshToken = Cookies.get("refreshToken");
  if (!token) return;

  const { token: storeToken } = useAuthStore.getState();
  if (storeToken !== token) {
    useAuthStore.getState().setToken(token, refreshToken);
  }
}

/** Restore a valid access token (refresh if needed) before protected API calls. */
export async function prepareAuthSession(): Promise<string | null> {
  hydrateAuthFromCookies();
  return ensureValidToken();
}
