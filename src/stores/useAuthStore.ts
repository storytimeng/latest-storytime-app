import { create } from "zustand";
import Cookies from "js-cookie";

export interface AuthState {
  token?: string;
  refreshToken?: string;
  // transient fields for password reset flow
  resetEmail?: string;
  resetOtp?: string;
  setToken: (token?: string, refreshToken?: string) => void;
  clear: () => void;
  setReset: (email?: string, otp?: string) => void;
  clearReset: () => void;
  isAuthenticated: () => boolean;
}

const AUTH_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const TOKEN_EXPIRY_KEY = "tokenExpiry";

/**
 * Decode JWT to get expiry time
 */
function decodeTokenExpiry(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch (e) {
    console.error("Failed to decode token:", e);
    return null;
  }
}

function cookieOptions(token?: string) {
  const expiry = token ? decodeTokenExpiry(token) : null;
  return {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    ...(expiry ? { expires: new Date(expiry) } : { expires: 7 }),
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token:
    typeof window !== "undefined" ? Cookies.get(AUTH_TOKEN_KEY) : undefined,
  refreshToken:
    typeof window !== "undefined" ? Cookies.get(REFRESH_TOKEN_KEY) : undefined,
  resetEmail: undefined,
  resetOtp: undefined,
  setToken: (token, refreshToken) => {
    console.log("useAuthStore.setToken called with:", {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
    });
    if (token) {
      Cookies.set(AUTH_TOKEN_KEY, token, cookieOptions(token));

      const expiry = decodeTokenExpiry(token);
      if (expiry) {
        Cookies.set(TOKEN_EXPIRY_KEY, expiry.toString(), cookieOptions(token));
        console.log("Token expiry set:", new Date(expiry).toISOString());
      }
    } else {
      Cookies.remove(AUTH_TOKEN_KEY);
      Cookies.remove(TOKEN_EXPIRY_KEY);
    }
    if (refreshToken) {
      Cookies.set(REFRESH_TOKEN_KEY, refreshToken, cookieOptions(refreshToken));
    } else {
      // Don't remove if not provided - keep existing refresh token
      // This handles cases where API only returns accessToken
    }
    set(() => ({ token, refreshToken: refreshToken || get().refreshToken }));
  },
  setReset: (email?: string, otp?: string) => {
    set(() => ({ resetEmail: email, resetOtp: otp }));
  },
  clear: () => {
    Cookies.remove(AUTH_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    Cookies.remove(TOKEN_EXPIRY_KEY);
    set(() => ({ token: undefined, refreshToken: undefined }));
  },
  clearReset: () => set(() => ({ resetEmail: undefined, resetOtp: undefined })),
  isAuthenticated: () =>
    Boolean(
      get().token ||
        (typeof window !== "undefined" && Cookies.get(AUTH_TOKEN_KEY)),
    ),
}));

export const getAuthToken = () => {
  return useAuthStore.getState().token || Cookies.get(AUTH_TOKEN_KEY);
};

export const setAuthToken = (token?: string, refreshToken?: string) => {
  useAuthStore.getState().setToken(token, refreshToken);
};

export const clearAuth = () => {
  useAuthStore.getState().clear();
};
