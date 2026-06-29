/**
 * android-build.mjs
 *
 * Builds the Next.js app as a static export for Capacitor Android, then
 * optionally runs `gradlew assembleDebug` or `gradlew assembleRelease`.
 *
 * Usage:
 *   node scripts/android-build.mjs            # debug APK (default)
 *   node scripts/android-build.mjs --release  # release APK
 *   node scripts/android-build.mjs --no-apk   # Next.js export + cap sync only
 *
 * Strategy:
 *  1. Swap android-pages/<route>/page.tsx  →  app/<route>/page.tsx
 *     (originals are backed up as app/<route>/page.tsx.web.bak)
 *  2. Hide purely web-only files (api, robots, sitemap, opengraph-image)
 *     by moving them to .android-temp/
 *  3. Run `next build`  (NEXT_PUBLIC_PLATFORM=android)
 *  4. Run `cap sync android`  (copies out/ → android assets)
 *  5. Optionally run `gradlew assembleDebug|assembleRelease`
 *  6. Restore everything in the `finally` block
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// ─── CLI flags ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const RELEASE = args.includes("--release");
const NO_APK = args.includes("--no-apk");
const GRADLE_TASK = RELEASE ? "assembleRelease" : "assembleDebug";

// ─── Environment auto-detection ───────────────────────────────────────────────

function detectAndroidSdk() {
  // 1. Already set correctly
  const existing = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (existing && fs.existsSync(path.join(existing, "platform-tools"))) {
    return existing;
  }

  // 2. Common Windows locations
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
  // Already set and valid
  const existing = process.env.JAVA_HOME;
  if (existing && fs.existsSync(path.join(existing, "bin"))) return existing;

  // Android Studio bundled JDK (Windows)
  const bundled = [
    "C:\\Program Files\\Android\\jdk",
    "C:\\Program Files\\Android\\Android Studio\\jbr",
    "C:\\Program Files\\Android\\Android Studio\\jre",
  ];
  for (const p of bundled) {
    if (fs.existsSync(path.join(p, "bin"))) return p;
  }

  // Standalone JDK
  const javaBase = "C:\\Program Files\\Java";
  if (fs.existsSync(javaBase)) {
    const jdks = fs
      .readdirSync(javaBase)
      .filter((d) => fs.existsSync(path.join(javaBase, d, "bin")))
      .sort()
      .reverse(); // prefer newer versions
    if (jdks.length > 0) return path.join(javaBase, jdks[0]);
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
  // Write local.properties so Gradle can find the SDK
  const localProps = `sdk.dir=${ANDROID_SDK.replace(/\\/g, "\\\\")}`;
  fs.writeFileSync(path.join("android", "local.properties"), localProps, "utf8");
}

if (!JAVA_HOME) {
  console.warn("⚠  Could not auto-detect JAVA_HOME. Gradle may fail.");
} else {
  console.log("✓ JAVA_HOME:", JAVA_HOME);
}

// Build-time environment
const buildEnv = {
  ...process.env,
  NEXT_PUBLIC_PLATFORM: "android",
  ...(ANDROID_SDK && { ANDROID_HOME: ANDROID_SDK, ANDROID_SDK_ROOT: ANDROID_SDK }),
  ...(JAVA_HOME && { JAVA_HOME }),
};

// ─── File swap helpers ────────────────────────────────────────────────────────

const swapped = []; // { appPath, bakPath }
const hidden = [];  // { original, backup }

/**
 * Swap android-pages/<rel> → app/<rel>
 * The original is saved as app/<rel>.web.bak so it is never deleted.
 */
function swapAndroidPage(rel) {
  const src = path.join("android-pages", rel);
  const dest = path.join("app", rel);
  const bak = dest + ".web.bak";

  if (!fs.existsSync(src)) return;

  // Back up original web version if it exists
  if (fs.existsSync(dest)) {
    fs.renameSync(dest, bak);
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  swapped.push({ appPath: dest, bakPath: bak });
  console.log(`  ↔  Swapped: android-pages/${rel} → app/${rel}`);
}

/**
 * Hide a file or directory that has no Android equivalent.
 * The original is moved to .android-temp/ and restored after build.
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
 * Restore everything – always called in `finally`.
 */
function restore() {
  console.log("\n🔄 Restoring files...");

  // Restore swapped android pages (remove temp, put web original back)
  for (const { appPath, bakPath } of swapped.reverse()) {
    if (fs.existsSync(appPath)) fs.unlinkSync(appPath);
    if (fs.existsSync(bakPath)) {
      fs.renameSync(bakPath, appPath);
      console.log(`  ↩  Restored: ${appPath}`);
    }
  }

  // Restore hidden files
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

// ─── Main ─────────────────────────────────────────────────────────────────────

try {
  console.log("\n📱 Storytime Android Build\n");
  console.log(`Mode: ${RELEASE ? "RELEASE" : "DEBUG"}${NO_APK ? " (export + sync only)" : ""}\n`);

  // ── 1. Swap android-pages overrides into app/ ──────────────────────────────
  console.log("Step 1: Swapping Android page overrides...");
  swapAndroidPage("category/page.tsx");
  swapAndroidPage("category/[slug]/page.tsx");
  swapAndroidPage("all-genres/[id]/page.tsx");
  swapAndroidPage("story/[id]/page.tsx");
  swapAndroidPage("story/[id]/read/page.tsx");
  swapAndroidPage("story/[id]/read/client.tsx");
  swapAndroidPage("r/[slug]/page.tsx");
  swapAndroidPage("r/[slug]/client.tsx");
  swapAndroidPage("edit-story/[id]/page.tsx");

  // ── 2. Hide web-only files (no Android equivalent) ─────────────────────────
  console.log("\nStep 2: Hiding web-only routes...");
  hide("app/opengraph-image.tsx");
  hide("app/api");
  hide("app/robots.ts");
  hide("app/sitemap.ts");

  // ── 3. Next.js static export ───────────────────────────────────────────────
  console.log("\nStep 3: Building Next.js static export...\n");
  execSync("next build", { stdio: "inherit", env: buildEnv });

  // ── 4. Capacitor sync ──────────────────────────────────────────────────────
  console.log("\nStep 4: Running cap sync android...\n");
  execSync("pnpm exec cap sync android", { stdio: "inherit", env: buildEnv });

  // ── 5. Gradle APK build ────────────────────────────────────────────────────
  if (!NO_APK) {
    console.log(`\nStep 5: Running gradlew ${GRADLE_TASK}...\n`);
    const gradlew = process.platform === "win32" ? ".\\gradlew.bat" : "./gradlew";
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
