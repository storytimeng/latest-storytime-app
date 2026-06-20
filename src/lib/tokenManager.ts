import Cookies from "js-cookie";
import { useAuthStore } from "../stores/useAuthStore";
import { authControllerRefresh } from "../client/sdk.gen";

const AUTH_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const TOKEN_EXPIRY_KEY = "tokenExpiry";

// Refresh token 5 minutes before it expires
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

function getStoredRefreshToken(): string | undefined {
  return useAuthStore.getState().refreshToken || Cookies.get(REFRESH_TOKEN_KEY);
}

/**
 * Check if token is expired or will expire soon
 */
export function isTokenExpired(): boolean {
  const expiryStr = Cookies.get(TOKEN_EXPIRY_KEY);
  if (!expiryStr) return true;

  const expiry = parseInt(expiryStr, 10);
  const now = Date.now();

  // Consider expired if within buffer time
  return now >= expiry - REFRESH_BUFFER_MS;
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
 * Attempt to refresh tokens by calling the refresh endpoint through the proxy.
 * You can adapt the refresh path to your backend implementation.
 */
export async function refreshTokens(): Promise<{
  token?: string;
  refreshToken?: string;
} | null> {
  try {
    const currentRefreshToken = getStoredRefreshToken();

    if (!currentRefreshToken) {
      console.error("No refresh token available");
      return null;
    }

    // Use proxy so frontend doesn't reveal backend URL
    const res = await authControllerRefresh({
      body: {
        refreshToken: currentRefreshToken,
      },
    });

    if (!res.data) {
      console.error("No data in refresh response");
      return null;
    }

    // Unwrap nested data structure: response.data.data
    let payload = res.data;
    if (payload && typeof payload === "object" && "data" in payload) {
      payload = (payload as any).data;
    }

    const token = payload?.accessToken;
    const refreshToken = payload?.refreshToken;

    console.log("🔍 Refresh response payload:", {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
    });

    if (!token) {
      console.error("No access token in refresh response");
      return null;
    }

    // setToken persists cookies using the current "keep me logged in" preference
    useAuthStore.getState().setToken(token, refreshToken);

    console.log("✅ Tokens refreshed successfully");
    return { token, refreshToken };
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
    if (getStoredRefreshToken()) {
      console.log(
        "[ensureValidToken] Access token missing, refreshing from stored session...",
      );
      const result = await refreshTokens();
      return result?.token ?? null;
    }

    console.log("[ensureValidToken] No token found");
    return null;
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
