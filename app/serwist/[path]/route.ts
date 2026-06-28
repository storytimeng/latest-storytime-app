import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

// Use the current git HEAD as the precache revision so each deploy
// invalidates the precache. Falls back to a timestamp outside git checkouts.
const revision =
  spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf-8",
  }).stdout?.trim() || `${Date.now()}`;

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    // /~offline is the URL Serwist serves when a navigation request fails.
    // /offline is your existing offline page so legacy fallbacks still work.
    additionalPrecacheEntries: [
      { url: "/~offline", revision },
      { url: "/offline", revision },
    ],
    swSrc: "app/sw.ts",
    // Use the native esbuild binary (faster) instead of esbuild-wasm.
    useNativeEsbuild: true,
  });
