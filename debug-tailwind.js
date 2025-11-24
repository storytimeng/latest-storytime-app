import fg from "fast-glob";
import config from "./tailwind.config.mjs"; // ESM import

console.log("🔍 Tailwind Content Debug\n");

config.content.forEach((pattern) => {
  const files = fg.sync(pattern, { dot: true });

  console.log(`Pattern: ${pattern}`);
  console.log(`Matches: ${files.length}`);
  if (files.length > 0) {
    console.log(
      files
        .slice(0, 10)
        .map((f) => "  - " + f)
        .join("\n")
    );
    if (files.length > 10) console.log("  ...");
  }
  console.log("\n");
});
