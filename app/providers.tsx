"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SWRConfig } from "swr";
import Cookies from "js-cookie";
import { ToastProvider } from "@heroui/toast";
import { AuthModal } from "@/components/reusables/modals/AuthModal";
import { AuthGuard } from "@/components/AuthGuard";

// Hey-API client setup (runs immediately)
import "../src/setup";
import { getAuthToken } from "../src/stores/useAuthStore";
import {
  hydrateAuthFromCookies,
  prepareAuthSession,
} from "../src/lib/authSession";
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

  React.useEffect(() => {
    hydrateAuthFromCookies();
  }, []);

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <ToastProvider placement="top-center" />
        <AuthGuard />
        <AuthModal />
        <SWRConfig
          value={{
            fetcher: async (resource: string, init?: RequestInit) => {
              const headers = new Headers(init?.headers);
              const token =
                (await prepareAuthSession()) ||
                getAuthToken() ||
                Cookies.get("authToken");
              if (token) headers.set("Authorization", `Bearer ${token}`);
              const res = await fetch(resource, { ...init, headers });
              if (!res.ok) {
                if (res.status === 401) {
                  const refreshed = await refreshTokens();
                  if (refreshed?.token) {
                    headers.set("Authorization", `Bearer ${refreshed.token}`);
                    const retryRes = await fetch(resource, {
                      ...init,
                      headers,
                    });
                    if (retryRes.ok) {
                      const retryType =
                        retryRes.headers.get("content-type") || "";
                      if (retryType.includes("application/json")) {
                        return retryRes.json();
                      }
                      return retryRes.text();
                    }
                  }
                }

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
