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
const REMEMBER_ME_KEY = "rememberMe";
const PERSISTENT_LOGIN_DAYS = 30;

function baseCookieOptions() {
  return {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };
}

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

export function getRememberMePreference(): boolean {
  if (typeof window === "undefined") return false;
  return Cookies.get(REMEMBER_ME_KEY) === "true";
}

export function setRememberMePreference(remember: boolean): void {
  if (typeof window === "undefined") return;

  const base = baseCookieOptions();
  if (remember) {
    Cookies.set(REMEMBER_ME_KEY, "true", {
      ...base,
      expires: PERSISTENT_LOGIN_DAYS,
    });
    return;
  }

  Cookies.remove(REMEMBER_ME_KEY);
}

function getStorageCookieOptions(token?: string): Cookies.CookieAttributes {
  const base = baseCookieOptions();

  if (!getRememberMePreference()) {
    // Session cookie — cleared when the browser closes
    return base;
  }

  if (token) {
    const jwtExpiry = decodeTokenExpiry(token);
    if (jwtExpiry) {
      return { ...base, expires: new Date(jwtExpiry) };
    }
  }

  return { ...base, expires: PERSISTENT_LOGIN_DAYS };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token:
    typeof window !== "undefined" ? Cookies.get(AUTH_TOKEN_KEY) : undefined,
  refreshToken:
    typeof window !== "undefined" ? Cookies.get(REFRESH_TOKEN_KEY) : undefined,
  resetEmail: undefined,
  resetOtp: undefined,
  setToken: (token, refreshToken) => {
    if (token) {
      Cookies.set(AUTH_TOKEN_KEY, token, getStorageCookieOptions(token));

      const expiry = decodeTokenExpiry(token);
      if (expiry) {
        Cookies.set(
          TOKEN_EXPIRY_KEY,
          expiry.toString(),
          getStorageCookieOptions(token),
        );
      }
    } else {
      Cookies.remove(AUTH_TOKEN_KEY);
      Cookies.remove(TOKEN_EXPIRY_KEY);
    }

    if (refreshToken) {
      Cookies.set(
        REFRESH_TOKEN_KEY,
        refreshToken,
        getStorageCookieOptions(refreshToken),
      );
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
    Cookies.remove(REMEMBER_ME_KEY);
    set(() => ({ token: undefined, refreshToken: undefined }));
  },
  clearReset: () => set(() => ({ resetEmail: undefined, resetOtp: undefined })),
  isAuthenticated: () =>
    Boolean(
      get().token ||
        get().refreshToken ||
        (typeof window !== "undefined" &&
          (Cookies.get(AUTH_TOKEN_KEY) || Cookies.get(REFRESH_TOKEN_KEY))),
    ),
}));

export const getAuthToken = () => {
  return useAuthStore.getState().token || Cookies.get(AUTH_TOKEN_KEY);
};

export const getRefreshToken = () => {
  return useAuthStore.getState().refreshToken || Cookies.get(REFRESH_TOKEN_KEY);
};

export const setAuthToken = (token?: string, refreshToken?: string) => {
  useAuthStore.getState().setToken(token, refreshToken);
};

export const clearAuth = () => {
  useAuthStore.getState().clear();
};
