import Cookies from "js-cookie";
import { client } from "./client/client.gen";
import { createClientConfig } from "./heyapi-runtime";
import { getAuthToken } from "./stores/useAuthStore";
import { refreshTokens } from "./lib/tokenManager";

// Initialize HeyAPI client config immediately
try {
  const config = createClientConfig();
  console.log("🔧 Initializing HeyAPI client with config:", config);
  client.setConfig(config);

  // Set auth callback so generated client can resolve auth tokens
  client.setConfig({
    auth: async (auth) => {
      // prefer in-memory/store token, fallback to cookie
      const token = getAuthToken() || Cookies.get("authToken");
      return token;
    },
  });

  // Response Interceptor: Automatically refresh token on 401 and retry request
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
    opts: any;
  }> = [];

  const processQueue = (error: any = null) => {
    failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });
    failedQueue = [];
  };

  client.interceptors.response.use(async (response: Response, opts: any) => {
    // If response is OK, return it as-is
    if (response.ok) {
      return response;
    }

    // Check if it's a 401 Unauthorized error
    if (response.status === 401) {
      console.log("[Interceptor] 401 detected, attempting token refresh...");

      // Clone the response to read the body (since it can only be read once)
      const clonedResponse = response.clone();

      try {
        const errorData = await clonedResponse.json();

        // Check if it's specifically a token expiration error
        const isTokenError =
          errorData?.message?.toLowerCase().includes("token") ||
          errorData?.error?.toLowerCase().includes("unauthorized") ||
          errorData?.statusCode === 401;

        if (!isTokenError) {
          console.log(
            "[Interceptor] 401 but not a token error, passing through"
          );
          return response;
        }

        console.log("[Interceptor] Token error detected:", errorData.message);
      } catch (e) {
        // If we can't parse the response, assume it's a token error
        console.log(
          "[Interceptor] Could not parse 401 response, assuming token error"
        );
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        console.log(
          "[Interceptor] Token refresh in progress, queuing request..."
        );
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: async () => {
              try {
                // Retry the original request with new token
                const newToken = getAuthToken() || Cookies.get("authToken");
                const retryOpts: RequestInit = {
                  method: opts.method,
                  headers: new Headers(opts.headers),
                  body: opts.body,
                  credentials: opts.credentials || "include",
                };

                // Update Authorization header
                if (newToken) {
                  (retryOpts.headers as Headers).set(
                    "Authorization",
                    `Bearer ${newToken}`
                  );
                }

                console.log("[Interceptor] Retrying queued request...");
                const retryResponse = await fetch(response.url, retryOpts);
                resolve(retryResponse);
              } catch (error) {
                reject(error);
              }
            },
            reject,
            opts,
          });
        });
      }

      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const refreshResult = await refreshTokens();

        if (refreshResult && refreshResult.token) {
          console.log(
            "[Interceptor] ✅ Token refreshed successfully, retrying original request..."
          );

          // Update client auth config
          client.setConfig({
            auth: async () => refreshResult.token,
          });

          // Process all queued requests
          processQueue();

          // Retry the original request with the new token
          const retryOpts: RequestInit = {
            method: opts.method,
            headers: new Headers(opts.headers),
            body: opts.body,
            credentials: opts.credentials || "include",
          };

          (retryOpts.headers as Headers).set(
            "Authorization",
            `Bearer ${refreshResult.token}`
          );

          console.log(
            "[Interceptor] Retrying original request with new token..."
          );
          const retryResponse = await fetch(response.url, retryOpts);

          isRefreshing = false;
          console.log(
            "[Interceptor] ✅ Request retry completed:",
            retryResponse.status
          );
          return retryResponse;
        } else {
          // Refresh failed, clear auth and redirect to login
          console.error(
            "[Interceptor] ❌ Token refresh failed, clearing auth..."
          );
          processQueue(new Error("Token refresh failed"));
          isRefreshing = false;

          // Clear auth state
          const { clearAuth } = await import("./stores/useAuthStore");
          clearAuth();

          // Redirect to login if we're in a browser environment
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }

          return response;
        }
      } catch (error) {
        console.error("[Interceptor] ❌ Error during token refresh:", error);
        processQueue(error);
        isRefreshing = false;

        // Clear auth and redirect
        const { clearAuth } = await import("./stores/useAuthStore");
        clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }

        return response;
      }
    }

    // For non-401 errors, return response as-is
    return response;
  });

  console.log("✅ HeyAPI client initialized with auto-refresh interceptor");
} catch (e) {
  console.error("❌ Failed to initialize API client:", e);
}
