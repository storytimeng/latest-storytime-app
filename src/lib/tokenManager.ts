import Cookies from "js-cookie";
import { useAuthStore } from "../stores/useAuthStore";

// Singleton: prevent concurrent refresh races
let _refreshPromise: Promise<{ token?: string; refreshToken?: string } | null> | null = null;

const AUTH_TOKEN_KEY = "authToken";
const TOKEN_EXPIRY_KEY = "tokenExpiry";

// Refresh token 5 minutes before it expires
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

/**
 * Check if token is expired or will expire soon
 */
export function isTokenExpired(): boolean {
  const token =
    useAuthStore.getState().token || Cookies.get(AUTH_TOKEN_KEY);
  const expiryStr = Cookies.get(TOKEN_EXPIRY_KEY);

  if (expiryStr) {
    const expiry = parseInt(expiryStr, 10);
    const now = Date.now();
    return now >= expiry - REFRESH_BUFFER_MS;
  }

  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1])) as { exp?: number };
        if (payload.exp) {
          return Date.now() >= payload.exp * 1000 - REFRESH_BUFFER_MS;
        }
      }
    } catch {
      return true;
    }
  }

  return true;
}

/**
 * Check if we should proactively refresh the token
 */
export function shouldRefreshToken(): boolean {
  const token = useAuthStore.getState().token || Cookies.get(AUTH_TOKEN_KEY);
  if (!token) return false;

  return isTokenExpired();
}

/**
 * Attempt to refresh tokens. Deduplicated: concurrent callers share one in-flight request.
 */
export async function refreshTokens(): Promise<{
  token?: string;
  refreshToken?: string;
} | null> {
  if (_refreshPromise) {
    return _refreshPromise;
  }

  _refreshPromise = _doRefresh().finally(() => {
    _refreshPromise = null;
  });
  return _refreshPromise;
}

async function _doRefresh(): Promise<{
  token?: string;
  refreshToken?: string;
} | null> {
  try {
    // The httpOnly refresh token cookie is sent automatically by the browser.
    // We POST to /auth/refresh with credentials: 'include' so the cookie is included.
    // Use the same base URL logic as heyapi-runtime so proxy mode is respected.
    const baseUrl =
      process.env.NEXT_PUBLIC_PROXY === "true"
        ? "/api/proxy"
        : process.env.NEXT_PUBLIC_API_URL ||
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          "";

    const res = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include", // sends the httpOnly refreshToken cookie
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}), // body required by DTO validation; cookie carries the token
    });

    if (!res.ok) {
      console.error("Token refresh failed with status:", res.status);
      return null;
    }

    const json = await res.json();

    // Unwrap nested data structure: response.data.data
    let payload = json?.data ?? json;
    if (payload && typeof payload === "object" && "data" in payload) {
      payload = payload.data;
    }

    const token = payload?.accessToken;

    if (!token) {
      console.error("No access token in refresh response");
      return null;
    }

    // Store new access token; refresh token is managed server-side via httpOnly cookie
    useAuthStore.getState().setToken(token, undefined);

    return { token };
  } catch (e) {
    console.error("❌ Token refresh failed", e);
    return null;
  }
}

/**
 * Proactively refresh token if it's expired or expiring soon
 * Returns the current valid token or a newly refreshed one
 */
export async function ensureValidToken(): Promise<string | null> {
  const currentToken =
    useAuthStore.getState().token || Cookies.get(AUTH_TOKEN_KEY);

  if (!currentToken) {
    // No access token — attempt silent refresh using the httpOnly cookie
    // (browser sends it automatically with credentials: 'include')
    const result = await refreshTokens();
    return result?.token ?? null;
  }

  // Check if token needs refresh
  if (!shouldRefreshToken()) {
    return currentToken;
  }

  console.log(
    "[ensureValidToken] Token expired or expiring soon, refreshing...",
  );
  const result = await refreshTokens();

  if (result?.token) {
    console.log("[ensureValidToken] ✅ Token refreshed proactively");
    return result.token;
  }

  console.error("[ensureValidToken] ❌ Failed to refresh token");
  return null;
}
