const DEFAULT_BACKEND_URL = "https://back.storytime.ng";

/**
 * Resolves the backend API base URL at runtime.
 * Checks `window.__STORYTIME_API_URL__` / `localStorage.storytime_api_url` first
 * so Capacitor / built bundles can target a different backend without rebuilding
 * or regenerating the OpenAPI client.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const winOverride = (window as unknown as { __STORYTIME_API_URL__?: string })
      .__STORYTIME_API_URL__;
    if (winOverride && typeof winOverride === "string") {
      return winOverride.replace(/\/+$/, "");
    }
    try {
      const lsOverride = window.localStorage?.getItem("storytime_api_url");
      if (lsOverride && lsOverride.trim()) {
        return lsOverride.trim().replace(/\/+$/, "");
      }
    } catch {
      // Ignore storage access errors
    }
  }

  if (process.env.NEXT_PUBLIC_PROXY === "true") {
    return "/api/proxy";
  }

  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    DEFAULT_BACKEND_URL
  ).replace(/\/+$/, "");
}
