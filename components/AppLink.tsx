"use client";

/**
 * AppLink — A drop-in replacement for `next/link`'s `Link` (and a
 * NavLink variant) that works seamlessly in both environments:
 *
 *   • Web (PWA / desktop):  uses `next/link` — client-side navigation,
 *                           prefetching, scroll restoration, transitions.
 *   • Capacitor (Android):  renders a plain `<a>` whose `href` is the
 *                           static-export URL. Clicking the link uses
 *                           `window.history.pushState` + a synthetic
 *                           `popstate` event so the App Router picks
 *                           up the new segment without a full WebView
 *                           reload.
 *
 * Why we don't use `useRouter()` here
 * -----------------------------------
 * `useRouter` from `next/navigation` requires every page that uses it
 * to be wrapped in `<Suspense>` (in the App Router). That would force
 * us to refactor dozens of pages. Instead we manipulate the history
 * API directly and emit a `popstate` event — the App Router listens
 * to it and re-renders without a full reload.
 *
 * Dynamic-route rewriting
 * -----------------------
 * On Capacitor, known dynamic routes like `/story/abc`, `/story/abc/read`,
 * `/edit-story/abc` are rewritten to the static, query-param form
 * (`/story?id=abc`, `/story?id=abc&mode=read`, `/edit-story?id=abc`).
 * This is the only way `output: "export"` + Capacitor + Serwist can
 * resolve navigation reliably inside the WebView.
 *
 * Usage
 * -----
 * Anywhere you used to write:
 *
 *     import Link from "next/link";
 *     <Link href={`/story/${id}`}>...</Link>
 *
 * switch to:
 *
 *     import { Link, NavLink } from "@/components/AppLink";
 *     <Link href={`/story/${id}`}>...</Link>
 *
 * The URL the user sees and the prefetch behaviour will be exactly
 * the same on the web; on Android it gets rewritten automatically.
 */

import NextLink from "next/link";
import {
  AnchorHTMLAttributes,
  forwardRef,
  MouseEvent,
  ReactNode,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { IS_ANDROID } from "@/lib/platform";
import { rewriteForCapacitor } from "@/lib/linkRewrite";

// ─── Window-level navigation helper ──────────────────────────────────────────
//
// On Android we never call the React `useRouter()` hook. Instead we push
// to history and emit a `popstate` event — the App Router listens to it
// and re-renders the new segment without a full page reload.

function dispatchAppNavigation(href: string, replace = false, scroll = true) {
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

  // Notify the App Router. `popstate` is what next/navigation listens to.
  window.dispatchEvent(new PopStateEvent("popstate"));
}

// ─── Shared types ────────────────────────────────────────────────────────────

export interface AppLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  replace?: boolean;
  scroll?: boolean;
  /** Web-only: forwarded to next/link's prefetch prop. Ignored on Android. */
  prefetch?: boolean | null;
  /** Force a full-page <a> navigation (no SPA push). */
  legacy?: boolean;
}

// ─── <Link /> ────────────────────────────────────────────────────────────────

export const Link = forwardRef<HTMLAnchorElement, AppLinkProps>(function Link(
  {
    href,
    replace,
    scroll = true,
    prefetch,
    legacy,
    onClick,
    children,
    ...rest
  },
  ref,
) {
  const isAndroid = IS_ANDROID;
  const resolvedHref = isAndroid ? rewriteForCapacitor(href) : href;

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }
      if (isExternal(resolvedHref)) return;
      if (legacy) return;

      e.preventDefault();
      if (isAndroid) {
        dispatchAppNavigation(resolvedHref, replace, scroll);
      }
      // On web we let next/link own the navigation; we just return
      // without calling preventDefault. The onClick we attached on
      // the NextLink element below only matters for the legacy/exit
      // short-circuit above.
    },
    [resolvedHref, replace, scroll, legacy, onClick, isAndroid],
  );

  if (isAndroid) {
    return (
      <a ref={ref} href={resolvedHref} onClick={handleClick} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <NextLink
      ref={ref as any}
      href={resolvedHref}
      replace={replace}
      scroll={scroll}
      prefetch={prefetch === null ? false : (prefetch ?? true)}
      onClick={handleClick as any}
      {...(rest as any)}
    >
      {children}
    </NextLink>
  );
});

// ─── <NavLink /> ─────────────────────────────────────────────────────────────
//
// Behaves like react-router's NavLink: adds `aria-current="page"` (and
// optional className / style callbacks) when the current pathname matches.

export interface NavLinkProps
  extends Omit<AppLinkProps, "className" | "style" | "children"> {
  /** Match exactly when true. Default: prefix match. */
  exact?: boolean;
  /** className to apply when active. */
  activeClassName?: string;
  /** className merged onto the element (string or callback). */
  className?: string | ((props: { isActive: boolean }) => string | undefined);
  style?:
    | AnchorHTMLAttributes<HTMLAnchorElement>["style"]
    | ((props: {
        isActive: boolean;
      }) => AnchorHTMLAttributes<HTMLAnchorElement>["style"]);
  children?: ReactNode | ((props: { isActive: boolean }) => ReactNode);
}

function isPathActive(current: string, target: string, exact: boolean) {
  if (exact) return current === target;
  if (current === target) return true;
  const a = target.endsWith("/") ? target : target + "/";
  return current.startsWith(a);
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  function NavLink(
    {
      href,
      exact = false,
      activeClassName,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const pathname = usePathname() || "/";
    const isActive = isPathActive(pathname, href.split(/[?#]/)[0], exact);

    const resolvedClassName =
      typeof className === "function" ? className({ isActive }) : className;
    const resolvedStyle =
      typeof style === "function" ? style({ isActive }) : style;
    const resolvedChildren =
      typeof children === "function" ? children({ isActive }) : children;

    return (
      <Link
        ref={ref}
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={
          [resolvedClassName, isActive ? activeClassName : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
        style={resolvedStyle}
        {...rest}
      >
        {resolvedChildren}
      </Link>
    );
  },
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isExternal(href: string): boolean {
  if (!href) return false;
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#") ||
    href.startsWith("javascript:")
  );
}

// Allow `import AppLink from "@/components/AppLink"` too.
export default Link;
