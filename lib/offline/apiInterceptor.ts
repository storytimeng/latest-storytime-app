/**
 * API Client Interceptor
 * Transparently handles caching and offline queuing for the Hey-API client
 */

import { cacheApiResponse, getCachedResponse } from "./apiCache";
import { queueMutation } from "./syncQueue";

/**
 * Sets up interception on the provided API client
 * Handles transparent caching for GET and queuing for Mutations
 */
export function setupApiInterceptor(client: any) {
  if (client._isIntercepted) return;
  
  const originalRequest = client.request.bind(client);
  client._originalRequest = originalRequest; // Store for sync processor

  client.request = async (options: any) => {
    const isOnline = typeof window !== "undefined" ? navigator.onLine : true;
    const method = (options.method || "GET").toUpperCase();
    const url = options.url || "";
    const params = options.query || {};
    const isSyncRequest = !!options._isSyncRequest;
    
    // For browser environment, we try to get the userId from localStorage
    let userId = "";
    if (typeof window !== "undefined") {
        try {
            const authStorage = localStorage.getItem("auth-storage");
            if (authStorage) {
                const parsed = JSON.parse(authStorage);
                userId = parsed?.state?.user?.id || "";
            }
        } catch (e) {}
    }

    // --- HANDLE GET REQUESTS (Caching) ---
    if (method === "GET") {
      // 1. If offline, try cache first
      if (!isOnline) {
        const cached = await getCachedResponse(url, params);
        if (cached) {
          console.log(`[Offline] Serving cached data for: ${url}`);
          return { 
            data: cached, 
            response: { ok: true, status: 200, statusText: "OK (Cached)" } as any 
          };
        }
      }

      // 2. Perform original request
      try {
        const result = await originalRequest(options);

        // 3. Cache successful responses
        if (result && !result.error && result.data) {
          // Determine TTL based on URL (matches SW logic)
          let ttl = 24 * 60 * 60 * 1000; // default 24h
          if (url.includes("/users/profile") || url.includes("/users/stats") || url.includes("/users/achievements")) {
             ttl = 365 * 24 * 60 * 60 * 1000;
          } else if (url.includes("/stories")) {
             ttl = 14 * 24 * 60 * 60 * 1000; // 2 weeks
          } else if (url.includes("/notifications")) {
             ttl = 5 * 60 * 1000; // 5 mins
          } else if (url.includes("/reading-history") || url.includes("/reading-progress")) {
             ttl = 60 * 60 * 1000; // 1 hour
          }

          cacheApiResponse(url, result.data, { ttl, userId, params });
        }

        return result;
      } catch (error) {
        // If request fails due to network, try cache as fallback
        if (!isOnline || (error instanceof Error && error.message.includes("network"))) {
            const cached = await getCachedResponse(url, params);
            if (cached) {
                return { 
                    data: cached, 
                    response: { ok: true, status: 200, statusText: "OK (Cached Fallback)" } as any 
                };
            }
        }
        throw error;
      }
    }

    // --- HANDLE MUTATIONS (POST, PUT, DELETE, PATCH) ---
    // If it's a sync request or online, perform the actual request
    if (isSyncRequest || isOnline) {
      return originalRequest(options);
    }

    // If offline and NOT a sync request, queue it
    console.log(`[Offline] Queuing mutation: ${method} ${url}`);
    
    let type: any = "other";
    if (url.includes("/profile")) type = "profile_update";
    else if (url.includes("/settings")) type = "setting_change";
    else if (url.includes("/drafts")) type = "draft_upload";

    const actionId = await queueMutation(type, { 
      url, 
      method, 
      body: options.body, 
      query: options.query,
      path: options.path,
      headers: options.headers
    });
    
    return { 
      data: { message: "Action queued offline", offline: true, actionId }, 
      response: { ok: true, status: 202, statusText: "Accepted (Offline Queue)" } as any 
    };
  };

  client._isIntercepted = true;
  console.log("✅ API Client Interceptor initialized");
}
