"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SWRConfig } from "swr";
import Cookies from "js-cookie";
import { ToastProvider } from "@heroui/toast";

// Hey-API client setup (runs immediately)
import "../src/setup";
import { getAuthToken } from "../src/stores/useAuthStore";

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

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <ToastProvider placement="top-center" />
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
