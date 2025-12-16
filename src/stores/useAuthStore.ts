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
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch (e) {
    console.error("Failed to decode token:", e);
    return null;
  }
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
      Cookies.set(AUTH_TOKEN_KEY, token, {
        secure: process.env.NODE_ENV === "production",
      });

      // Store token expiry
      const expiry = decodeTokenExpiry(token);
      if (expiry) {
        Cookies.set(TOKEN_EXPIRY_KEY, expiry.toString(), {
          secure: process.env.NODE_ENV === "production",
        });
        console.log("Token expiry set:", new Date(expiry).toISOString());
      }
    } else {
      Cookies.remove(AUTH_TOKEN_KEY);
      Cookies.remove(TOKEN_EXPIRY_KEY);
    }
    if (refreshToken) {
      Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
        secure: process.env.NODE_ENV === "production",
      });
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
  isAuthenticated: () => Boolean(get().token),
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
