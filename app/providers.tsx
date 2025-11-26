"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SWRConfig } from "swr";
import Cookies from "js-cookie";

// Hey-API client
import { client } from "../src/client/client.gen";
import { createClientConfig } from "../src/heyapi-runtime";
import { useAuthStore, getAuthToken } from "../src/stores/useAuthStore";
import { refreshTokens } from "../src/lib/tokenManager";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  // Initialize HeyAPI client config once on client-side
  React.useEffect(() => {
    try {
      client.setConfig(createClientConfig());

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
    } catch (e) {
      // ignore during SSR or early runs
      // console.warn('Failed to initialize API client', e);
    }
  }, []);

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <SWRConfig
          value={{
            fetcher: async (resource: string, init?: RequestInit) => {
              // use fetch and include auth header from cookie (client-side)
              const headers = new Headers(init?.headers);
              const token = getAuthToken() || Cookies.get("authToken");
              if (token) headers.set("Authorization", `Bearer ${token}`);
              const res = await fetch(resource, { ...init, headers });
              if (!res.ok) {
                const text = await res.text();
                const err = new Error(text || res.statusText);
                // @ts-ignore
                err.status = res.status;
                throw err;
              }
              const contentType = res.headers.get("content-type") || "";
              if (contentType.includes("application/json")) return res.json();
              return res.text();
            },
            shouldRetryOnError: false,
            revalidateOnFocus: false,
          }}
        >
          {children}
        </SWRConfig>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
