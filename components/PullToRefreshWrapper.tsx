"use client";

/**
 * PullToRefreshWrapper
 * --------------------
 * Global, layout-level pull-to-refresh for the Capacitor (Android) build.
 *
 * Mounted once by `app/layout.tsx` around the page tree. On non-Android
 * platforms (web) it renders children untouched so scrolling and gestures
 * stay native.
 *
 * Refresh strategy:
 *   1. Mutate every SWR cache (revalidate all active queries). The bulk of
 *      pages in this app source data through SWR, so this re-fetches the
 *      current screen with no visible state change.
 *   2. If the mutation throws (network error etc.) fall back to a soft
 *      reload — `router.refresh()` for App Router data + a `window.location`
 *      reload as a last resort so the user always gets fresh content.
 *
 * Implementation notes:
 *   - We render `<PullToRefresh>` only on Capacitor (`@/lib/platform`
 *     `IS_ANDROID`). On web, the pull-to-refresh gesture conflicts with
 *     normal scrolling and adds a "draggable" feel that users find annoying.
 *   - The wrapper does *not* surround fixed-position overlays (navbar,
 *     offline banner, toasts, modal layers). Those live outside this
 *     wrapper in the layout, so they stay pinned while content scrolls.
 *   - The default refresh icon is a HeroUI `Spinner` for visual continuity
 *     with the rest of the app's loading affordances.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { Spinner } from "@heroui/spinner";
import PullToRefresh from "react-simple-pull-to-refresh";

import { IS_ANDROID } from "@/lib/platform";

export interface PullToRefreshWrapperProps {
  // react-simple-pull-to-refresh types its `children` as `React.ReactElement`
  // (it clones and wraps it with drag handlers), so we keep this narrow.
  children: React.ReactElement;
}

const RefreshingIndicator = () => (
  <div
    className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-default-600"
    role="status"
    aria-live="polite"
  >
    <Spinner size="sm" />
    <span>Refreshing…</span>
  </div>
);

export function PullToRefreshWrapper({ children }: PullToRefreshWrapperProps) {
  const { mutate } = useSWRConfig();
  const router = useRouter();

  // Pull-to-refresh is mobile-only. On web, render children as-is so
  // scrolling keeps its native feel and listeners don't intercept events.
  if (!IS_ANDROID) {
    return <>{children}</>;
  }

  const handleRefresh = async (): Promise<void> => {
    try {
      // 1. Revalidate every active SWR cache. This re-fetches with no
      //    optimistic update so the user sees the spinner until fresh data
      //    lands. `revalidate: true` is the default; left explicit for
      //    readability.
      await mutate(() => true, undefined, { revalidate: true });

      // 2. Tell App Router to re-read any server data for the current route.
      //    (Cache components, RSC payloads, etc.) This is cheap and
      //    complements the SWR revalidation above.
      router.refresh();
    } catch (err) {
      // SWR mutate itself doesn't throw on individual fetch failures —
      // each fetcher resolves/rejects independently. So a true throw here
      // means something deeper is broken (e.g. SWR context unavailable).
      // Fall back to a hard reload so the user isn't stuck with stale UI.
      // eslint-disable-next-line no-console
      console.warn(
        "[PullToRefresh] SWR mutate failed, falling back to hard reload:",
        err,
      );
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  };

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      // isPullable default is false; enable it explicitly.
      isPullable
      // The lib's default 67px / 95px thresholds are good for our design
      // — we don't override them.
      refreshingContent={<RefreshingIndicator />}
      pullingContent={<RefreshingIndicator />}
      // `resistance` controls the perceived "weight" of the pull (1 = 1:1).
      // Slightly heavier than default so accidental triggers are less
      // likely on the small viewport.
      resistance={1.7}
    >
      {children}
    </PullToRefresh>
  );
}

export default PullToRefreshWrapper;
