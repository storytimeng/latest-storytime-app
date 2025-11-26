import Cookies from "js-cookie";
import { useAuthStore } from "../stores/useAuthStore";

const AUTH_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";

/**
 * Attempt to refresh tokens by calling the refresh endpoint through the proxy.
 * You can adapt the refresh path to your backend implementation.
 */
export async function refreshTokens(): Promise<{
  token?: string;
  refreshToken?: string;
} | null> {
  try {
    // Use proxy so frontend doesn't reveal backend URL
    const res = await fetch("/api/proxy/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return null;

    const payload = await res.json();
    const token = payload?.token;
    const refreshToken = payload?.refreshToken;

    if (token) {
      // Persist via cookie and store
      Cookies.set(AUTH_TOKEN_KEY, token, { secure: true });
    }
    if (refreshToken) {
      Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { secure: true });
    }

    useAuthStore.getState().setToken(token, refreshToken);
    return { token, refreshToken };
  } catch (e) {
    console.error("Token refresh failed", e);
    return null;
  }
}
