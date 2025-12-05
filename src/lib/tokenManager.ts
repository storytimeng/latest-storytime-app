import Cookies from "js-cookie";
import { useAuthStore } from "../stores/useAuthStore";
import { authControllerRefresh } from "../client/sdk.gen";

const AUTH_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const TOKEN_EXPIRY_KEY = "tokenExpiry";

// Refresh token 5 minutes before it expires
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

/**
 * Decode JWT to get expiry time
 */
function decodeTokenExpiry(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch (e) {
    console.error("Failed to decode token:", e);
    return null;
  }
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
    const currentRefreshToken =
      useAuthStore.getState().refreshToken || Cookies.get(REFRESH_TOKEN_KEY);

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

    // Use the store's setToken method which handles both cookie and state
    useAuthStore.getState().setToken(token, refreshToken);

    // Store token expiry time
    const expiry = decodeTokenExpiry(token);
    if (expiry) {
      Cookies.set(TOKEN_EXPIRY_KEY, expiry.toString(), {
        secure: process.env.NODE_ENV === "production",
      });
      console.log("✅ Token expiry set:", new Date(expiry).toISOString());
    }

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
    console.log("[ensureValidToken] No token found");
    return null;
  }

  // Check if token needs refresh
  if (!shouldRefreshToken()) {
    console.log("[ensureValidToken] Token is still valid");
    return currentToken;
  }

  console.log(
    "[ensureValidToken] Token expired or expiring soon, refreshing..."
  );
  const result = await refreshTokens();

  if (result?.token) {
    console.log("[ensureValidToken] ✅ Token refreshed proactively");
    return result.token;
  }

  console.error("[ensureValidToken] ❌ Failed to refresh token");
  return null;
}
