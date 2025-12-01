import Cookies from "js-cookie";
import { useAuthStore } from "../stores/useAuthStore";
import { authControllerRefresh } from "../client/sdk.gen";

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

    console.log("✅ Tokens refreshed successfully");
    return { token, refreshToken };
  } catch (e) {
    console.error("❌ Token refresh failed", e);
    return null;
  }
}
