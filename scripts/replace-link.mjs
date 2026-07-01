/**
 * scripts/replace-link.mjs
 *
 * One-off script: rewrites every `import Link from "next/link";` in the
 * codebase to use the platform-aware AppLink component, and likewise for
 * NavLink if any. Safe to re-run; it skips files that already import
 * from @/components/AppLink.
 *
 * Usage:
 *   node scripts/replace-link.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import fastGlob from "fast-glob";
import path from "node:path";

const { glob } = fastGlob;

const ROOT = process.cwd();
const patterns = [
  "app/**/*.{ts,tsx}",
  "components/**/*.{ts,tsx}",
  "views/**/*.{ts,tsx}",
  "src/**/*.{ts,tsx}",
  "hooks/**/*.{ts,tsx}",
  "lib/**/*.{ts,tsx}",
];

const files = await glob(patterns, {
  cwd: ROOT,
  absolute: true,
  ignore: [
    "**/node_modules/**",
    "**/.next/**",
    "**/out/**",
    "**/android/**",
    "**/ios/**",
    "android-pages/**", // handled separately by build script
    "node_modules/**",
  ],
});

let updated = 0;
let skipped = 0;

for (const file of files) {
  const original = await readFile(file, "utf8");

  // Skip files that already import from AppLink
  if (
    original.includes("@/components/AppLink") ||
    original.includes('"components/AppLink"')
  ) {
    skipped++;
    continue;
  }

  let next = original;
  let changed = false;

  // Replace `import Link from "next/link";`
  const re1 = /import\s+Link\s+from\s+["']next\/link["'];?/g;
  if (re1.test(next)) {
    next = next.replace(re1, 'import { Link } from "@/components/AppLink";');
    changed = true;
  }

  // Replace `import { default as Link } from "next/link";` style
  const re2 =
    /import\s+\{\s*default\s+as\s+Link\s*\}\s+from\s+["']next\/link["'];?/g;
  if (re2.test(next)) {
    next = next.replace(re2, 'import { Link } from "@/components/AppLink";');
    changed = true;
  }

  if (changed) {
    await writeFile(file, next, "utf8");
    console.log(`✓ ${path.relative(ROOT, file)}`);
    updated++;
  }
}

console.log(
  `\nUpdated ${updated} file(s); skipped ${skipped} (already migrated).`,
);
