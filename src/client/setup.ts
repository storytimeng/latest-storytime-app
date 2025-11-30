import Cookies from "js-cookie";
import { client } from "./client.gen";
import { createClientConfig } from "../heyapi-runtime";
import { getAuthToken } from "../stores/useAuthStore";
import { refreshTokens } from "../lib/tokenManager";

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

  // Interceptor: on 401 try refresh once, then reload page or let store be cleared
  client.interceptors.error.use(async (error: any, response: Response) => {
    try {
      if (response?.status === 401) {
        const refreshed = await refreshTokens();
        if (refreshed?.token) {
          // tell client to use new token for subsequent requests
          client.setConfig({ auth: async () => refreshed.token });
          return error; // original request will still fail; callers can retry via SWR mutate
        }
      }
    } catch (e) {
      // noop
    }
    return error;
  });

  console.log("✅ HeyAPI client initialized successfully");
} catch (e) {
  console.error("❌ Failed to initialize API client:", e);
}
