import { execSync } from "node:child_process";
import fs from "node:fs";

import path from "node:path";

const moved = [];

function hide(target) {
  if (!fs.existsSync(target)) return;

  const backup = path.join(".android-temp", target.replace(/[\\/]/g, "__"));

  fs.mkdirSync(".android-temp", { recursive: true });

  fs.renameSync(target, backup);

  moved.push({ original: target, backup });

  console.log("Hidden:", target);
}

function restore() {
  for (const file of moved.reverse()) {
    fs.renameSync(file.backup, file.original);
    console.log("Restored:", file.original);
  }

  if (fs.existsSync(".android-temp")) {
    fs.rmSync(".android-temp", {
      recursive: true,
      force: true,
    });
  }
}

try {
  // Web-only routes
  hide("app/opengraph-image.tsx");
  hide("app/api");
  hide("app/robots.ts");
  hide("app/sitemap.ts");
  hide("app/edit-story");
  hide("app/all-genres");
  hide("app/category");
  hide("app/r");
  hide("app/story");

  execSync("next build", {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_PLATFORM: "android",
    },
  });
} finally {
  restore();
}
