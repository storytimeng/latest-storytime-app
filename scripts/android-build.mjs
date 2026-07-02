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
const GRADLE_TASK = RELEASE ? "assembleRelease" : "assembleDebug";

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

// ─── Main ─────────────────────────────────────────────────────────────────

try {
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
  hide(".env.local");

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
