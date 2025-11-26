import type { CreateClientConfig } from "./client/client.gen";
import Cookies from "js-cookie";
import { getAuthToken } from "./stores/useAuthStore";

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl:
    process.env.NEXT_PUBLIC_PROXY === "true"
      ? "/api/proxy"
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  fetch: async (input, init) => {
    // Prefer token from in-memory store, fallback to cookie
    const token =
      (typeof getAuthToken === "function" ? getAuthToken() : undefined) ||
      Cookies.get("authToken");
    const headers = new Headers(init?.headers);
    if (token)
      headers.set(
        "Authorization",
        `${token.startsWith("Bearer") ? token : `Bearer ${token}`}`
      );
    return fetch(input, { ...init, headers });
  },
});
