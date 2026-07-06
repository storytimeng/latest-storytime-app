"use client";

/**
 * inflightRequestRegistry
 *
 * A tiny, page-scoped registry of in-flight requests that need
 * to be cancelled when the page goes away. The motivation is
 * that some of the heavier flows in the read view (image blob
 * downloads, large batch fetches, non-SWR fan-outs) don't go
 * through SWR, and SWR's own abort-on-unmount behaviour doesn't
 * cover them. Without an explicit registry, a user leaving the
 * page can leave behind a 3-10 MB blob download that lands in
 * the cache after the page is gone, eating the user's data plan
 * and showing up as a "ghost request" in the backend logs.
 *
 * The shape is intentionally minimal:
 *
 *   const controller = new AbortController();
 *   registerInflight("read-view", controller);
 *   try {
 *     const res = await fetch(url, { signal: controller.signal });
 *     ...
 *   } finally {
 *     unregisterInflight("read-view", controller);
 *   }
 *
 *   usePageCleanup("read-view", () => {
 *     cancelPageInflight("read-view");
 *   });
 *
 * On unmount, `cancelPageInflight` aborts every controller
 * registered under that page id. Centralising it here means a
 * page can fan out N requests in parallel and rely on a single
 * cleanup call to kill them all.
 *
 * Notes:
 *   - This is intentionally NOT a global abort-all registry;
 *     pages are scoped so a parent layout's unmount doesn't
 *     stomp on a child page's still-in-flight requests.
 *   - The registry is best-effort: a controller that was already
 *     aborted is skipped silently. No state is held beyond the
 *     Set itself.
 */

type PageId = string;

const byPage = new Map<PageId, Set<AbortController>>();

export function registerInflight(pageId: PageId, controller: AbortController) {
  let set = byPage.get(pageId);
  if (!set) {
    set = new Set();
    byPage.set(pageId, set);
  }
  set.add(controller);
}

export function unregisterInflight(
  pageId: PageId,
  controller: AbortController,
) {
  const set = byPage.get(pageId);
  if (!set) return;
  set.delete(controller);
  if (set.size === 0) byPage.delete(pageId);
}

/** Cancel every in-flight request registered under `pageId`. */
export function cancelPageInflight(pageId: PageId) {
  const set = byPage.get(pageId);
  if (!set) return;
  for (const controller of set) {
    try {
      controller.abort();
    } catch {
      // Defensive: a polyfill could throw. We still want the
      // other controllers to abort.
    }
  }
  byPage.delete(pageId);
}

/** Cancel every in-flight request across every page. Used
 *  sparingly — typically only on full app teardown. */
export function cancelAllInflight() {
  for (const pageId of Array.from(byPage.keys())) {
    cancelPageInflight(pageId);
  }
}

/** Test-only. Returns the number of in-flight requests across
 *  all pages. */
export function inflightCount(): number {
  let n = 0;
  for (const set of byPage.values()) n += set.size;
  return n;
}
