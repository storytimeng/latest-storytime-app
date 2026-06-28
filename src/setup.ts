import Cookies from "js-cookie";
import { client } from "./client/client.gen";
import { createClientConfig } from "./heyapi-runtime";
import { getAuthToken } from "./stores/useAuthStore";
import { isAuthExemptPath, hasAuthSession } from "@/src/lib/authSession";
import {
  refreshTokens,
  ensureValidToken,
  isTokenExpired,
} from "./lib/tokenManager";
import { setupApiInterceptor } from "@/lib/offline/apiInterceptor";

// Initialize HeyAPI client config immediately
try {
  const config = createClientConfig();
  console.log("🔧 Initializing HeyAPI client with config:", config);
  client.setConfig(config);

  // Initialize offline interceptor
  if (typeof window !== "undefined") {
    setupApiInterceptor(client);
  }

  // Set auth callback with proactive token refresh
  client.setConfig({
    auth: async () => {
      // Ensure token is valid before making request (proactive refresh)
      const validToken = await ensureValidToken();
      if (validToken) return validToken;

      // Only use the stored token if it is NOT expired - never send a known-bad token
      const rawToken = getAuthToken() || Cookies.get("authToken");
      if (rawToken && !isTokenExpired()) return rawToken;

      return undefined;
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
      // Skip token refresh for auth endpoints - these should return 401 normally for bad credentials
      const url = new URL(response.url);
      const isAuthEndpoint = url.pathname.includes("/auth");

      if (isAuthEndpoint) {
        console.log("[Interceptor] 401 from auth endpoint, skipping refresh");
        return response;
      }

      if (!hasAuthSession() && !Cookies.get("refreshToken")) {
        console.log("[Interceptor] 401 for anonymous user, skipping refresh");
        return response;
      }

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
            "[Interceptor] 401 but not a token error, passing through",
          );
          return response;
        }

        console.log("[Interceptor] Token error detected:", errorData.message);
      } catch (e) {
        // If we can't parse the response, assume it's a token error
        console.log(
          "[Interceptor] Could not parse 401 response, assuming token error",
        );
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        console.log(
          "[Interceptor] Token refresh in progress, queuing request...",
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
                  body: opts.body != null
                    ? typeof opts.body === "string"
                      ? opts.body
                      : JSON.stringify(opts.body)
                    : undefined,
                  credentials: opts.credentials || "include",
                };
                // Ensure Content-Type is set when we have a JSON body
                if (opts.body != null) {
                  (retryOpts.headers as Headers).set("Content-Type", "application/json");
                }

                // Update Authorization header
                if (newToken) {
                  (retryOpts.headers as Headers).set(
                    "Authorization",
                    `Bearer ${newToken}`,
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
            "[Interceptor] ✅ Token refreshed successfully, retrying original request...",
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
            body: opts.body != null
              ? typeof opts.body === "string"
                ? opts.body
                : JSON.stringify(opts.body)
              : undefined,
            credentials: opts.credentials || "include",
          };

          // Ensure Content-Type is set when we have a JSON body
          if (opts.body != null) {
            (retryOpts.headers as Headers).set("Content-Type", "application/json");
          }

          (retryOpts.headers as Headers).set(
            "Authorization",
            `Bearer ${refreshResult.token}`,
          );

          console.log(
            "[Interceptor] Retrying original request with new token...",
          );
          const retryResponse = await fetch(response.url, retryOpts);

          isRefreshing = false;

          // Return the successful response to SWR (success or failure from retry)
          console.log(
            "[Interceptor] ✅ Request retry completed:",
            retryResponse.status,
          );
          return retryResponse;
        } else {
          // Refresh failed, clear auth and redirect to login
          console.error(
            "[Interceptor] ❌ Token refresh failed, clearing auth...",
          );
          processQueue(new Error("Token refresh failed"));
          isRefreshing = false;

          const onPaymentReturn =
            typeof window !== "undefined" &&
            isAuthExemptPath(window.location.pathname);
          const hadSession =
            hasAuthSession() || Boolean(Cookies.get("refreshToken"));

          if (!onPaymentReturn && hadSession) {
            const { clearAuth } = await import("./stores/useAuthStore");
            clearAuth();
          }

          return response;
        }
      } catch (error) {
        console.error("[Interceptor] ❌ Error during token refresh:", error);
        processQueue(error);
        isRefreshing = false;

        const onPaymentReturn =
          typeof window !== "undefined" &&
          isAuthExemptPath(window.location.pathname);
        const hadSession =
          hasAuthSession() || Boolean(Cookies.get("refreshToken"));

        if (!onPaymentReturn && hadSession) {
          const { clearAuth } = await import("./stores/useAuthStore");
          clearAuth();
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
