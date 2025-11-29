import {create} from "zustand";
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

export const useAuthStore = create<AuthState>((set, get) => ({
  token:
    typeof window !== "undefined" ? Cookies.get(AUTH_TOKEN_KEY) : undefined,
  refreshToken:
    typeof window !== "undefined" ? Cookies.get(REFRESH_TOKEN_KEY) : undefined,
  resetEmail: undefined,
  resetOtp: undefined,
  setToken: (token, refreshToken) => {
    console.log("useAuthStore.setToken called with:", token ? "Token present" : "No token");
    if (token) {
      Cookies.set(AUTH_TOKEN_KEY, token, { secure: process.env.NODE_ENV === "production" });
    } else {
      Cookies.remove(AUTH_TOKEN_KEY);
    }
    if (refreshToken) {
      Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { secure: process.env.NODE_ENV === "production" });
    }
    set(() => ({ token, refreshToken }));
  },
  setReset: (email?: string, otp?: string) => {
    set(() => ({ resetEmail: email, resetOtp: otp }));
  },
  clear: () => {
    Cookies.remove(AUTH_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
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
