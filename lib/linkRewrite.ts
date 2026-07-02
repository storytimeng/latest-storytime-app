/**
 * linkRewrite — Convert dynamic-route hrefs to static, query-param
 * versions when running in the Capacitor (Android) build.
 *
 * The motivation is well documented in the accompanying Medium article
 * and in `lib/storyRoutes.ts`: with `output: "export"` Next.js bakes
 * exactly one HTML file per route (e.g. `out/story/[id]/index.html` for
 * `generateStaticParams` results, and a 404 for anything else). On a
 * WebView with no server, navigating to `/story/<new-id>` therefore
 * either 404s or hits the SPA shell that wasn't actually pre-rendered.
 *
 * The solution is to collapse every dynamic page into ONE static page
 * and read the variable part from `?id=...`. Serwist also benefits
 * because there is one stable URL pattern to cache.
 *
 * Add new rewrites here as you create more dynamic pages. Always prefer
 * the web URL as the canonical input so the same call site works in
 * both environments.
 */

const REWRITES: Array<{
  // Regex that matches the dynamic path. The first capture group is the id.
  pattern: RegExp;
  // Builder that turns the matched groups into a query-param URL.
  build: (id: string, search: string) => string;
}> = [
  {
    // /story/<id>/read?chapterId=...&episodeId=...
    pattern: /^\/story\/([^/?#]+)\/read(\/)?(\?.*)?(#.*)?$/,
    build: (id, rest) => {
      const params = new URLSearchParams();
      params.set("id", id);
      params.set("mode", "read");
      // Forward any extra params (chapterId, episodeId, etc.)
      const incoming = new URLSearchParams(rest.replace(/^\?/, ""));
      incoming.forEach((v, k) => {
        if (k !== "id" && k !== "mode") params.set(k, v);
      });
      return `/story?${params.toString()}`;
    },
  },
  {
    // /story/<id>
    pattern: /^\/story\/([^/?#]+)(\?.*)?(#.*)?$/,
    build: (id, rest) => {
      const params = new URLSearchParams();
      params.set("id", id);
      const incoming = new URLSearchParams(rest.replace(/^\?/, ""));
      incoming.forEach((v, k) => {
        if (k !== "id") params.set(k, v);
      });
      return `/story?${params.toString()}`;
    },
  },
  {
    // /edit-story/<id>
    pattern: /^\/edit-story\/([^/?#]+)(\?.*)?(#.*)?$/,
    build: (id, rest) => {
      const params = new URLSearchParams();
      params.set("id", id);
      const incoming = new URLSearchParams(rest.replace(/^\?/, ""));
      incoming.forEach((v, k) => {
        if (k !== "id") params.set(k, v);
      });
      return `/edit-story?${params.toString()}`;
    },
  },
  {
    // /category/<slug>  — already a static route with generateStaticParams,
    // but we still want the static, query-param version on Android so
    // unknown slugs don't 404.
    pattern: /^\/category\/([^/?#]+)(\?.*)?(#.*)?$/,
    build: (slug, rest) => {
      const params = new URLSearchParams();
      params.set("slug", slug);
      const incoming = new URLSearchParams(rest.replace(/^\?/, ""));
      incoming.forEach((v, k) => {
        if (k !== "slug") params.set(k, v);
      });
      return `/category?${params.toString()}`;
    },
  },
  {
    // /all-genres/<id> → /all-genres?id=...
    pattern: /^\/all-genres\/([^/?#]+)(\?.*)?(#.*)?$/,
    build: (id, rest) => {
      const params = new URLSearchParams();
      params.set("id", id);
      const incoming = new URLSearchParams(rest.replace(/^\?/, ""));
      incoming.forEach((v, k) => {
        if (k !== "id") params.set(k, v);
      });
      return `/all-genres?${params.toString()}`;
    },
  },
  {
    // /r/<slug> (referral redirect)
    pattern: /^\/r\/([^/?#]+)(\?.*)?(#.*)?$/,
    build: (slug, rest) => {
      const params = new URLSearchParams();
      params.set("slug", slug);
      const incoming = new URLSearchParams(rest.replace(/^\?/, ""));
      incoming.forEach((v, k) => {
        if (k !== "slug") params.set(k, v);
      });
      return `/r?${params.toString()}`;
    },
  },
];

/**
 * Rewrite a path to the static, query-param form. Returns the input
 * unchanged if no rule matches.
 */
export function rewriteForCapacitor(href: string): string {
  if (!href) return href;
  // Skip external links and non-path hrefs.
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#") ||
    href.startsWith("javascript:")
  ) {
    return href;
  }

  // Split off search/hash so the regex only matches the pathname.
  const hashIdx = href.indexOf("#");
  const searchIdx = href.indexOf("?");
  const pathEnd = Math.min(
    hashIdx === -1 ? href.length : hashIdx,
    searchIdx === -1 ? href.length : searchIdx,
  );
  const pathname = href.slice(0, pathEnd);
  const search = href.slice(pathEnd);

  for (const { pattern, build } of REWRITES) {
    const m = pathname.match(pattern);
    if (m) {
      const id = m[1];
      return build(id, search);
    }
  }
  return href;
}
