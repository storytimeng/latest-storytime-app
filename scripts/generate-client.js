const { execSync } = require("child_process");
require("dotenv").config({ path: ".env.local" });
// Fall back to .env when .env.local is absent so config-defined
// env vars (e.g. NEXT_PUBLIC_API_DOCS_URL in openapi-ts.config.ts)
// are visible to the @hey-api/openapi-ts child process.
require("dotenv").config();

try {
  execSync('npx "@hey-api/openapi-ts" -c "@hey-api/client-next"', {
    stdio: "inherit",
  });
  console.log("✅ Hey-API client generated successfully!");
} catch (err) {
  console.error("❌ Failed to generate client:", err);
  process.exit(1);
}
