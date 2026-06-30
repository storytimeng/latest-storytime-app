// scripts/android-gradle-only.mjs
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const RELEASE = process.argv.includes("--release");
const GRADLE_TASK = RELEASE ? "assembleRelease" : "assembleDebug";

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
    // fall through
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

function checkSigning() {
  const ksPropsPath = path.join("android", "keystore.properties");
  const hasLocalProps = fs.existsSync(ksPropsPath);
  const hasEnvSigning =
    process.env.ANDROID_KEYSTORE_PATH &&
    process.env.ANDROID_KEYSTORE_PASSWORD &&
    process.env.ANDROID_KEY_ALIAS &&
    process.env.ANDROID_KEY_PASSWORD;

  if (RELEASE && !hasLocalProps && !hasEnvSigning) {
    console.error(
      "\n✗ No signing config found.\n" +
        "  Expected android/keystore.properties OR ANDROID_KEYSTORE_* env vars.\n" +
        "  Release build will fail with 'storeFile not set'. Aborting before wasting a gradle run.\n",
    );
    process.exit(1);
  } else if (RELEASE) {
    console.log(
      `✓ Signing config: ${hasLocalProps ? "keystore.properties" : "environment variables"}`,
    );
  }
}

checkSigning();

const ANDROID_SDK = detectAndroidSdk();
const JAVA_HOME = detectJavaHome();

if (!ANDROID_SDK) {
  console.warn("⚠  Could not auto-detect Android SDK. Set ANDROID_HOME.");
} else {
  console.log("✓ ANDROID_HOME:", ANDROID_SDK);
}
if (!JAVA_HOME) {
  console.warn("⚠  Could not auto-detect JAVA_HOME. Gradle may fail.");
} else {
  console.log("✓ JAVA_HOME:", JAVA_HOME);
}

const buildEnv = {
  ...process.env,
  ...(ANDROID_SDK && {
    ANDROID_HOME: ANDROID_SDK,
    ANDROID_SDK_ROOT: ANDROID_SDK,
  }),
  ...(JAVA_HOME && { JAVA_HOME }),
};

console.log(`\nRunning gradlew ${GRADLE_TASK}...\n`);
const gradlew = process.platform === "win32" ? ".\\gradlew.bat" : "./gradlew";
execSync(`${gradlew} ${GRADLE_TASK}`, {
  stdio: "inherit",
  cwd: path.resolve("android"),
  env: buildEnv,
});
