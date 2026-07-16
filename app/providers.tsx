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
import { showToast } from "@/lib/showNotification";

// Hey-API client setup (runs immediately)
import "../src/setup";
import { getAuthToken } from "../src/stores/useAuthStore";
import {
  hydrateAuthFromCookies,
  prepareAuthSession,
} from "../src/lib/authSession";
import { refreshTokens, isTokenExpired } from "../src/lib/tokenManager";

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

  // ── Capgo live updates ────────────────────────────────────────────────
  // Notify the native layer that the JS bundle booted OK, listen for update
  // lifecycle events so the user sees toast notifications, and retry failed
  // downloads after a delay. Only runs on Android/iOS native (not web/PWA).
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const cap = (
      window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }
    ).Capacitor;
    if (!cap?.isNativePlatform?.()) return;

    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    void import("@capgo/capacitor-updater")
      .then(({ CapacitorUpdater }) => {
        // ── Notify native that the JS bundle is alive ──
        CapacitorUpdater.notifyAppReady()
          .then(() => {
            // eslint-disable-next-line no-console
            console.log("[capgo] notifyAppReady ok");
          })
          .catch((err: unknown) => {
            // eslint-disable-next-line no-console
            console.warn("[capgo] notifyAppReady failed", err);
          });

        // ── Download started ──
        CapacitorUpdater.addListener("download", (event) => {
          if (event.percent === 0) {
            showToast({
              type: "info",
              message: "📥 Update downloading…",
              duration: 3000,
            });
          }
        });

        // ── Download complete → success toast ──
        CapacitorUpdater.addListener("downloadComplete", () => {
          showToast({
            type: "success",
            message: "✅ Update downloaded! Installing soon…",
            duration: 3000,
          });
        });

        // ── Download failed → error toast + retry after 30 s ──
        CapacitorUpdater.addListener("downloadFailed", () => {
          showToast({
            type: "error",
            message: "❌ Update download failed. Will retry shortly…",
            duration: 4000,
          });
          retryTimer = setTimeout(() => {
            CapacitorUpdater.triggerUpdateCheck().catch(() => {});
          }, 30_000);
        });

        // ── Update failed to install → error toast + retry next launch ──
        CapacitorUpdater.addListener("updateFailed", () => {
          showToast({
            type: "error",
            message: "⚠️ Update couldn't install. Will try again on next launch.",
            duration: 4000,
          });
        });

        // ── Bundle applied successfully → success toast ──
        CapacitorUpdater.addListener("set", (event) => {
          showToast({
            type: "success",
            message: `✨ Updated to v${event.bundle.version}!`,
            duration: 3000,
          });
        });

        // ── App ready after a reload → success toast ──
        CapacitorUpdater.addListener("appReady", (event) => {
          showToast({
            type: "success",
            message: `🚀 Running v${event.bundle.version}`,
            duration: 2500,
          });
        });
      })
      .catch((err: unknown) => {
        // eslint-disable-next-line no-console
        console.warn("[capgo] failed to load updater plugin", err);
      });

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      void import("@capgo/capacitor-updater").then(
        ({ CapacitorUpdater }) => CapacitorUpdater.removeAllListeners(),
        () => {},
      );
    };
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
              const validToken = await prepareAuthSession();
              const rawToken =
                !validToken && !isTokenExpired()
                  ? getAuthToken() || Cookies.get("authToken")
                  : null;
              const token = validToken || rawToken;
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
