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

  // Interceptor: on 401 try refresh once, then retry the original request
  let isRefreshing = false;
  let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  client.interceptors.error.use(async (error: any, response: Response) => {
    const originalRequest = (response as any)?._retry;
    
    try {
      if (response?.status === 401 && !originalRequest) {
        if (isRefreshing) {
          // Wait for the current refresh to complete
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            // Retry original request with new token
            return error;
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        (response as any)._retry = true;
        isRefreshing = true;

        const refreshed = await refreshTokens();
        
        if (refreshed?.token) {
          // Update client config with new token
          client.setConfig({ auth: async () => refreshed.token });
          processQueue(null, refreshed.token);
          isRefreshing = false;
          
          // Return error to trigger SWR revalidation
          // SWR will automatically retry the request with the new token
          return error;
        } else {
          processQueue(new Error('Token refresh failed'), null);
          isRefreshing = false;
          // Clear auth and redirect to login
          if (typeof window !== 'undefined') {
            const { clearAuth } = await import('./stores/useAuthStore');
            clearAuth();
            window.location.href = '/auth/login';
          }
        }
      }
    } catch (e) {
      isRefreshing = false;
      processQueue(e, null);
    }
    return error;
  });

  console.log("✅ HeyAPI client initialized successfully");
} catch (e) {
  console.error("❌ Failed to initialize API client:", e);
}
