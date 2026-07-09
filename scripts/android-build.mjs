/**
 * android-build.mjs
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// ─── CLI flags ────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const RELEASE = args.includes("--release");
const NO_APK = args.includes("--no-apk");
const RESTORE_ONLY = args.includes("--restore-only");
const GRADLE_TASK = RELEASE ? "assembleRelease" : "assembleDebug";
const NEXT_BUILD_WAIT_MS = 2 * 60 * 1000;
const NEXT_BUILD_MAX_WAIT_MS = 10 * 60 * 1000;

// ─── Environment auto-detection ────────────────────────────────────────────

function detectAndroidSdk() {
  const existing = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (existing && fs.existsSync(path.join(existing, "platform-tools"))) {
    return existing;
  }
  const candidates = [
    path.join(os.homedir(), "AppData", "Local", "Android", "Sdk"),
    "C:\\Android\\Sdk",
    "C:\\Program Files\\Android\\Sdk",
    "C:\\Program Files (x86)\\Android\\Sdk",
  ];
  for (const p of candidates) {
    if (fs.existsSync(path.join(p, "platform-tools"))) return p;
  }
  return null;
}

function detectJavaHome() {
  const existing = process.env.JAVA_HOME;
  if (existing && fs.existsSync(path.join(existing, "bin"))) {
    return existing;
  }
  try {
    const javaBin =
      process.platform === "win32"
        ? execSync("where java", { encoding: "utf8" }).split(/\r?\n/)[0].trim()
        : execSync("which java", { encoding: "utf8" }).trim();
    if (javaBin) {
      const candidate = path.resolve(javaBin, "..", "..");
      if (fs.existsSync(path.join(candidate, "bin"))) return candidate;
    }
  } catch {
    // `java` not on PATH, fall through
  }
  const searchDirs =
    process.platform === "win32"
      ? [
          "C:\\Program Files\\Java",
          "C:\\Program Files (x86)\\Java",
          "C:\\Program Files\\Eclipse Adoptium",
          "C:\\Program Files\\Android\\Android Studio\\jbr",
          "C:\\Program Files\\Android\\jdk",
          path.join(
            os.homedir(),
            "AppData",
            "Local",
            "Programs",
            "Eclipse Adoptium",
          ),
          path.join(os.homedir(), ".jdks"),
        ]
      : process.platform === "darwin"
        ? [
            "/Library/Java/JavaVirtualMachines",
            "/opt/homebrew/opt",
            "/usr/local/opt",
            path.join(os.homedir(), ".jdks"),
            "/Applications/Android Studio.app/Contents/jbr/Contents/Home",
          ]
        : [
            "/usr/lib/jvm",
            "/opt/jdk",
            path.join(os.homedir(), ".jdks"),
            "/usr/lib/android-studio/jbr",
          ];
  const found = [];
  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;
    if (
      fs.existsSync(
        path.join(
          dir,
          "bin",
          process.platform === "win32" ? "java.exe" : "java",
        ),
      )
    ) {
      found.push(dir);
      continue;
    }
    try {
      for (const entry of fs.readdirSync(dir)) {
        const sub = path.join(dir, entry);
        const macNested = path.join(sub, "Contents", "Home");
        if (fs.existsSync(path.join(sub, "bin"))) found.push(sub);
        else if (fs.existsSync(path.join(macNested, "bin")))
          found.push(macNested);
      }
    } catch {
      // unreadable dir, skip
    }
  }
  if (found.length > 0) {
    found.sort().reverse();
    return found[0];
  }
  return null;
}

const ANDROID_SDK = detectAndroidSdk();
const JAVA_HOME = detectJavaHome();

if (!ANDROID_SDK) {
  console.warn(
    "⚠  Could not auto-detect Android SDK. Set ANDROID_HOME or ensure SDK is installed.",
  );
} else {
  console.log("✓ Android SDK:", ANDROID_SDK);
  const localProps = `sdk.dir=${ANDROID_SDK.replace(/\\/g, "\\\\")}`;
  fs.writeFileSync(
    path.join("android", "local.properties"),
    localProps,
    "utf8",
  );
}

if (!JAVA_HOME) {
  console.warn("⚠  Could not auto-detect JAVA_HOME. Gradle may fail.");
} else {
  console.log("✓ JAVA_HOME:", JAVA_HOME);
}

const buildEnv = {
  ...process.env,
  NEXT_PUBLIC_PLATFORM: "android",
  ...(ANDROID_SDK && {
    ANDROID_HOME: ANDROID_SDK,
    ANDROID_SDK_ROOT: ANDROID_SDK,
  }),
  ...(JAVA_HOME && { JAVA_HOME }),
};

/**
 * If the spawned Next.js process can't see NEXT_PUBLIC_API_URL (e.g. on
 * a machine where .env.local is missing and the GitHub workflow hasn't
 * pre-populated the env), the audio player and every other consumer of
 * that var fall back to localhost. The CI workflow DOES write a fresh
 * .env.local before invoking us, but local dev machines sometimes
 * don't have one — parse the existing file (if any) and inject any
 * NEXT_PUBLIC_* keys we don't already have.
 */
function loadEnvFileIntoBuildEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  try {
    const contents = fs.readFileSync(filePath, "utf8");
    for (const rawLine of contents.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      // Strip surrounding quotes if present.
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      // Only seed vars that aren't already in process.env — explicit
      // env wins over file contents, which is what the user expects.
      if (key && process.env[key] === undefined) {
        buildEnv[key] = value;
      }
    }
  } catch (err) {
    console.warn(`⚠  Could not read ${filePath}:`, err.message);
  }
}
loadEnvFileIntoBuildEnv(".env.local");
loadEnvFileIntoBuildEnv(".env");
loadEnvFileIntoBuildEnv(".env.android");

/**
 * Resolve `NEXT_PUBLIC_BILLING_REVEAL_AT` from `NEXT_PUBLIC_BILLING_REVEAL_DAYS`
 * (or accept an explicit ISO timestamp). Baked into the JS bundle so the
 * `lib/billingMode.ts` resolver can use it as a build-time clock — the
 * backend `/app-config` endpoint can still override it remotely via
 * `force: true`.
 *
 * Always uses build time (not install time) as the anchor so a user
 * clearing app data doesn't reset the clock.
 */
function resolveBillingRevealDate() {
  if (buildEnv.NEXT_PUBLIC_BILLING_REVEAL_AT) {
    // explicit ISO timestamp wins
    const parsed = new Date(buildEnv.NEXT_PUBLIC_BILLING_REVEAL_AT);
    if (!Number.isNaN(parsed.getTime())) {
      console.log(
        `✓ NEXT_PUBLIC_BILLING_REVEAL_AT: ${parsed.toISOString()} (explicit)`,
      );
      return;
    }
  }
  const days = Number(buildEnv.NEXT_PUBLIC_BILLING_REVEAL_DAYS ?? 30);
  if (!Number.isFinite(days) || days < 0) {
    console.warn(
      "⚠  NEXT_PUBLIC_BILLING_REVEAL_DAYS is not a non-negative number; defaulting to 30.",
    );
    buildEnv.NEXT_PUBLIC_BILLING_REVEAL_AT = new Date(
      Date.now() + 30 * 86400_000,
    ).toISOString();
  } else {
    buildEnv.NEXT_PUBLIC_BILLING_REVEAL_AT = new Date(
      Date.now() + days * 86400_000,
    ).toISOString();
  }
  console.log(
    `✓ NEXT_PUBLIC_BILLING_REVEAL_AT: ${buildEnv.NEXT_PUBLIC_BILLING_REVEAL_AT} (${days} days from build)`,
  );
}
resolveBillingRevealDate();

/**
 * Fail fast if NEXT_PUBLIC_API_URL is missing. This is a compile-time
 * inlined value — if it's blank when `next build` runs, every consumer
 * (audio player, API client, etc.) silently falls back to localhost in
 * the shipped APK, and there's no way to fix it after the fact since
 * Capacitor just serves the static bundle with no env to read at
 * runtime. Better to hard-fail here than ship a broken build.
 */
function checkRequiredPublicEnv() {
  const required = ["NEXT_PUBLIC_API_URL"];
  const missing = required.filter((key) => !buildEnv[key]);
  if (missing.length > 0) {
    console.error(
      `\n❌ Missing required env var(s): ${missing.join(", ")}\n` +
        "   These are inlined into the JS bundle at build time — if they're\n" +
        "   blank, the app silently falls back to localhost at runtime and\n" +
        "   there's no way to fix it after the APK is built.\n\n" +
        "   Local dev: set them in .env.local at the repo root.\n" +
        "   CI: check the repo's Actions → Variables tab (not Secrets) —\n" +
        "   an unset `vars.X` reference resolves to an empty string\n" +
        "   silently, it does not fail the workflow.\n",
    );
    process.exit(1);
  }
  for (const key of required) {
    console.log(`✓ ${key}:`, buildEnv[key]);
  }
}
checkRequiredPublicEnv();

// ─── Helpers ────────────────────────────────────────────────────────────────

const hidden = []; // { original, backup }
const restructured = []; // undo callbacks, run in reverse order

/**
 * Hide a file or directory that has no Android equivalent, or that
 * relies on generateStaticParams → single fallback id, which only
 * resolves real values under SSR (dynamicParams) and 404s under
 * static export (no server to fall back to).
 */
function hide(target) {
  if (!fs.existsSync(target)) return;
  const backup = path.join(".android-temp", target.replace(/[\\/]/g, "__"));
  fs.mkdirSync(".android-temp", { recursive: true });
  fs.renameSync(target, backup);
  hidden.push({ original: target, backup });
  console.log(`  🙈 Hidden: ${target}`);
}

/**
 * Write a temporary file (doesn't exist beforehand, or gets overwritten).
 * Restored/removed after build. Used when a flattened page needs a file
 * that currently only lives inside a folder about to be hidden.
 */
function writeTempFile(dest, content) {
  const existed = fs.existsSync(dest);
  const backupContent = existed ? fs.readFileSync(dest, "utf8") : null;

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content, "utf8");

  restructured.push(() => {
    if (existed) {
      fs.writeFileSync(dest, backupContent, "utf8");
      console.log(`  ↩  Restored original: ${dest}`);
    } else {
      fs.unlinkSync(dest);
      console.log(`  ↩  Removed temp file: ${dest}`);
    }
  });
  console.log(`  📄 Wrote temp file: ${dest}`);
}

function checkSigning() {
  const ksPropsPath = path.join("android", "keystore.properties");
  const hasLocalProps = fs.existsSync(ksPropsPath);
  const hasEnvSigning =
    process.env.ANDROID_KEYSTORE_PATH &&
    process.env.ANDROID_KEYSTORE_PASSWORD &&
    process.env.ANDROID_KEY_ALIAS &&
    process.env.ANDROID_KEY_PASSWORD;

  if (RELEASE && !hasLocalProps && !hasEnvSigning) {
    console.warn(
      "⚠  No signing config found — neither android/keystore.properties nor ANDROID_KEYSTORE_* env vars are set.\n" +
        "   The release build WILL fail with 'storeFile not set'.",
    );
  } else if (RELEASE) {
    console.log(
      `✓ Signing config: ${hasLocalProps ? "keystore.properties" : "environment variables"}`,
    );
  }
}
checkSigning();

// ─── r's client, copied out of [slug] before that folder is hidden ─────────

const R_CLIENT_CONTENT = `"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:3001";

export default function ReferralClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) {
      router.replace("/auth/signup");
      return;
    }

    const resolve = async () => {
      try {
        const res = await fetch(
          \`\${API_BASE.replace(/\\/$/, "")}/ambassadors/referrals/resolve/\${encodeURIComponent(slug)}\`,
        );

        if (res.ok) {
          const json = await res.json();
          const data = json?.data ?? json;
          const referralCode = data?.referralCode?.trim();

          if (referralCode) {
            router.replace(\`/auth/signup?ref=\${encodeURIComponent(referralCode)}\`);
            return;
          }
        }
      } catch {
        setError(true);
      }

      router.replace("/auth/signup");
    };

    resolve();
  }, [slug, router]);

  if (error) return null;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
}
`;

const R_PAGE_FIXED_IMPORT = `"use client";

import ReferralClient from "./client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ReferralEntryInner() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? "";

  return <ReferralClient slug={slug} />;
}

export default function ReferralEntryPage() {
  return (
    <Suspense fallback={null}>
      <ReferralEntryInner />
    </Suspense>
  );
}
`;

function restore() {
  console.log("\n🔄 Restoring files...");

  for (const undo of restructured.reverse()) {
    undo();
  }

  for (const { original, backup } of hidden.reverse()) {
    if (fs.existsSync(backup)) {
      fs.renameSync(backup, original);
      console.log(`  ↩  Restored: ${original}`);
    }
  }

  if (fs.existsSync(".android-temp")) {
    fs.rmSync(".android-temp", { recursive: true, force: true });
  }
}

/**
 * Best-effort restore for leftover backups from a previous crashed run.
 * This does NOT rely on the in-memory `hidden`/`restructured` arrays, so it
 * can be safely called at the start of a fresh process or via --restore-only.
 */
function restoreStaleBackups() {
  if (!fs.existsSync(".android-temp")) return;

  console.warn(
    "\n⚠  Detected leftover .android-temp from a previous Android build. " +
      "Attempting to restore hidden files before continuing...\n",
  );

  for (const entry of fs.readdirSync(".android-temp")) {
    const backup = path.join(".android-temp", entry);
    const original = entry.replace(/__/g, path.sep);
    const originalDir = path.dirname(original);
    if (!fs.existsSync(originalDir)) {
      fs.mkdirSync(originalDir, { recursive: true });
    }
    if (!fs.existsSync(original)) {
      fs.renameSync(backup, original);
      console.log(`  ↩  Restored stale backup: ${original}`);
    } else {
      // If the original already exists, discard the stale backup.
      fs.rmSync(backup, { recursive: true, force: true });
      console.log(`  🗑  Removed stale backup (original exists): ${original}`);
    }
  }

  fs.rmSync(".android-temp", { recursive: true, force: true });
  console.log("\n✓ Stale Android build backups restored.\n");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasNextBuildLock() {
  const possibleLocks = [
    path.join(".next", "build", "lock"),
    path.join(".next", "build.lock"),
  ];
  return possibleLocks.find((lockPath) => fs.existsSync(lockPath)) ?? null;
}

async function waitForNextBuildLock() {
  const startedAt = Date.now();
  let warned = false;

  while (true) {
    const lockPath = hasNextBuildLock();
    if (!lockPath) return;

    const waitedMs = Date.now() - startedAt;
    if (waitedMs >= NEXT_BUILD_MAX_WAIT_MS) {
      throw new Error(
        `Another Next.js build appears to still hold a lock at ${lockPath}. ` +
          `Waited ${Math.round(waitedMs / 1000)}s and aborting so the Android build does not proceed in a broken state.`,
      );
    }

    if (!warned) {
      console.warn(
        `\n⚠  Detected an existing Next.js build lock at ${lockPath}. ` +
          `Waiting up to ${Math.round(NEXT_BUILD_MAX_WAIT_MS / 60000)} minutes, checking every ${Math.round(NEXT_BUILD_WAIT_MS / 60000)} minutes...\n`,
      );
      warned = true;
    } else {
      console.warn(
        `⚠  Next.js build lock still present at ${lockPath}. Rechecking in ${Math.round(NEXT_BUILD_WAIT_MS / 60000)} minutes...`,
      );
    }

    await sleep(NEXT_BUILD_WAIT_MS);
  }
}

// Defensive cleanup on unexpected termination.
process.on("SIGINT", () => {
  console.warn(
    "\n⚠  Received SIGINT. Attempting to restore files before exit...",
  );
  try {
    restore();
  } finally {
    process.exit(1);
  }
});

process.on("SIGTERM", () => {
  console.warn(
    "\n⚠  Received SIGTERM. Attempting to restore files before exit...",
  );
  try {
    restore();
  } finally {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.error("\n❌ Uncaught exception in Android build script:", err);
  try {
    restore();
  } finally {
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason) => {
  console.error(
    "\n❌ Unhandled promise rejection in Android build script:",
    reason,
  );
  try {
    restore();
  } finally {
    process.exit(1);
  }
});

// ─── Main ─────────────────────────────────────────────────────────────────

try {
  // If the user only wants to recover from a previous crashed run, do that
  // first and exit without attempting a new build.
  if (RESTORE_ONLY) {
    restoreStaleBackups();
    process.exit(0);
  }

  // If a previous run left .android-temp on disk (e.g. hard crash before
  // finally/restore), clean that up before we start hiding files again.
  restoreStaleBackups();

  console.log("\n📱 Storytime Android Build\n");
  console.log(
    `Mode: ${RELEASE ? "RELEASE" : "DEBUG"}${NO_APK ? " (export + sync only)" : ""}\n`,
  );

  // ── 1. Hide web-only files (no Android equivalent) ──────────────────────
  console.log("Step 1: Hiding web-only routes...");
  hide("app/opengraph-image.tsx");
  hide("app/api");
  hide("app/robots.ts");
  hide("app/sitemap.ts");
  // NOTE: do NOT hide .env.local here. The release workflow writes
  // NEXT_PUBLIC_API_URL (and friends) into .env.local right before
  // invoking this script. Next.js reads .env.local at build time to
  // inline NEXT_PUBLIC_* values into the bundle. If we move it away
  // before `next build`, the audio player and every other consumer
  // of NEXT_PUBLIC_API_URL fall back to the default (localhost) and
  // the release build ships with a broken API base URL. The env file
  // doesn't need to be hidden — Capacitor/Cordova don't read it.

  // ── 2. Flatten/exclude dynamic-segment routes for static export ─────────
  // story/page.tsx, all-genres/page.tsx, edit-story/page.tsx, and
  // category/page.tsx already live in app/ as fully self-contained,
  // query-param-based flattened routes — no android-pages swap needed.
  // Their [id] siblings rely on generateStaticParams → a single fallback
  // id, which only resolves real ids under SSR; under static export
  // there's no server to fall back to, so any real id 404s. Since
  // nothing outside references into these folders, they're hidden
  // wholesale for the Android build and restored after.
  console.log("\nStep 2: Flattening dynamic routes...");

  hide("app/story/[id]");
  hide("app/all-genres/[id]");
  hide("app/edit-story/[id]");

  // r is the one exception: app/r/page.tsx imports its client from
  // "./[slug]/client" — a real cross-dependency into the folder we're
  // about to hide. Copy that client out and fix the import before hiding.
  writeTempFile("app/r/client.tsx", R_CLIENT_CONTENT);
  writeTempFile("app/r/page.tsx", R_PAGE_FIXED_IMPORT);
  hide("app/r/[slug]");

  // category/[slug] uses a fixed KNOWN_SLUGS list, not a runtime id —
  // every real slug gets a real file. Not hidden; left as a normal
  // static-export dynamic route.

  // ── 3. Next.js static export ─────────────────────────────────────────────
  console.log("\nStep 3: Building Next.js static export...\n");
  await waitForNextBuildLock();
  // Invoke Next.js' bin script directly via node, not via a bare
  // `next build` shell command. CI runners don't put node_modules/.bin
  // on PATH for shells spawned by execSync, so `next` isn't found
  // there even though pnpm just installed it. Resolving the script
  // via the package itself also sidesteps the .cmd-vs-shell-script
  // shim differences between Windows and Linux.
  const nextBin = require.resolve("next/dist/bin/next");
  execSync(`node "${nextBin}" build`, { stdio: "inherit", env: buildEnv });

  // ── 4. Capacitor sync ─────────────────────────────────────────────────────
  console.log("\nStep 4: Running cap sync android...\n");
  execSync("pnpm exec cap sync android", { stdio: "inherit", env: buildEnv });

  // ── 5. Gradle APK build ───────────────────────────────────────────────────
  if (!NO_APK) {
    console.log(`\nStep 5: Running gradlew ${GRADLE_TASK}...\n`);
    const gradlew =
      process.platform === "win32" ? ".\\gradlew.bat" : "./gradlew";
    execSync(`${gradlew} ${GRADLE_TASK}`, {
      stdio: "inherit",
      cwd: path.resolve("android"),
      env: buildEnv,
    });

    const apkDir = RELEASE
      ? path.join("android", "app", "build", "outputs", "apk", "release")
      : path.join("android", "app", "build", "outputs", "apk", "debug");

    console.log(`\n✅ APK ready in: ${apkDir}`);
  } else {
    console.log("\n✅ Export + sync complete (--no-apk, skipping Gradle).");
  }
} finally {
  restore();
}
