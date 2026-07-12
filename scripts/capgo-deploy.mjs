#!/usr/bin/env node
/**
 * capgo-deploy.mjs
 * -----------------------------------------------------------------------------
 * One-shot "build web → sync to android → upload bundle to Capgo" runner for
 * the laptop. Mirrors what the `android-build.yml` workflow does, minus the
 * Gradle APK assemble (so you can iterate on web-only changes in seconds).
 *
 * Usage:
 *   pnpm run capgo:dev      # build + push to the `dev` channel
 *   pnpm run capgo:prod     # build + push to the `production` channel
 *   pnpm run capgo:dry      # build only, skip the upload (sanity check)
 *
 * Required env vars (put them in a local `.env.capgo` or your shell):
 *   CAPGO_API_KEY   – the new key from scripts/rotate-capgo-key.sql
 *   CAPGO_API_HOST  – e.g. https://xssneissyscmaibeoojq.supabase.co/functions/v1
 *   CAPGO_SUPA_HOST – e.g. https://xssneissyscmaibeoojq.supabase.co
 *   CAPGO_SUPA_ANON – the publishable anon key (already in capacitor.config.ts)
 *
 * Optional:
 *   CAPGO_CHANNEL   – override the channel (defaults to `dev` unless --prod)
 *   CAPGO_BUNDLE    – pin the bundle version (defaults to "0.0.1-<timestamp>")
 * -----------------------------------------------------------------------------
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── tiny .env loader (avoids the dotenv dep just for two files) ──────────
function loadEnv(file) {
  const p = path.join(ROOT, file);
  if (!existsSync(p)) return;
  for (const raw of readFileSync(p, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i);
    if (!m) continue;
    const [, k, v] = m;
    if (process.env[k] === undefined) {
      process.env[k] = v.replace(/^['"]|['"]$/g, "");
    }
  }
}
loadEnv(".env.capgo");
loadEnv(".env.capgo.local");

// ── args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const PROD = args.includes("--prod");
const VERBOSE = args.includes("--verbose");

const CHANNEL = process.env.CAPGO_CHANNEL || (PROD ? "production" : "dev");
const BUNDLE = process.env.CAPGO_BUNDLE || `0.0.1-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`;

// ── helpers ───────────────────────────────────────────────────────────────
function run(cmd, opts = {}) {
  const display = Array.isArray(cmd) ? cmd.join(" ") : cmd;
  console.log(`\n▸ ${display}`);
  const r = spawnSync(cmd, { stdio: "inherit", shell: true, cwd: ROOT, ...opts });
  if (r.status !== 0) {
    console.error(`✗ ${display} exited with code ${r.status}`);
    process.exit(r.status ?? 1);
  }
}

function need(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`✗ Missing env var: ${name}`);
    console.error(`  Add it to .env.capgo.local or your shell, then re-run.`);
    process.exit(2);
  }
  return v;
}

function banner(s) {
  console.log("\n" + "═".repeat(72));
  console.log("  " + s);
  console.log("═".repeat(72));
}

// ── 1. guard ──────────────────────────────────────────────────────────────
banner("Capgo deploy — laptop");
console.log(`  channel  : ${CHANNEL}`);
console.log(`  bundle   : ${BUNDLE}`);
console.log(`  api host : ${process.env.CAPGO_API_HOST || "(not set)"}`);
console.log(`  dry run  : ${DRY}`);

need("CAPGO_API_KEY");
if (!DRY) {
  need("CAPGO_API_HOST");
}

// ── 2. web build (static export for android) ──────────────────────────────
// Re-uses the same env vars the workflow uses, with the back.storytime.ng
// fallback if NEXT_PUBLIC_API_URL isn't set.
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://back.storytime.ng";
const webEnv = {
  ...process.env,
  NEXT_PUBLIC_PLATFORM: "android",
  NEXT_PUBLIC_API_URL: apiUrl,
  NEXT_PUBLIC_BACKEND_URL: apiUrl,
  NEXT_PUBLIC_DEBUG_PROXY: "false",
  NEXT_PUBLIC_PROXY: "false",
};

if (existsSync(path.join(ROOT, "out"))) {
  console.log("▸ cleaning previous out/");
  rmSync(path.join(ROOT, "out"), { recursive: true, force: true });
}

banner("1/3 — build web static export");
run(["node", "scripts/android-build.mjs", "--no-apk"], { env: webEnv });

// ── 3. sync to android assets (so the APK picks it up on next build) ─────
banner("2/3 — cap sync android");
run(["pnpm", "exec", "cap", "sync", "android"]);

if (DRY) {
  banner("Dry run — skipping Capgo upload");
  process.exit(0);
}

// ── 4. upload to Capgo (TUS via Supabase Storage) ────────────────────────
banner("3/3 — upload to Capgo");
run(
  [
    "npx",
    "--yes",
    "@capgo/cli@latest",
    "bundle",
    "upload",
    "com.storytimeng",
    "--apikey", process.env.CAPGO_API_KEY,
    "--channel", CHANNEL,
    "--path", "out",
    "--tus",
    "--no-code-check",
    "--bundle", BUNDLE,
    "--comment", `Laptop deploy @ ${new Date().toISOString()}`,
    ...(VERBOSE ? ["--verbose"] : []),
  ],
  {
    env: {
      ...process.env,
      CAPGO_API_HOST: process.env.CAPGO_API_HOST,
      CAPGO_SUPA_HOST: process.env.CAPGO_SUPA_HOST || "https://xssneissyscmaibeoojq.supabase.co",
      CAPGO_SUPA_ANON: process.env.CAPGO_SUPA_ANON || "sb_publishable_wMAICJbQ1OYszQudDGg3sA_rMm1jFpC",
    },
  }
);

banner("Done ✓");
console.log(`Bundle ${BUNDLE} pushed to channel '${CHANNEL}'.`);
console.log("Open the Capgo dashboard → Devices to see it delivered to your dev app.\n");
