"use client";

/**
 * useAppRouter — a platform-aware wrapper around the Next.js router
 * that avoids `useRouter()` (which would force every consumer to be
 * inside a `<Suspense>` boundary).
 *
 * On the web: a no-op shim — call sites that need the real router
 * should keep using `useRouter` from `next/navigation`. AppLink does
 * NOT use this hook.
 *
 * On Capacitor: every navigation goes through `window.history.pushState`
 * followed by a synthetic `popstate` event so the App Router picks up
 * the new segment without a full WebView reload.
 *
 * If you need push/replace/back/forward, use this hook. If you just
 * need a navigation link, prefer `<Link href="..." />` from
 * `@/components/AppLink`.
 */

import { useCallback, useEffect, useState } from "react";
import { IS_ANDROID } from "@/lib/platform";

export interface AppRouter {
  push: (href: string, opts?: { scroll?: boolean }) => void;
  replace: (href: string, opts?: { scroll?: boolean }) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  /** Current pathname (always available on client). */
  pathname: string;
}

function navigate(href: string, replace: boolean, scroll: boolean) {
  if (typeof window === "undefined") return;
  const url = new URL(href, window.location.origin);
  const target = url.pathname + url.search + url.hash;
  if (replace) {
    window.history.replaceState(window.history.state, "", target);
  } else {
    window.history.pushState(window.history.state, "", target);
  }
  if (scroll) {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function useAppRouter(): AppRouter {
  const isAndroid = IS_ANDROID;

  // Track pathname so consumers can react to it. We only need this on
  // Android — the App Router manages path state for us on the web.
  const [pathname, setPathname] = useState<string>(
    typeof window === "undefined" ? "/" : window.location.pathname,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", update);
    return () => {
      window.removeEventListener("popstate", update);
    };
  }, []);

  const push = useCallback(
    (href: string, opts?: { scroll?: boolean }) => {
      if (!isAndroid) {
        // Fall back to window.location for the web if useAppRouter is
        // ever called outside the App Router (shouldn't happen often).
        window.location.href = new URL(href, window.location.origin).toString();
        return;
      }
      navigate(href, false, opts?.scroll ?? true);
    },
    [isAndroid],
  );

  const replace = useCallback(
    (href: string, opts?: { scroll?: boolean }) => {
      if (!isAndroid) {
        window.location.replace(
          new URL(href, window.location.origin).toString(),
        );
        return;
      }
      navigate(href, true, opts?.scroll ?? true);
    },
    [isAndroid],
  );

  const back = useCallback(() => {
    window.history.back();
  }, []);

  const forward = useCallback(() => {
    window.history.forward();
  }, []);

  const refresh = useCallback(() => {
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  return { push, replace, back, forward, refresh, pathname };
}

export default useAppRouter;
